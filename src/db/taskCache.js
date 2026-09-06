import PouchDB from 'pouchdb-browser';

const TASK_PREFIX = 'task:';
const MUTATION_PREFIX = 'mutation:';

export function createTaskCache(userId) {
  return new PouchDB(`huddle-tasks-${userId}`);
}

function taskDocumentId(taskId) {
  return `${TASK_PREFIX}${taskId}`;
}

function createMutationDocumentId() {
  const randomId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  return `${MUTATION_PREFIX}${Date.now().toString(36)}:${randomId}`;
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

function fromMutationDocument(document) {
  const { _id, _rev, ...mutation } = document;

  return {
    ...mutation,
    queueId: _id,
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

export async function readCachedTask(cache, taskId) {
  try {
    return fromTaskDocument(await cache.get(taskDocumentId(taskId)));
  } catch (error) {
    if (error.status === 404) {
      return null;
    }

    throw error;
  }
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

async function readMutationDocuments(cache) {
  const result = await cache.allDocs({
    include_docs: true,
    startkey: MUTATION_PREFIX,
    endkey: `${MUTATION_PREFIX}\uffff`,
  });

  return result.rows.map((row) => row.doc);
}

async function saveMutationDocument(cache, document) {
  const response = await cache.put(document);

  return fromMutationDocument({
    ...document,
    _rev: response.rev,
  });
}

async function removeMutationDocuments(cache, documents) {
  if (documents.length === 0) {
    return;
  }

  const writes = documents.map((document) => ({
    _id: document._id,
    _rev: document._rev,
    _deleted: true,
  }));

  assertBulkWriteSucceeded(await cache.bulkDocs(writes));
}

export async function readTaskMutations(cache) {
  const documents = await readMutationDocuments(cache);

  return documents
    .map(fromMutationDocument)
    .sort((first, second) => first.createdAt.localeCompare(second.createdAt));
}

export async function queueTaskCreate(cache, task) {
  const now = new Date().toISOString();

  return saveMutationDocument(cache, {
    _id: createMutationDocumentId(),
    type: 'create',
    taskId: task.id,
    task,
    state: 'pending',
    createdAt: now,
    updatedAt: now,
  });
}

export async function queueTaskUpdate(cache, taskId, changes, baseVersion, baseTask) {
  const documents = await readMutationDocuments(cache);
  const queuedCreate = documents.find(
    (document) => document.taskId === taskId && document.type === 'create',
  );
  const now = new Date().toISOString();

  if (queuedCreate) {
    return saveMutationDocument(cache, {
      ...queuedCreate,
      task: {
        ...queuedCreate.task,
        ...changes,
      },
      updatedAt: now,
    });
  }

  const queuedUpdate = documents.find(
    (document) => document.taskId === taskId && document.type === 'update',
  );

  if (queuedUpdate) {
    const updatedMutation = {
      ...queuedUpdate,
      changes: {
        ...queuedUpdate.changes,
        ...changes,
      },
      state: 'pending',
      updatedAt: now,
    };

    delete updatedMutation.conflict;
    delete updatedMutation.failure;
    return saveMutationDocument(cache, updatedMutation);
  }

  return saveMutationDocument(cache, {
    _id: createMutationDocumentId(),
    type: 'update',
    taskId,
    changes,
    baseVersion,
    ...(baseTask ? { baseTask } : {}),
    state: 'pending',
    createdAt: now,
    updatedAt: now,
  });
}

export async function queueTaskDelete(cache, taskId) {
  const documents = await readMutationDocuments(cache);
  const taskDocuments = documents.filter(
    (document) => document.taskId === taskId,
  );
  const queuedCreate = taskDocuments.find(
    (document) => document.type === 'create',
  );

  await removeMutationDocuments(cache, taskDocuments);

  if (queuedCreate) {
    return null;
  }

  const now = new Date().toISOString();

  return saveMutationDocument(cache, {
    _id: createMutationDocumentId(),
    type: 'delete',
    taskId,
    state: 'pending',
    createdAt: now,
    updatedAt: now,
  });
}

export async function markTaskMutationConflict(cache, queueId, conflict) {
  const document = await cache.get(queueId);

  return saveMutationDocument(cache, {
    ...document,
    state: 'conflict',
    conflict,
    updatedAt: new Date().toISOString(),
  });
}

export async function markTaskMutationFailed(cache, queueId, failure) {
  const document = await cache.get(queueId);

  return saveMutationDocument(cache, {
    ...document,
    state: 'failed',
    failure,
    updatedAt: new Date().toISOString(),
  });
}

export async function retryTaskMutation(cache, queueId, baseVersion) {
  const document = await cache.get(queueId);
  const retriedMutation = {
    ...document,
    state: 'pending',
    baseVersion: baseVersion ?? document.baseVersion,
    updatedAt: new Date().toISOString(),
  };

  delete retriedMutation.conflict;
  delete retriedMutation.failure;
  return saveMutationDocument(cache, retriedMutation);
}

export async function removeTaskMutation(cache, queueId) {
  try {
    const document = await cache.get(queueId);
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
