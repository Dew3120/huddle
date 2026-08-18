export default function LoadingState() {
  return (
    <section className="screen-state" role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      <h2>Loading tasks</h2>
      <p>Your team board is being prepared.</p>
    </section>
  );
}