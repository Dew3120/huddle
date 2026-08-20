import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom';
import AppNavigation from './components/AppNavigation.jsx';
import TasksProvider from './context/TasksProvider.jsx';
import BoardPage from './pages/BoardPage.jsx';
import NewTaskPage from './pages/NewTaskPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import TaskDetailPage from './pages/TaskDetailPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <TasksProvider>
        <AppNavigation />

        <Routes>
          <Route path="/" element={<BoardPage />} />
          <Route path="/tasks/new" element={<NewTaskPage />} />
          <Route path="/tasks/:id" element={<TaskDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </TasksProvider>
    </BrowserRouter>
  );
}