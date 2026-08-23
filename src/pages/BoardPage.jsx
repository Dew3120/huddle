import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import AddTaskForm from '../components/AddTaskForm.jsx';
import Board from '../components/Board.jsx';
import Button from '../components/Button/Button.jsx';
import ErrorState from '../components/ErrorState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import TaskFilters from '../components/TaskFilters.jsx';
import { useTasks } from '../hooks/useTasks.js';
import { filterTasks, getAssignees } from '../utils/filterTasks.js';

export default function BoardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    tasks,
    loading,
    error,
    addTask,
    deleteTask,
    moveTask,
    retryLoading,
  } = useTasks();

  const filters = {
    query: searchParams.get('q') ?? '',
    assignee: searchParams.get('assignee') ?? '',
    status: searchParams.get('status') ?? '',
    overdue: searchParams.get('overdue') === 'true',
  };

  const assignees = useMemo(() => getAssignees(tasks), [tasks]);
  
  const visibleTasks = useMemo(
    () => filterTasks(tasks, filters),
    [tasks, filters.query, filters.assignee, filters.status, filters.overdue],
  );

  const completedCount = tasks.filter(
    (task) => task.status === 'done',
  ).length;

  const hasActiveFilters =
    filters.query ||
    filters.assignee ||
    filters.status ||
    filters.overdue;

  function handleDelete(taskId) {
    if (window.confirm('Delete this task permanently?')) {
      deleteTask(taskId);
    }
  }

  function updateFilter(name, value) {
    const nextParams = new URLSearchParams(searchParams);
    const key = name === 'query' ? 'q' : name;
    
    if (value === '' || value === false) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, String(value));
    }
    
    setSearchParams(nextParams, { replace: true });
  }

  function clearFilters() {
    setSearchParams({}, { replace: true });
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
          
          <TaskFilters
            filters={filters}
            assignees={assignees}
            resultCount={visibleTasks.length}
            totalCount={tasks.length}
            onChange={updateFilter}
            onClear={clearFilters}
          />

          {visibleTasks.length > 0 ? (
            <Board
              tasks={visibleTasks}
              onDelete={handleDelete}
              onMove={moveTask}
            />
          ) : (
            <section className="empty-state" role="status">
              <h2>No matching tasks</h2>
              <p>
                {hasActiveFilters
                  ? 'Change or clear the filters to see tasks again.'
                  : 'Create a task to start the board.'}
              </p>
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              )}
            </section>
          )}
        </>
      )}
    </main>
  );
}