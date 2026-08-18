export default function ErrorState({ message, onRetry }) {
  return (
    <section className="screen-state screen-state--error" role="alert">
      <h2>Tasks could not be loaded</h2>
      <p>{message}</p>
      <button type="button" onClick={onRetry}>
        Try again
      </button>
    </section>
  );
}