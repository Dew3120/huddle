import PouchDB from 'pouchdb-browser';

let db = null;

export function createTaskCache(userId) {
  db = new PouchDB(`huddle-tasks-${userId}`);
  return db;
}

export async function readCachedTasks() {
  if (!db) return [];
  try {
    const result = await db.allDocs({ include_docs: true, startkey: 'task:', endkey: 'task:\uffff' });
    return result.rows.map(row => row.doc);
  } catch (error) {
    console.error('Error reading cached tasks:', error);
    return [];
  }
}

export async function replaceCachedTasks(tasks) {
  if (!db) return;
  try {
    const result = await db.allDocs({ startkey: 'task:', endkey: 'task:\uffff' });
    const deletions = result.rows.map(row => ({
      _id: row.id,
      _rev: row.value.rev,
      _deleted: true
    }));
    await db.bulkDocs(deletions);

    const additions = tasks.map(task => ({
      ...task,
      _id: `task:${task.id || task._id}`
    }));
    await db.bulkDocs(additions);
  } catch (error) {
    console.error('Error replacing cached tasks:', error);
  }
}

export async function saveCachedTask(task) {
  if (!db) return;
  try {
    const docId = `task:${task.id || task._id}`;
    let existing;
    try {
      existing = await db.get(docId);
    } catch (e) {
      existing = null;
    }

    const doc = {
      ...task,
      _id: docId
    };

    if (existing) {
      doc._rev = existing._rev;
    }

    await db.put(doc);
  } catch (error) {
    console.error('Error saving cached task:', error);
  }
}

export async function removeCachedTask(taskId) {
  if (!db) return;
  try {
    const docId = `task:${taskId}`;
    const doc = await db.get(docId);
    await db.remove(doc);
  } catch (error) {
    if (error.status !== 404) {
      console.error('Error removing cached task:', error);
    }
  }
}