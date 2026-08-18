export function tasksReducer(state, action) {
  switch (action.type) {
    case 'loaded':
      return action.tasks;

    case 'added':
      return [...state, action.task];

    case 'updated':
      return state.map((task) =>
        task.id === action.id
          ? {
              ...task,
              title: action.changes.title,
              assignee: action.changes.assignee,
              dueDate: action.changes.dueDate,
            }
          : task,
      );

    case 'moved':
      return state.map((task) =>
        task.id === action.id
          ? { ...task, status: action.status }
          : task,
      );

    case 'deleted':
      return state.filter((task) => task.id !== action.id);

    default:
      throw new Error(`Unknown task action: ${action.type}`);
  }
}