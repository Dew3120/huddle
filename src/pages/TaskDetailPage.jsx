import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button/Button.jsx';
import EditTaskForm from '../components/EditTaskForm.jsx';
import ErrorState from '../components/ErrorState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import { useTasks } from '../hooks/useTasks.js';

const statusLabels = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
};

export default function TaskDetailPage({ isModal = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const {
    tasks,
    loading,
    error,
    updateTask,
    retryLoading,
  } = useTasks();

  useEffect(() => {
    if (!isModal) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        navigate('/');
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModal, navigate]);

  function closeModal(event) {
    if (event.target === event.currentTarget) {
      navigate('/');
    }
  }

  function renderDetailFrame(children) {
    if (isModal) {
      return (
        <div className="task-modal-layer" onMouseDown={closeModal}>
          <section
            className="task-detail task-detail--modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-detail-title"
          >
            {children}
          </section>
        </div>
      );
    }

    return (
      <main className="app-shell">
        <section className="task-detail">{children}</section>
      </main>
    );
  }

  if (loading) {
    return renderDetailFrame(<LoadingState />);
  }

  if (error) {
    return renderDetailFrame(
      <ErrorState message={error} onRetry={retryLoading} />,
    );
  }

  const task = tasks.find((item) => String(item.id) === id);

  if (!task) {
    return renderDetailFrame(
      <section className="screen-state screen-state--embedded">
        <h1 id="task-detail-title">Task not found</h1>
        <p>The requested task does not exist.</p>
        <Link className="text-link" to="/">
          Return to board
        </Link>
      </section>,
    );
  }

  function handleSave(changes) {
    updateTask(task.id, changes);
    setIsEditing(false);
  }

  return renderDetailFrame(
    <>
      <div className="task-detail__toolbar">
        <Link className="text-link" to="/">
          {isModal ? 'Close' : 'Back to board'}
        </Link>

        {!isEditing && (
          <Button type="button" onClick={() => setIsEditing(true)}>
            Edit task
          </Button>
        )}
      </div>

      <p
        className={`task-detail__eyebrow status-pill status-pill--${task.status}`}
      >
        {statusLabels[task.status]}
      </p>

      <h1 id="task-detail-title">
        {isEditing ? 'Edit task' : task.title}
      </h1>

      {isEditing ? (
        <EditTaskForm
          task={task}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <dl className="task-detail__information">
          <div>
            <dt>Assignee</dt>
            <dd>
              <span className="metadata-pill metadata-pill--assignee">
                {task.assignee}
              </span>
            </dd>
          </div>

          <div>
            <dt>Status</dt>
            <dd>
              <span
                className={`status-pill status-pill--${task.status}`}
              >
                {statusLabels[task.status]}
              </span>
            </dd>
          </div>

          <div>
            <dt>Due date</dt>
            <dd>
              <time dateTime={task.dueDate}>{task.dueDate}</time>
            </dd>
          </div>
        </dl>
      )}
    </>,
  );
}
