import Button from './Button/Button.jsx';

export default function TaskFilters({
  filters,
  assignees,
  resultCount,
  totalCount,
  onChange,
  onClear,
}) {
  return (
    <section className="task-filters" aria-label="Task filters">
      <label>
        Search title
        <input
          type="search"
          value={filters.query}
          onChange={(event) => onChange('query', event.target.value)}
          placeholder="Search task titles"
        />
      </label>
      <label>
        Assignee
        <select
          value={filters.assignee}
          onChange={(event) => onChange('assignee', event.target.value)}
        >
          <option value="">All assignees</option>
          {assignees.map((assignee) => (
            <option key={assignee} value={assignee}>
              {assignee}
            </option>
          ))}
        </select>
      </label>
      <label>
        Status
        <select
          value={filters.status}
          onChange={(event) => onChange('status', event.target.value)}
        >
          <option value="">All statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </label>
      <label className="task-filters__checkbox">
        <input
          type="checkbox"
          checked={filters.overdue}
          onChange={(event) => onChange('overdue', event.target.checked)}
        />
        Overdue only
      </label>
      <Button type="button" variant="secondary" onClick={onClear}>
        Clear filters
      </Button>
      <p className="task-filters__summary" aria-live="polite">
        Showing {resultCount} of {totalCount} tasks
      </p>
    </section>
  );
}