# Timeline Component

This directory contains the components for the Timeline feature, which has been refactored into smaller, more maintainable pieces.

## Component Structure

The Timeline is organized as follows:

```
components/timeline/
├── index.tsx                # Main export file
├── Timeline.tsx             # Core container component
├── TaskNode.tsx             # Individual task node component
├── EventNode.tsx            # Event node component
├── DependencyLines.tsx      # Dependency visualization component
├── TimelineControls.tsx     # Timeline navigation controls
├── TimelineHeader.tsx       # Timeline header with dates
└── utils/
    ├── position-utils.ts    # Position calculation utilities
    └── node-layout.ts       # Node layout algorithms
```

## Components

### Main Components

- **Timeline**: The main container component that integrates all other parts.
- **TaskNode**: Renders an individual task on the timeline.
- **EventNode**: Renders the event marker on the timeline.
- **DependencyLines**: Visualizes connection lines between dependent tasks.

### UI Components

- **TimelineControls**: Navigation and zoom controls for the timeline.
- **TimelineHeader**: Displays date labels and markers at the top of the timeline.

### Utilities

- **position-utils.ts**: Functions for calculating positions, sizing, and layout metrics.
- **node-layout.ts**: Algorithms for processing tasks, handling overlaps, and assigning levels.

## Data Types

The primary data type that is used throughout the component is the `TaskNode` interface:

```typescript
interface TaskNode {
  task: Task | null // null for event marker
  position: number // percentage position on the timeline
  width: number // width as percentage of timeline
  level: number // vertical level (0-based)
  date: Date
  isEvent?: boolean
  title: string
  id?: string
}
```

## Usage

To use the Timeline in your application, import the main `Timeline` component:

```tsx
import { Timeline } from "@/components/timeline"

export default function TimelinePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Project Timeline</h1>
      <Timeline />
    </div>
  )
}
```

## Dependencies

The Timeline component relies on the following hooks:

- `useTimeline`: Provides timeline state and navigation functions
- `useTasks`: Provides task data and operations

See the respective hook files for implementation details. 