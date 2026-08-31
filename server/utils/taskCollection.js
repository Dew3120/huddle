const allowedSortFields = ['title', 'assignee', 'status', 'dueDate'];

export function publicTask(task) {
  const { ownerId, ...taskData } = task;
  return taskData;
}

export function queryTaskCollection(
  tasks,
  { status, assignee, sort = 'dueDate', page = '1', limit = '20' } = {},
) {
  let result = tasks;

  if (status) {
    result = result.filter((task) => task.status === status);
  }

  if (assignee) {
    const normalizedAssignee = assignee.toLocaleLowerCase();
    result = result.filter(
      (task) => task.assignee.toLocaleLowerCase() === normalizedAssignee,
    );
  }

  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
  const sortDirection = sort.startsWith('-') ? -1 : 1;

  if (allowedSortFields.includes(sortField)) {
    result = [...result].sort(
      (first, second) =>
        String(first[sortField]).localeCompare(String(second[sortField])) *
        sortDirection,
    );
  }

  const total = result.length;
  const start = (pageNumber - 1) * limitNumber;

  return {
    data: result.slice(start, start + limitNumber).map(publicTask),
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
    },
  };
}
