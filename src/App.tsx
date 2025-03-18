import { Routes, Route } from 'react-router-dom';
import { TimelineProvider } from '@/hooks/use-timeline';
import { TaskProvider } from '@/hooks/use-tasks';
import { TaskListManagerProvider } from '@/hooks/use-task-list-manager';
import HomePage from './pages/HomePage';
import TimelinePage from './pages/TimelinePage';
import GeigerCounterPage from './pages/GeigerCounterPage';
import TaskListManagerPage from './pages/TaskListManagerPage';
import NetworkStatus from './components/NetworkStatus';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <TimelineProvider>
      <TaskProvider>
        <TaskListManagerProvider>
          {/* Network status monitoring component */}
          <NetworkStatus />
          
          {/* Toast notifications for the app */}
          <Toaster position="top-right" />
          
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/geiger-counter" element={<GeigerCounterPage />} />
            <Route path="/tasks" element={<TaskListManagerPage />} />
            {/* Add more routes here as needed */}
          </Routes>
        </TaskListManagerProvider>
      </TaskProvider>
    </TimelineProvider>
  );
} 