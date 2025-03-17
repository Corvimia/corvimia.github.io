import { Routes, Route } from 'react-router-dom';
import { TimelineProvider } from '@/hooks/use-timeline';
import { TaskProvider } from '@/hooks/use-tasks';
import HomePage from './pages/HomePage';

export default function App() {
  return (
    <TimelineProvider>
      <TaskProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* Add more routes here as needed */}
        </Routes>
      </TaskProvider>
    </TimelineProvider>
  );
} 