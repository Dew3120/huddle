import PouchDB from 'pouchdb-browser';

const TASK_PREFIX = 'task:';

export function createTaskCache(userId) {
  return new PouchDB(`huddle-tasks-${userId}`);
}

function taskDocumentId(taskId) {
  return `${TASK_PREFIX}${taskId}`;
}

function toTaskDocument(task, revision) {
  const { _id, _rev, ...taskData } = task;
  const id = task.id ?? _id?.slice(TASK_PREFIX.length);

  return {
    ...taskData,
    id,
    _id: taskDocumentId(id),
    ...(revision ? { _rev: revision } : {}),
  };
}

function fromTaskDocument(document) {
  const { _id, _rev, ...task } = document;

  return {
    ...task,
    id: task.id ?? _id.slice(TASK_PREFIX.length),
  };
}

function assertBulkWriteSucceeded(results) {
  const failedWrite = results.find((result) => result.error);

  if (failedWrite) {
    const error = new Error(failedWrite.reason ?? 'PouchDB write failed');
    error.status = failedWrite.status;
    throw error;
  }
}

export async function readCachedTasks(cache) {
  const result = await cache.allDocs({
    include_docs: true,
    startkey: TASK_PREFIX,
    endkey: `${TASK_PREFIX}\uffff`,
  });

  return result.rows.map((row) => fromTaskDocument(row.doc));
}

export async function replaceCachedTasks(cache, tasks) {
  const existing = await cache.allDocs({
    startkey: TASK_PREFIX,
    endkey: `${TASK_PREFIX}\uffff`,
  });
  const existingById = new Map(
    existing.rows.map((row) => [row.id, row.value.rev]),
  );
  const nextDocumentIds = new Set(
    tasks.map((task) => taskDocumentId(task.id ?? task._id)),
  );
  const writes = tasks.map((task) => {
    const documentId = taskDocumentId(task.id ?? task._id);

    return toTaskDocument(task, existingById.get(documentId));
  });

  existing.rows.forEach((row) => {
    if (!nextDocumentIds.has(row.id)) {
      writes.push({
        _id: row.id,
        _rev: row.value.rev,
        _deleted: true,
      });
    }
  });

  if (writes.length > 0) {
    assertBulkWriteSucceeded(await cache.bulkDocs(writes));
  }
}

export async function saveCachedTask(cache, task) {
  const documentId = taskDocumentId(task.id ?? task._id);
  let revision;

  try {
    revision = (await cache.get(documentId))._rev;
  } catch (error) {
    if (error.status !== 404) {
      throw error;
    }
  }

  await cache.put(toTaskDocument(task, revision));
}

export async function removeCachedTask(cache, taskId) {
  try {
    const document = await cache.get(taskDocumentId(taskId));
    await cache.remove(document);
  } catch (error) {
    if (error.status !== 404) {
      throw error;
    }
  }
}

export async function closeTaskCache(cache) {
  await cache.close();
}
