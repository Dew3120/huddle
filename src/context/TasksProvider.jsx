import { useEffect, useReducer, useRef, useState } from 'react';
import { isNetworkError } from '../api/client.js';
import {
  createTask,
  deleteTask as deleteTaskRequest,
  getTasks,
} from '../api/tasks.js';
import {
  closeTaskCache,
  createTaskCache,
  markTaskMutationConflict,
  queueTaskCreate,
  queueTaskDelete,
  queueTaskUpdate,
  readCachedTask,
  readCachedTasks,
  readTaskMutations,
  removeCachedTask,
  removeTaskMutation,
  replaceCachedTasks,
  retryTaskMutation,
  saveCachedTask,
} from '../db/taskCache.js';
import {
  mergeServerTasksWithMutations,
  synchronizeTaskMutations,
  updateTaskWithMerge,
} from '../services/taskSynchronization.js';
import { tasksReducer } from '../utils/tasksReducer.js';
import { TasksContext } from './TasksContext.js';

const statusOrder = ['todo', 'in-progress', 'done'];

function browserIsOnline() {
  return typeof navigator === 'undefined' || navigator.onLine;
}

function createLocalTask(taskDetails) {
  const randomId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return {
    ...taskDetails,
    id: `local:${randomId}`,
    status: 'todo',
    version: 0,
    syncState: 'pending',
  };
}

export default function TasksProvider({ children, userId }) {
  const [tasks, dispatch] = useReducer(tasksReducer, []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mutationError, setMutationError] = useState('');
  const [isOnline, setIsOnline] = useState(browserIsOnline);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [mutations, setMutations] = useState([]);
  const [reloadCount, setReloadCount] = useState(0);
  const cacheRef = useRef(null);
  const syncRunRef = useRef(null);

  function cacheIsActive(cache) {
    return cacheRef.current === cache;
  }

  async function refreshMutationState(cache) {
    const nextMutations = await readTaskMutations(cache);

    if (cacheIsActive(cache)) {
      setMutations(nextMutations);
    }

    return nextMutations;
  }

  async function showCachedTasks(cache) {
    const cachedTasks = await readCachedTasks(cache);

    if (cacheIsActive(cache)) {
      dispatch({ type: 'loaded', tasks: cachedTasks });
      setLoading(false);
    }

    return cachedTasks;
  }

  async function synchronize(cache = cacheRef.current) {
    if (!cache) {
      return;
    }

    if (!browserIsOnline()) {
      if (cacheIsActive(cache)) {
        setIsOnline(false);
        await showCachedTasks(cache);
        await refreshMutationState(cache);
      }
      return;
    }

    if (syncRunRef.current?.cache === cache) {
      return syncRunRef.current.promise;
    }

    const operation = (async () => {
      if (cacheIsActive(cache)) {
        setSyncing(true);
        setSyncError('');
      }

      try {
        const syncResult = await synchronizeTaskMutations(cache);

        if (syncResult.offline) {
          if (cacheIsActive(cache)) {
            setIsOnline(false);
            setMutations(syncResult.mutations);
          }
          await showCachedTasks(cache);
          return;
        }

        const serverTasks = await getTasks();
        const [cachedTasks, remainingMutations] = await Promise.all([
          readCachedTasks(cache),
          readTaskMutations(cache),
        ]);
        const mergedTasks = mergeServerTasksWithMutations(
          serverTasks,
          cachedTasks,
          remainingMutations,
        );

        await replaceCachedTasks(cache, mergedTasks);

        if (cacheIsActive(cache)) {
          dispatch({ type: 'loaded', tasks: mergedTasks });
          setMutations(remainingMutations);
          setIsOnline(true);
          setError('');
          setLoading(false);
        }
      } catch (syncFailure) {
        if (isNetworkError(syncFailure)) {
          if (cacheIsActive(cache)) {
            setIsOnline(false);
          }
          await showCachedTasks(cache);
          await refreshMutationState(cache);
          return;
        }

        if (cacheIsActive(cache)) {
          setSyncError(
            syncFailure.message || 'Unable to synchronize task changes.',
          );
          setLoading(false);
        }
      } finally {
        if (cacheIsActive(cache)) {
          setSyncing(false);
        }
      }
    })();

    syncRunRef.current = { cache, promise: operation };

    try {
      await operation;
    } finally {
      if (syncRunRef.current?.promise === operation) {
        syncRunRef.current = null;
      }
    }
  }

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return undefined;
    }

    const cache = createTaskCache(userId);
    cacheRef.current = cache;
    let cancelled = false;

    setLoading(true);
    setError('');
    setSyncError('');
    setIsOnline(browserIsOnline());

    async function initialize() {
      try {
        const [cachedTasks, queuedMutations] = await Promise.all([
          readCachedTasks(cache),
          readTaskMutations(cache),
        ]);

        if (cancelled) {
          return;
        }

        setMutations(queuedMutations);

        if (cachedTasks.length > 0) {
          dispatch({ type: 'loaded', tasks: cachedTasks });
          setLoading(false);
        }

        if (browserIsOnline()) {
          await synchronize(cache);
        } else {
          setIsOnline(false);
          setLoading(false);
        }
      } catch (loadFailure) {
        if (!cancelled) {
          setError(loadFailure.message || 'Unable to open the task cache.');
          setLoading(false);
        }
      }
    }

    function handleOffline() {
      if (cacheIsActive(cache)) {
        setIsOnline(false);
      }
    }

    function handleOnline() {
      if (cacheIsActive(cache)) {
        setIsOnline(true);
        synchronize(cache);
      }
    }

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    initialize();

    return () => {
      cancelled = true;
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);

      if (cacheRef.current === cache) {
        cacheRef.current = null;
      }

      const activeSync =
        syncRunRef.current?.cache === cache
          ? syncRunRef.current.promise
          : Promise.resolve();
      activeSync.finally(() => closeTaskCache(cache).catch(() => {}));
    };
  }, [userId, reloadCount]);

  async function queueOfflineCreate(taskDetails) {
    const cache = cacheRef.current;
    const task = createLocalTask(taskDetails);

    await saveCachedTask(cache, task);
    await queueTaskCreate(cache, task);
    dispatch({ type: 'added', task });
    await refreshMutationState(cache);
    setIsOnline(false);
    return task;
  }

  async function addTask(taskDetails) {
    setMutationError('');
    const details = { ...taskDetails, status: 'todo' };

    if (!browserIsOnline()) {
      return queueOfflineCreate(details);
    }

    try {
      const task = await createTask(details);
      const cache = cacheRef.current;

      dispatch({ type: 'added', task });
      setIsOnline(true);

      if (cache) {
        await saveCachedTask(cache, task);
      }

      return task;
    } catch (requestError) {
      if (isNetworkError(requestError) && cacheRef.current) {
        return queueOfflineCreate(details);
      }

      setMutationError(requestError.message || 'Unable to create the task.');
      throw requestError;
    }
  }

  async function queueOfflineUpdate(task, changes, syncState = 'pending') {
    const cache = cacheRef.current;
    const queuedTask = {
      ...task,
      ...changes,
      syncState,
    };
    const queuedMutation = await queueTaskUpdate(
      cache,
      task.id,
      changes,
      task.version,
      task,
    );

    await saveCachedTask(cache, queuedTask);
    dispatch({ type: 'updated', id: task.id, changes: queuedTask });
    await refreshMutationState(cache);
    setIsOnline(false);

    return { queuedTask, queuedMutation };
  }

  async function updateTask(taskId, changes) {
    setMutationError('');
    const task = tasks.find((item) => item.id === taskId);

    if (!task) {
      return null;
    }

    changes = Object.fromEntries(
      Object.entries(changes).filter(([field, value]) => task[field] !== value),
    );

    if (Object.keys(changes).length === 0) {
      return task;
    }

    if (!browserIsOnline() || task.id.startsWith('local:') ||
        mutations.some((mutation) => mutation.taskId === taskId)) {
      const { queuedTask } = await queueOfflineUpdate(task, changes);
      return queuedTask;
    }

    try {
      const updatedTask = await updateTaskWithMerge(
        taskId, changes, task.version, task,
      );
      const cache = cacheRef.current;

      dispatch({
        type: 'updated',
        id: taskId,
        changes: updatedTask,
      });
      setIsOnline(true);

      if (cache) {
        await saveCachedTask(cache, updatedTask);
      }

      return updatedTask;
    } catch (requestError) {
      if (isNetworkError(requestError) && cacheRef.current) {
        const { queuedTask } = await queueOfflineUpdate(task, changes);
        return queuedTask;
      }

      if (requestError.code === 'TASK_CONFLICT' && cacheRef.current) {
        const cache = cacheRef.current;
        const { queuedTask, queuedMutation } = await queueOfflineUpdate(
          task,
          changes,
          'conflict',
        );
        await markTaskMutationConflict(
          cache,
          queuedMutation.queueId,
          requestError.details,
        );
        await saveCachedTask(cache, {
          ...queuedTask,
          syncState: 'conflict',
        });
        dispatch({
          type: 'updated',
          id: task.id,
          changes: { ...queuedTask, syncState: 'conflict' },
        });
        await refreshMutationState(cache);
        setIsOnline(true);
        return queuedTask;
      }

      setMutationError(requestError.message || 'Unable to update the task.');
      throw requestError;
    }
  }

  async function queueOfflineDelete(taskId) {
    const cache = cacheRef.current;

    await queueTaskDelete(cache, taskId);
    await removeCachedTask(cache, taskId);
    dispatch({ type: 'deleted', id: taskId });
    await refreshMutationState(cache);
    setIsOnline(false);
  }

  async function deleteTask(taskId) {
    setMutationError('');

    if (!browserIsOnline() || taskId.startsWith('local:')) {
      await queueOfflineDelete(taskId);
      return;
    }

    try {
      await deleteTaskRequest(taskId);
      const cache = cacheRef.current;

      dispatch({ type: 'deleted', id: taskId });
      setIsOnline(true);

      if (cache) {
        await removeCachedTask(cache, taskId);
      }
    } catch (requestError) {
      if (isNetworkError(requestError) && cacheRef.current) {
        await queueOfflineDelete(taskId);
        return;
      }

      setMutationError(requestError.message || 'Unable to delete the task.');
      throw requestError;
    }
  }

  async function moveTask(taskId, direction) {
    const task = tasks.find((item) => item.id === taskId);

    if (!task) {
      return;
    }

    const currentIndex = statusOrder.indexOf(task.status);
    const change = direction === 'right' ? 1 : -1;
    const nextStatus = statusOrder[currentIndex + change];

    if (nextStatus) {
      await updateTask(taskId, { status: nextStatus });
    }
  }

  async function keepServerVersion(queueId) {
    const cache = cacheRef.current;
    const mutation = mutations.find((item) => item.queueId === queueId);

    if (!cache || !mutation) {
      return;
    }

    const currentTask = mutation.conflict?.current;

    if (currentTask) {
      await saveCachedTask(cache, currentTask);
      dispatch({
        type: 'updated',
        id: mutation.taskId,
        changes: { ...currentTask, syncState: undefined },
      });
    }

    await removeTaskMutation(cache, queueId);
    await refreshMutationState(cache);
  }

  async function retryQueuedMutation(queueId) {
    const cache = cacheRef.current;
    const mutation = mutations.find((item) => item.queueId === queueId);

    if (!cache || !mutation) {
      return;
    }

    const baseVersion = mutation.conflict?.current?.version;
    await retryTaskMutation(cache, queueId, baseVersion);

    const task = await readCachedTask(cache, mutation.taskId);
    if (task) {
      const pendingTask = { ...task, syncState: 'pending' };
      await saveCachedTask(cache, pendingTask);
      dispatch({
        type: 'updated',
        id: task.id,
        changes: pendingTask,
      });
    }

    await refreshMutationState(cache);
    await synchronize(cache);
  }

  function retryLoading() {
    setReloadCount((count) => count + 1);
  }

  const conflicts = mutations.filter(
    (mutation) => mutation.state === 'conflict',
  );
  const failedMutations = mutations.filter(
    (mutation) => mutation.state === 'failed',
  );
  const pendingCount = mutations.filter(
    (mutation) => mutation.state === 'pending',
  ).length;
  const value = {
    tasks,
    loading,
    error,
    mutationError,
    isOnline,
    syncing,
    syncError,
    pendingCount,
    conflicts,
    failedMutations,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    retryLoading,
    retrySynchronization: () => synchronize(),
    keepServerVersion,
    retryQueuedMutation,
  };

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
}
