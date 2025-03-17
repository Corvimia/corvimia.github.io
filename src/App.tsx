import { Routes, Route } from 'react-router-dom';
import { TimelineProvider } from '@/hooks/use-timeline';
import { TaskProvider } from '@/hooks/use-tasks';
import HomePage from './pages/HomePage';
import TimelinePage from './pages/TimelinePage';
import GeigerCounterPage from './pages/GeigerCounterPage';
import NetworkStatus from './components/NetworkStatus';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <TimelineProvider>
      <TaskProvider>
        {/* Network status monitoring component */}
        <NetworkStatus />
        
        {/* Toast notifications for the app */}
        <Toaster position="top-right" />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/geiger-counter" element={<GeigerCounterPage />} />
          {/* Add more routes here as needed */}
        </Routes>
      </TaskProvider>
    </TimelineProvider>
  );
} 