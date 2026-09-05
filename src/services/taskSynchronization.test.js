import assert from 'node:assert/strict';
import test from 'node:test';
import 'fake-indexeddb/auto';

globalThis.self = globalThis;

const { mergeServerTasksWithMutations } =
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
