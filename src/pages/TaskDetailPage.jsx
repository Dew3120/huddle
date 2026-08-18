import { Link, useParams } from 'react-router-dom';
import ErrorState from '../components/ErrorState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import { useTasks } from '../hooks/useTasks.js';

const statusLabels = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
};

export default function TaskDetailPage() {
  const { id } = useParams();
  const { tasks, loading, error, retryLoading } = useTasks();

  if (loading) {
    return (
      <main className="app-shell">
        <LoadingState />
      </main>
    );
  }

  if (error) {
    return (
      <main className="app-shell">
        <ErrorState message={error} onRetry={retryLoading} />
      </main>
    );
  }

  const task = tasks.find((item) => String(item.id) === id);

  if (!task) {
    return (
      <main className="app-shell">
        <section className="screen-state">
          <h1>Task not found</h1>
          <p>The requested task does not exist.</p>
          <Link className="text-link" to="/">
            Return to board
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="task-detail">
        <Link className="text-link" to="/">
          Back to board
        </Link>

        <p className="task-detail__eyebrow">
          {statusLabels[task.status]}
        </p>

        <h1>{task.title}</h1>

        <dl className="task-detail__information">
          <div>
            <dt>Assignee</dt>
            <dd>{task.assignee}</dd>
          </div>

          <div>
            <dt>Status</dt>
            <dd>{statusLabels[task.status]}</dd>
          </div>

          <div>
            <dt>Due date</dt>
            <dd>
              <time dateTime={task.dueDate}>{task.dueDate}</time>
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}