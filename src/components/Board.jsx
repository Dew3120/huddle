import { useState } from 'react';
import { mockTasks } from '../data/mockTasks.js';
import AddTaskForm from './AddTaskForm.jsx';
import Column from './Column.jsx';
import TaskCard from './TaskCard.jsx';

const columns = [
  { status: 'todo', title: 'To Do' },
  { status: 'in-progress', title: 'In Progress' },
  { status: 'done', title: 'Done' },
];

const statusOrder = columns.map((column) => column.status);

export default function Board() {
  const [tasks, setTasks] = useState(mockTasks);

  const completedCount = tasks.filter(
    (task) => task.status === 'done',
  ).length;

  function addTask(taskDetails) {
    const newTask = {
      id: crypto.randomUUID(),
      ...taskDetails,
      status: 'todo',
    };

    setTasks((currentTasks) => [...currentTasks, newTask]);
  }

  function deleteTask(taskId) {
    const confirmed = window.confirm('Delete this task permanently?');

    if (confirmed) {
      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId),
      );
    }
  }

  function moveTask(taskId, direction) {
    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id !== taskId) return task;

        const currentIndex = statusOrder.indexOf(task.status);
        const change = direction === 'right' ? 1 : -1;
        const nextStatus = statusOrder[currentIndex + change];

        return nextStatus ? { ...task, status: nextStatus } : task;
      }),
    );
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <div>
          <p>Huddle workspace</p>
          <h1>Team Task Board</h1>
          <span>Plan, assign, and track your team&apos;s work.</span>
        </div>

        <strong className="board-progress" aria-live="polite">
          {completedCount} of {tasks.length} done
        </strong>
      </header>

      <AddTaskForm onAdd={addTask} />

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
                  onDelete={deleteTask}
                  onMove={moveTask}
                />
              ))}
          </Column>
        ))}
      </section>
    </main>
  );
}