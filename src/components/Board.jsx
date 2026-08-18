import { mockTasks } from '../data/mockTasks.js';
import Column from './Column.jsx';
import TaskCard from './TaskCard.jsx';

const columns = [
  { status: 'todo', title: 'To Do' },
  { status: 'in-progress', title: 'In Progress' },
  { status: 'done', title: 'Done' },
];

export default function Board() {
  return (
    <main className="app-shell">
      <header className="page-header">
        <p>Huddle workspace</p>
        <h1>Team Task Board</h1>
        <span>Plan, assign, and track your team&apos;s work.</span>
      </header>

      <section className="board" aria-label="Team task board">
        {columns.map((column) => {
          const columnTasks = mockTasks.filter(
            (task) => task.status === column.status,
          );

          return (
            <Column
              key={column.status}
              title={column.title}
              status={column.status}
            >
              {columnTasks.map((task) => (
                <TaskCard key={task.id} {...task} />
              ))}
            </Column>
          );
        })}
      </section>
    </main>
  );
}