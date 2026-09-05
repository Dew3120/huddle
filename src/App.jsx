import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppNavigation from './components/AppNavigation.jsx';
import CursorGlow from './components/CursorGlow.jsx';
import LoadingState from './components/LoadingState.jsx';
import TasksProvider from './context/TasksProvider.jsx';
import { useAuth } from './hooks/useAuth.js';
import AuthPage from './pages/AuthPage.jsx';
import BoardPage from './pages/BoardPage.jsx';
import NewTaskPage from './pages/NewTaskPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import TaskDetailPage from './pages/TaskDetailPage.jsx';

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  return window.localStorage.getItem('huddle-theme') ?? 'dark';
}

function TaskModalRoute() {
  return (
    <>
      <div className="dashboard-underlay" aria-hidden="true">
        <BoardPage />
      </div>
      <TaskDetailPage isModal />
    </>
  );
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const { user, loading, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem('huddle-theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((currentTheme) =>
      currentTheme === 'dark' ? 'light' : 'dark',
    );
  }

  return (
    <BrowserRouter>
      <CursorGlow />

      {loading ? (
        <main className="app-shell">
          <LoadingState />
        </main>
      ) : isAuthenticated ? (
        <TasksProvider userId={user?.id}>
          <AppNavigation
            theme={theme}
            user={user}
            onLogout={logout}
            onToggleTheme={toggleTheme}
          />

          <Routes>
            <Route path="/" element={<BoardPage />} />
            <Route path="/tasks/new" element={<NewTaskPage />} />
            <Route path="/tasks/:id" element={<TaskModalRoute />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </TasksProvider>
      ) : (
        <AuthPage />
      )}
    </BrowserRouter>
  );
}
