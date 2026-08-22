import Button from './Button/Button.jsx';

export default function ErrorState({ message, onRetry }) {
  return (
    <section className="screen-state screen-state--error" role="alert">
      <h2>Tasks could not be loaded</h2>
      <p>{message}</p>
      <Button type="button" variant="secondary" onClick={onRetry}>
        Try again
      </Button>
    </section>
  );
}