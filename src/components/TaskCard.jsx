const statusLabels = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
};

export default function TaskCard({
  title,
  assignee = 'Unassigned',
  status = 'todo',
  dueDate,
}) {
  return (
    <article className={`task-card task-card--${status}`}>
      <span className="task-card__status">
        {statusLabels[status] ?? 'Unknown'}
      </span>

      <h3 className="task-card__title">{title}</h3>

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
    </article>
  );
}