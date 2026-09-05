import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import 'fake-indexeddb/auto';

globalThis.self = globalThis;

const {
  createTaskCache,
  markTaskMutationConflict,
  queueTaskCreate,
  queueTaskDelete,
  queueTaskUpdate,
  readCachedTasks,
  readTaskMutations,
  replaceCachedTasks,
  retryTaskMutation,
} = await import('./taskCache.js');

const databases = [];

function createTestCache() {
  const cache = createTaskCache(
    `test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  databases.push(cache);
  return cache;
}

afterEach(async () => {
  await Promise.all(databases.splice(0).map((database) => database.destroy()));
});

test('replaces cached tasks without leaking PouchDB metadata', async () => {
  const cache = createTestCache();

  await replaceCachedTasks(cache, [
    { id: 'task-1', title: 'First task' },
    { id: 'task-2', title: 'Second task' },
  ]);
  await replaceCachedTasks(cache, [{ id: 'task-1', title: 'Updated task' }]);

  assert.deepEqual(await readCachedTasks(cache), [
    { id: 'task-1', title: 'Updated task' },
  ]);
});

test('folds offline edits into a queued local create', async () => {
  const cache = createTestCache();
  const localTask = {
    id: 'local:one',
    title: 'Draft task',
    status: 'todo',
    version: 0,
  };

  await queueTaskCreate(cache, localTask);
  await queueTaskUpdate(cache, localTask.id, { status: 'done' }, 0);

  const [mutation] = await readTaskMutations(cache);
  assert.equal(mutation.type, 'create');
  assert.equal(mutation.task.status, 'done');

  await queueTaskDelete(cache, localTask.id);
  assert.deepEqual(await readTaskMutations(cache), []);
});

test('compacts server-task edits and lets delete supersede them', async () => {
  const cache = createTestCache();

  await queueTaskUpdate(cache, 'task-1', { title: 'Changed' }, 2);
  await queueTaskUpdate(cache, 'task-1', { status: 'done' }, 2);

  const [update] = await readTaskMutations(cache);
  assert.equal(update.type, 'update');
  assert.equal(update.baseVersion, 2);
  assert.deepEqual(update.changes, {
    title: 'Changed',
    status: 'done',
  });

  await queueTaskDelete(cache, 'task-1');
  const [deletion] = await readTaskMutations(cache);
  assert.equal(deletion.type, 'delete');
});

test('stores a conflict and retries it against the current version', async () => {
  const cache = createTestCache();
  const queued = await queueTaskUpdate(
    cache,
    'task-1',
    { title: 'My title' },
    1,
  );

  await markTaskMutationConflict(cache, queued.queueId, {
    current: { id: 'task-1', title: 'Their title', version: 2 },
    yourVersion: 1,
  });

  let [mutation] = await readTaskMutations(cache);
  assert.equal(mutation.state, 'conflict');
  assert.equal(mutation.conflict.current.version, 2);

  await retryTaskMutation(cache, queued.queueId, 2);
  [mutation] = await readTaskMutations(cache);
  assert.equal(mutation.state, 'pending');
  assert.equal(mutation.baseVersion, 2);
  assert.equal('conflict' in mutation, false);
});
