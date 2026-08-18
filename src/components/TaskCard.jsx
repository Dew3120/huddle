import { Link } from 'react-router-dom';

const statusLabels = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
};

export default function TaskCard({
  id,
  title,
  assignee = 'Unassigned',
  status = 'todo',
  dueDate,
  onDelete,
  onMove,
}) {
  const cannotMoveLeft = status === 'todo';
  const cannotMoveRight = status === 'done';

  return (
    <article className={`task-card task-card--${status}`}>
      <span className="task-card__status">
        {statusLabels[status] ?? 'Unknown'}
      </span>

      <h3 className="task-card__title">
        <Link className="task-card__link" to={`/tasks/${id}`}>
          {title}
        </Link>
      </h3>

      <dl className="task-card__details">
        <div>
          <dt>Assignee</dt>
          <dd>{assignee}</dd>
        </div>

        <div>
          <dt>Due date</dt>
          <dd>
            <time dateTime={dueDate}>{dueDate}</time>
          </dd>
        </div>
      </dl>

      <div
        className="task-card__actions"
        aria-label={`Actions for ${title}`}
      >
        <button
          type="button"
          onClick={() => onMove(id, 'left')}
          disabled={cannotMoveLeft}
          aria-label={`Move ${title} left`}
        >
          Move left
        </button>

        <button
          type="button"
          onClick={() => onMove(id, 'right')}
          disabled={cannotMoveRight}
          aria-label={`Move ${title} right`}
        >
          Move right
        </button>

        <button
          type="button"
          className="task-card__delete"
          onClick={() => onDelete(id)}
          aria-label={`Delete ${title}`}
        >
          Delete
        </button>
      </div>
    </article>
  );
}