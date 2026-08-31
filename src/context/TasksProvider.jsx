import { useEffect, useReducer, useState } from 'react';
import {
  createTask,
  deleteTask as deleteTaskRequest,
  getTasks,
  updateTask as updateTaskRequest,
} from '../api/tasks.js';
import { tasksReducer } from '../utils/tasksReducer.js';
import { TasksContext } from './TasksContext.js';

const statusOrder = ['todo', 'in-progress', 'done'];

export default function TasksProvider({ children }) {
  const [tasks, dispatch] = useReducer(tasksReducer, []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mutationError, setMutationError] = useState('');
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');

    getTasks()
      .then((data) => {
        if (!cancelled) {
          dispatch({ type: 'loaded', tasks: data });
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(
            requestError.message || 'An unexpected error occurred.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [reloadCount]);

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

      return task;
    } catch (requestError) {
      setMutationError(
        requestError.message || 'Unable to create the task.',
      );
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

      return task;
    } catch (requestError) {
      setMutationError(
        requestError.message || 'Unable to update the task.',
      );
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
    } catch (requestError) {
      setMutationError(
        requestError.message || 'Unable to delete the task.',
      );
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
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
}
