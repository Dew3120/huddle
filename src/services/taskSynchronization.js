import { createTask, deleteTask, updateTask } from '../api/tasks.js';
import { isNetworkError } from '../api/client.js';
import {
  markTaskMutationConflict,
  markTaskMutationFailed,
  readCachedTask,
  readTaskMutations,
  removeCachedTask,
  removeTaskMutation,
  saveCachedTask,
} from '../db/taskCache.js';

function createPayload(task) {
  return {
    title: task.title,
    assignee: task.assignee,
    status: task.status,
    dueDate: task.dueDate,
  };
}

async function markCachedTask(cache, taskId, syncState) {
  const task = await readCachedTask(cache, taskId);

  if (task) {
    await saveCachedTask(cache, {
      ...task,
      syncState,
    });
  }
}

export async function synchronizeTaskMutations(cache) {
  const mutations = await readTaskMutations(cache);
  const outcomes = [];

  for (const mutation of mutations) {
    if (mutation.state !== 'pending') {
      continue;
    }

    try {
      if (mutation.type === 'create') {
        const task = await createTask(createPayload(mutation.task));
        await removeCachedTask(cache, mutation.taskId);
        await saveCachedTask(cache, task);
        outcomes.push({
          type: 'created',
          previousTaskId: mutation.taskId,
          task,
        });
      }

      if (mutation.type === 'update') {
        const task = await updateTask(mutation.taskId, {
          ...mutation.changes,
          version: mutation.baseVersion,
        });
        await saveCachedTask(cache, task);
        outcomes.push({ type: 'updated', task });
      }

      if (mutation.type === 'delete') {
        await deleteTask(mutation.taskId);
        await removeCachedTask(cache, mutation.taskId);
        outcomes.push({ type: 'deleted', taskId: mutation.taskId });
      }

      await removeTaskMutation(cache, mutation.queueId);
    } catch (error) {
      if (mutation.type === 'delete' && error.status === 404) {
        await removeCachedTask(cache, mutation.taskId);
        await removeTaskMutation(cache, mutation.queueId);
        outcomes.push({ type: 'deleted', taskId: mutation.taskId });
        continue;
      }

      if (error.code === 'TASK_CONFLICT') {
        await markTaskMutationConflict(cache, mutation.queueId, error.details);
        await markCachedTask(cache, mutation.taskId, 'conflict');
        outcomes.push({
          type: 'conflict',
          taskId: mutation.taskId,
          details: error.details,
        });
        continue;
      }

      if (isNetworkError(error)) {
        return {
          offline: true,
          outcomes,
          mutations: await readTaskMutations(cache),
        };
      }

      await markTaskMutationFailed(cache, mutation.queueId, {
        message: error.message ?? 'Synchronization failed.',
        code: error.code ?? 'SYNC_FAILED',
      });
      await markCachedTask(cache, mutation.taskId, 'failed');
      outcomes.push({
        type: 'failed',
        taskId: mutation.taskId,
        message: error.message,
      });
    }
  }

  return {
    offline: false,
    outcomes,
    mutations: await readTaskMutations(cache),
  };
}

export function mergeServerTasksWithMutations(
  serverTasks,
  cachedTasks,
  mutations,
) {
  const cachedById = new Map(cachedTasks.map((task) => [task.id, task]));
  const queuedTaskIds = new Set(
    mutations
      .filter((mutation) => mutation.type !== 'delete')
      .map((mutation) => mutation.taskId),
  );
  const deletedTaskIds = new Set(
    mutations
      .filter((mutation) => mutation.type === 'delete')
      .map((mutation) => mutation.taskId),
  );
  const mergedTasks = serverTasks
    .filter((task) => !deletedTaskIds.has(task.id))
    .map((task) =>
      queuedTaskIds.has(task.id) && cachedById.has(task.id)
        ? cachedById.get(task.id)
        : task,
    );
  const serverTaskIds = new Set(mergedTasks.map((task) => task.id));

  mutations
    .filter((mutation) => mutation.type === 'create')
    .forEach((mutation) => {
      const task = cachedById.get(mutation.taskId);

      if (task && !serverTaskIds.has(task.id)) {
        mergedTasks.push(task);
      }
    });

  return mergedTasks;
}
