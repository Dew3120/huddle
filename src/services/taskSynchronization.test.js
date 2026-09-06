import assert from 'node:assert/strict';
import test from 'node:test';
import 'fake-indexeddb/auto';

globalThis.self = globalThis;

const { canMergeTaskChanges, mergeServerTasksWithMutations, updateTaskWithMerge } =
  await import('./taskSynchronization.js');

test('keeps optimistic edits, local creates, and queued deletes', () => {
  const serverTasks = [
    { id: 'task-1', title: 'Server title', version: 2 },
    { id: 'task-2', title: 'Delete me', version: 0 },
  ];
  const cachedTasks = [
    {
      id: 'task-1',
      title: 'Offline title',
      version: 1,
      syncState: 'pending',
    },
    {
      id: 'local:one',
      title: 'Offline create',
      version: 0,
      syncState: 'pending',
    },
  ];
  const mutations = [
    { type: 'update', taskId: 'task-1', state: 'pending' },
    { type: 'delete', taskId: 'task-2', state: 'pending' },
    { type: 'create', taskId: 'local:one', state: 'pending' },
  ];

  assert.deepEqual(
    mergeServerTasksWithMutations(serverTasks, cachedTasks, mutations),
    [cachedTasks[0], cachedTasks[1]],
  );
});

test('merges different fields but refuses overlapping edits without a base', () => {
  const base = { title: 'Original', status: 'todo', version: 0 };
  const current = { title: 'Original', status: 'done', version: 1 };
  assert.equal(canMergeTaskChanges(base, current, { title: 'Mine' }), true);
  assert.equal(canMergeTaskChanges(base, current, { status: 'in-progress' }), false);
  assert.equal(canMergeTaskChanges(undefined, current, { title: 'Mine' }), false);
});

test('retries a non-overlapping edit using the latest version only', async (t) => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    calls.push(JSON.parse(options.body));
    if (calls.length === 1) {
      return Response.json({ error: { code: 'TASK_CONFLICT', details: {
        current: { id: 'task-1', title: 'Original', status: 'done', version: 1 },
      } } }, { status: 409 });
    }
    return Response.json({ data: { id: 'task-1', title: 'Mine', status: 'done', version: 2 } });
  });
  const result = await updateTaskWithMerge('task-1', { title: 'Mine' }, 0,
    { title: 'Original', status: 'todo', version: 0 });
  assert.equal(result.status, 'done');
  assert.deepEqual(calls, [{ title: 'Mine', version: 0 }, { title: 'Mine', version: 1 }]);
});

test('a same-field conflict remains visible and is never retried silently', async (t) => {
  let requests = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    requests += 1;
    return Response.json({ error: { code: 'TASK_CONFLICT', details: {
      current: { title: 'Theirs', version: 1 },
    } } }, { status: 409 });
  });
  await assert.rejects(
    updateTaskWithMerge('task-1', { title: 'Mine' }, 0, { title: 'Original' }),
    { code: 'TASK_CONFLICT' },
  );
  assert.equal(requests, 1);
});

test('keeps an unsynchronized edit visible when the server task disappears', () => {
  const task = { id: 'task-1', title: 'My offline work', syncState: 'failed' };
  assert.deepEqual(mergeServerTasksWithMutations([], [task], [
    { type: 'update', taskId: task.id, state: 'failed' },
  ]), [task]);
});
