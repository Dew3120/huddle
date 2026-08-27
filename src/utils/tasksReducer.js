export function tasksReducer(state, action) {
  switch (action.type) {
    case 'loaded':
      return action.tasks;

    case 'added':
      return [...state, action.task];

    case 'updated':
      return state.map((task) =>
        task.id === action.id
          ? { ...task, ...action.changes }
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
