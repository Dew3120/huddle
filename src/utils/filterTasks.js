export function getAssignees(tasks) {
  return [...new Set(tasks.map((task) => task.assignee).filter(Boolean))].sort(
    (first, second) => first.localeCompare(second),
  );
}

export function isOverdue(task, today = new Date()) {
  if (!task.dueDate || task.status === 'done') {
    return false;
  }
  const dueDate = new Date(`${task.dueDate}T23:59:59`);

  return !Number.isNaN(dueDate.getTime()) && dueDate < today;
}

export function filterTasks(tasks, filters) {
  const query = filters.query.trim().toLowerCase();

  return tasks.filter((task) => {
    const matchesQuery =
      query.length === 0 || task.title.toLowerCase().includes(query);
    const matchesAssignee =
      filters.assignee.length === 0 || task.assignee === filters.assignee;
    const matchesStatus =
      filters.status.length === 0 || task.status === filters.status;
    const matchesOverdue = !filters.overdue || isOverdue(task);

    return (
      matchesQuery &&
      matchesAssignee &&
      matchesStatus &&
      matchesOverdue
    );
  });
}
