import { useEffect, useState } from 'react';
import { getTasks } from '../api/tasks.js';
import AddTaskForm from './AddTaskForm.jsx';
import Column from './Column.jsx';
import ErrorState from './ErrorState.jsx';
import LoadingState from './LoadingState.jsx';
import TaskCard from './TaskCard.jsx';

const columns = [
  { status: 'todo', title: 'To Do' },
  { status: 'in-progress', title: 'In Progress' },
  { status: 'done', title: 'Done' },
];

const statusOrder = columns.map((column) => column.status);

export default function Board() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');

    getTasks()
      .then((data) => {
        if (!cancelled) setTasks(data);
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(requestError.message || 'An unexpected error occurred.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadCount]);

  const completedCount = tasks.filter(
    (task) => task.status === 'done',
  ).length;

  function addTask(taskDetails) {
    setTasks((currentTasks) => [
      ...currentTasks,
      {
        id: crypto.randomUUID(),
        ...taskDetails,
        status: 'todo',
      },
    ]);
  }

  function deleteTask(taskId) {
    if (window.confirm('Delete this task permanently?')) {
      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId),
      );
    }
  }

  function moveTask(taskId, direction) {
    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id !== taskId) return task;

        const currentIndex = statusOrder.indexOf(task.status);
        const change = direction === 'right' ? 1 : -1;
        const nextStatus = statusOrder[currentIndex + change];

        return nextStatus ? { ...task, status: nextStatus } : task;
      }),
    );
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <div>
          <p>Huddle workspace</p>
          <h1>Team Task Board</h1>
          <span>Plan, assign, and track your team&apos;s work.</span>
        </div>

        {!loading && !error && (
          <strong className="board-progress" aria-live="polite">
            {completedCount} of {tasks.length} done
          </strong>
        )}
      </header>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={() => setReloadCount((count) => count + 1)}
        />
      ) : (
        <>
          <AddTaskForm onAdd={addTask} />

          <section className="board" aria-label="Team task board">
            {columns.map((column) => (
              <Column
                key={column.status}
                title={column.title}
                status={column.status}
              >
                {tasks
                  .filter((task) => task.status === column.status)
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      {...task}
                      onDelete={deleteTask}
                      onMove={moveTask}
                    />
                  ))}
              </Column>
            ))}
          </section>
        </>
      )}
    </main>
  );
}