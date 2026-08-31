import { useEffect } from 'react';
import Button from './Button/Button.jsx';

export default function DeleteTaskDialog({
  task,
  deleting,
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && !deleting) {
        onCancel();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [deleting, onCancel]);

  function closeFromBackdrop(event) {
    if (event.target === event.currentTarget && !deleting) {
      onCancel();
    }
  }

  return (
    <div className="confirm-dialog-layer" onMouseDown={closeFromBackdrop}>
      <section
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-task-title"
        aria-describedby="delete-task-description"
      >
        <p className="confirm-dialog__eyebrow">Delete task</p>
        <h2 id="delete-task-title">Delete &ldquo;{task.title}&rdquo;?</h2>
        <p id="delete-task-description" className="confirm-dialog__message">
          This action cannot be undone. The task will be removed from the board
          for everyone who can access it.
        </p>

        <div className="confirm-dialog__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={deleting}
            autoFocus
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete task'}
          </Button>
        </div>
      </section>
    </div>
  );
}
