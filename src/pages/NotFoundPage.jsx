import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="app-shell">
      <section className="screen-state">
        <p>404</p>
        <h1>Page not found</h1>
        <p>The page you requested does not exist.</p>
        <Link className="text-link" to="/">
          Return to board
        </Link>
      </section>
    </main>
  );
}