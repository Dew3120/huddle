import { useEffect, useReducer, useState } from 'react';
import { getTasks } from '../api/tasks.js';
import { tasksReducer } from '../utils/tasksReducer.js';
import { TasksContext } from './TasksContext.js';

const statusOrder = ['todo', 'in-progress', 'done'];

export default function TasksProvider({ children }) {
  const [tasks, dispatch] = useReducer(tasksReducer, []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadCount]);

  function addTask(taskDetails) {
    dispatch({
      type: 'added',
      task: {
        id: crypto.randomUUID(),
        ...taskDetails,
        status: 'todo',
      },
    });
  }

  function deleteTask(taskId) {
    dispatch({
      type: 'deleted',
      id: taskId,
    });
  }

  function moveTask(taskId, direction) {
    const task = tasks.find((item) => item.id === taskId);

    if (!task) return;

    const currentIndex = statusOrder.indexOf(task.status);
    const change = direction === 'right' ? 1 : -1;
    const nextStatus = statusOrder[currentIndex + change];

    if (nextStatus) {
      dispatch({
        type: 'moved',
        id: taskId,
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
    addTask,
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