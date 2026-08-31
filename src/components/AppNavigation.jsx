import { NavLink } from 'react-router-dom';
import Button from './Button/Button.jsx';

export default function AppNavigation({
  theme,
  user,
  onLogout,
  onToggleTheme,
}) {
  const nextThemeLabel = theme === 'dark' ? 'Light mode' : 'Dark mode';

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

        <span className="app-navigation__user">{user.email}</span>

        <Button
          type="button"
          variant="secondary"
          size="small"
          onClick={onLogout}
        >
          Log out
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="small"
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label={`Switch to ${nextThemeLabel}`}
        >
          {nextThemeLabel}
        </Button>
      </div>
    </nav>
  );
}
