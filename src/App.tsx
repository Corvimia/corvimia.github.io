import { Routes, Route } from 'react-router-dom';
import { TimelineProvider } from '@/hooks/use-timeline';
import { TaskProvider } from '@/hooks/use-tasks';
import HomePage from './pages/HomePage';
import TimelinePage from './pages/TimelinePage';
import GeigerCounterPage from './pages/GeigerCounterPage';

export default function App() {
  return (
    <TimelineProvider>
      <TaskProvider>
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