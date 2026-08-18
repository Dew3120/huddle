import { NavLink } from 'react-router-dom';

export default function AppNavigation() {
  return (
    <nav className="app-navigation" aria-label="Main navigation">
      <NavLink className="app-navigation__brand" to="/">
        Huddle
      </NavLink>

      <div className="app-navigation__links">
        <NavLink
          className={({ isActive }) =>
            isActive ? 'navigation-link active' : 'navigation-link'
          }
          to="/"
          end
        >
          Board
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            isActive ? 'navigation-link active' : 'navigation-link'
          }
          to="/tasks/new"
        >
          New task
        </NavLink>
      </div>
    </nav>
  );
}