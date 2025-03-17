import { Routes, Route } from 'react-router-dom';
import { TimelineProvider } from '@/hooks/use-timeline';
import { TaskProvider } from '@/hooks/use-tasks';
import HomePage from './pages/HomePage';
import TimelinePage from './pages/TimelinePage';

export default function App() {
  return (
    <TimelineProvider>
      <TaskProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          {/* Add more routes here as needed */}
        </Routes>
      </TaskProvider>
    </TimelineProvider>
  );
} 