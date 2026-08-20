import Column from './Column.jsx';
import TaskCard from './TaskCard.jsx';

const columns = [
  { status: 'todo', title: 'To Do' },
  { status: 'in-progress', title: 'In Progress' },
  { status: 'done', title: 'Done' },
];

export default function Board({ tasks, onDelete, onMove }) {
  return (
    <section className="board" aria-label="Team task board">
      {columns.map((column) => (
        <Column
          key={column.status}
          title={column.title}
          status={column.status}
        >
          {tasks
            .filter((task) => task.status === column.status)
            .map((task) => (
              <TaskCard
                key={task.id}
                {...task}
                onDelete={onDelete}
                onMove={onMove}
              />
            ))}
        </Column>
      ))}
    </section>
  );
}