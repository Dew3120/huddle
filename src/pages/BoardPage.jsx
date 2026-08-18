import AddTaskForm from '../components/AddTaskForm.jsx';
import Board from '../components/Board.jsx';
import ErrorState from '../components/ErrorState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import { useTasks } from '../hooks/useTasks.js';

export default function BoardPage() {
  const {
    tasks,
    loading,
    error,
    addTask,
    deleteTask,
    moveTask,
    retryLoading,
  } = useTasks();

  const completedCount = tasks.filter(
    (task) => task.status === 'done',
  ).length;

  function handleDelete(taskId) {
    if (window.confirm('Delete this task permanently?')) {
      deleteTask(taskId);
    }
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
        <ErrorState message={error} onRetry={retryLoading} />
      ) : (
        <>
          <AddTaskForm onAdd={addTask} />
          <Board
            tasks={tasks}
            onDelete={handleDelete}
            onMove={moveTask}
          />
        </>
      )}
    </main>
  );
}