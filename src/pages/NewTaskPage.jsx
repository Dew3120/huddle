import { Link, useNavigate } from 'react-router-dom';
import AddTaskForm from '../components/AddTaskForm.jsx';
import { useTasks } from '../hooks/useTasks.js';

export default function NewTaskPage() {
  const navigate = useNavigate();
  const { addTask } = useTasks();

  async function handleAdd(taskDetails) {
    await addTask(taskDetails);
    navigate('/');
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <div>
          <p>Huddle workspace</p>
          <h1>Create a new task</h1>
          <span>New tasks begin in the To Do column.</span>
        </div>

        <Link className="text-link" to="/">
          Cancel
        </Link>
      </header>

      <AddTaskForm onAdd={handleAdd} />
    </main>
  );
}
