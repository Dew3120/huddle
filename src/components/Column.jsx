import { Children } from 'react';

export default function Column({ title, status, children }) {
  const taskCount = Children.count(children);
  const headingId = `${status}-column-heading`;

  return (
    <section
      className={`board-column board-column--${status}`}
      aria-labelledby={headingId}
    >
      <header className="board-column__header">
        <h2 id={headingId}>{title}</h2>
        <span
          className="board-column__count"
          aria-label={`${taskCount} tasks`}
        >
          {taskCount}
        </span>
      </header>

      <div className="board-column__tasks">
        {taskCount > 0 ? (
          children
        ) : (
          <p className="board-column__empty">No tasks yet</p>
        )}
      </div>
    </section>
  );
}