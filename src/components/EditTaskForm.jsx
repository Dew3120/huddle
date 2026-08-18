import { useState } from 'react';

function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default function EditTaskForm({ task, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: task.title,
    assignee: task.assignee,
    dueDate: task.dueDate,
  });
  const [errors, setErrors] = useState({});

  const today = getToday();

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: '',
    }));
  }

  function validateForm() {
    const nextErrors = {};
    const title = form.title.trim();
    const assignee = form.assignee.trim();

    if (!title) {
      nextErrors.title = 'Enter a task title.';
    } else if (title.length < 3) {
      nextErrors.title =
        'The title must contain at least 3 characters.';
    }

    if (!assignee) {
      nextErrors.assignee = 'Enter the name of an assignee.';
    }

    if (!form.dueDate) {
      nextErrors.dueDate = 'Select a due date.';
    } else if (form.dueDate < today) {
      nextErrors.dueDate = 'The due date cannot be in the past.';
    }

    return nextErrors;
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSave({
      title: form.title.trim(),
      assignee: form.assignee.trim(),
      dueDate: form.dueDate,
    });
  }

  return (
    <form
      className="task-form task-edit-form"
      onSubmit={handleSubmit}
      noValidate
    >
      <label>
        Task title
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={
            errors.title ? 'edit-title-error' : undefined
          }
        />
        {errors.title && (
          <span className="form-error" id="edit-title-error">
            {errors.title}
          </span>
        )}
      </label>

      <label>
        Assignee
        <input
          name="assignee"
          value={form.assignee}
          onChange={handleChange}
          aria-invalid={Boolean(errors.assignee)}
          aria-describedby={
            errors.assignee ? 'edit-assignee-error' : undefined
          }
        />
        {errors.assignee && (
          <span className="form-error" id="edit-assignee-error">
            {errors.assignee}
          </span>
        )}
      </label>

      <label>
        Due date
        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          min={today}
          onChange={handleChange}
          aria-invalid={Boolean(errors.dueDate)}
          aria-describedby={
            errors.dueDate ? 'edit-due-date-error' : undefined
          }
        />
        {errors.dueDate && (
          <span className="form-error" id="edit-due-date-error">
            {errors.dueDate}
          </span>
        )}
      </label>

      <div className="task-edit-form__actions">
        <button
          type="button"
          className="task-edit-form__cancel"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button type="submit">Save changes</button>
      </div>
    </form>
  );
}