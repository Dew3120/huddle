import { useEffect, useReducer, useRef, useState } from 'react';
import {
  createTask,
  deleteTask as deleteTaskRequest,
  getTasks,
  updateTask as updateTaskRequest,
} from '../api/tasks.js';
import { tasksReducer } from '../utils/tasksReducer.js';
import { TasksContext } from './TasksContext.js';
import {
  createTaskCache,
  closeTaskCache,
  readCachedTasks,
  replaceCachedTasks,
  saveCachedTask,
  removeCachedTask,
} from '../db/taskCache.js';

const statusOrder = ['todo', 'in-progress', 'done'];

export default function TasksProvider({ children, userId }) {
  const [tasks, dispatch] = useReducer(tasksReducer, []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mutationError, setMutationError] = useState('');
  const [reloadCount, setReloadCount] = useState(0);
  const cacheRef = useRef(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const cache = createTaskCache(userId);
    cacheRef.current = cache;

    let cancelled = false;

    setLoading(true);
    setError('');

    async function loadData() {
      try {
        // Read cached tasks first and display them immediately
        const cachedTasks = await readCachedTasks(cache);
        if (!cancelled && cachedTasks.length > 0) {
          dispatch({ type: 'loaded', tasks: cachedTasks });
          setLoading(false);
        }

        // Refresh from the API when online
        const apiTasks = await getTasks();
        if (!cancelled) {
          dispatch({ type: 'loaded', tasks: apiTasks });
          setLoading(false);
          // Replace cache after a successful refresh
          await replaceCachedTasks(cache, apiTasks);
        }
      } catch (requestError) {
        if (!cancelled) {
          // If API is unavailable, check if we have cached tasks displayed
          const cachedTasks = await readCachedTasks(cache);
          if (cachedTasks.length === 0) {
            setError(requestError.message || 'An unexpected error occurred.');
          }
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
      if (cacheRef.current === cache) {
        cacheRef.current = null;
      }
      closeTaskCache(cache).catch(() => {});
    };
  }, [userId, reloadCount]);

  async function addTask(taskDetails) {
    setMutationError('');

    try {
      const task = await createTask({
        ...taskDetails,
        status: 'todo',
      });

      dispatch({
        type: 'added',
        task,
      });

      if (cacheRef.current) {
        await saveCachedTask(cacheRef.current, task);
      }

      return task;
    } catch (requestError) {
      setMutationError(requestError.message || 'Unable to create the task.');
      throw requestError;
    }
  }

  async function updateTask(taskId, changes) {
    setMutationError('');

    try {
      const task = await updateTaskRequest(taskId, changes);

      dispatch({
        type: 'updated',
        id: taskId,
        changes: task,
      });

      if (cacheRef.current) {
        await saveCachedTask(cacheRef.current, task);
      }

      return task;
    } catch (requestError) {
      setMutationError(requestError.message || 'Unable to update the task.');
      throw requestError;
    }
  }

  async function deleteTask(taskId) {
    setMutationError('');

    try {
      await deleteTaskRequest(taskId);

      dispatch({
        type: 'deleted',
        id: taskId,
      });

      if (cacheRef.current) {
        await removeCachedTask(cacheRef.current, taskId);
      }
    } catch (requestError) {
      setMutationError(requestError.message || 'Unable to delete the task.');
      throw requestError;
    }
  }

  async function moveTask(taskId, direction) {
    const task = tasks.find(
      (item) => item.id === taskId || item._id === taskId,
    );

    if (!task) {
      return;
    }

    const currentIndex = statusOrder.indexOf(task.status);
    const change = direction === 'right' ? 1 : -1;
    const nextStatus = statusOrder[currentIndex + change];

    if (nextStatus) {
      await updateTask(taskId, {
        status: nextStatus,
      });
    }
  }

  function retryLoading() {
    setReloadCount((count) => count + 1);
  }

  const value = {
    tasks,
    loading,
    error,
    mutationError,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    retryLoading,
  };

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
}
