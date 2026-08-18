import { useState } from 'react';

const initialForm = {
  title: '',
  assignee: '',
  dueDate: '',
};

export default function AddTaskForm({ onAdd }) {
  const [form, setForm] = useState(initialForm);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    onAdd({
      title: form.title.trim(),
      assignee: form.assignee.trim(),
      dueDate: form.dueDate,
    });

    setForm(initialForm);
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <label>
        Task title
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          minLength="3"
          required
        />
      </label>

      <label>
        Assignee
        <input
          name="assignee"
          value={form.assignee}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Due date
        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          required
        />
      </label>

      <button type="submit">Add task</button>
    </form>
  );
}