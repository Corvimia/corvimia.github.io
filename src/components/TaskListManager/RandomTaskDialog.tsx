import { useState, useEffect } from "react";
import { useTaskListManager, type TaskItem } from "@/hooks/use-task-list-manager";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronRight, CheckCircle } from "lucide-react";

// Add CSS animation styles to the component
const celebrationStyles = `
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }
  
  @keyframes pulse {
    0% { opacity: 0.7; }
    50% { opacity: 1; }
    100% { opacity: 0.7; }
  }
  
  .celebration-container {
    position: relative;
    overflow: hidden;
  }
  
  .celebration-icon {
    animation: bounce 1s ease infinite;
  }
  
  .celebration-text {
    animation: pulse 1.5s ease infinite;
  }
  
  .celebration-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle, rgba(255,222,89,0.2) 0%, rgba(250,250,250,0) 70%);
    z-index: -1;
    opacity: 0;
    animation: fadeInOut 1.5s ease-in-out forwards;
  }
  
  @keyframes fadeInOut {
    0% { opacity: 0; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.1); }
    100% { opacity: 0; transform: scale(1); }
  }
`;

type RandomTaskDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

type TaskWithPath = {
  task: TaskItem;
  path: TaskItem[]; // Parent tasks, ordered from root to immediate parent
};

const RandomTaskDialog = ({ isOpen, onClose }: RandomTaskDialogProps) => {
  const { tasks, toggleTaskCompletion } = useTaskListManager();
  const [randomTask, setRandomTask] = useState<TaskWithPath | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Get a random task, prioritizing subtasks
  const getRandomTask = () => {
    // Flatten tasks into a list of all tasks that have no children
    // or tasks that have children but are not completed, keeping track of their paths
    const flattenTasks = (taskList: TaskItem[], parentPath: TaskItem[] = []): TaskWithPath[] => {
      let result: TaskWithPath[] = [];
      
      for (const task of taskList) {
        if (task.children.length > 0) {
          // If task has children, only include its subtasks
          result = [...result, ...flattenTasks(task.children, [...parentPath, task])];
        } else if (!task.completed) {
          // If task has no children and is not completed, include it with its path
          result.push({ task, path: parentPath });
        }
      }
      
      return result;
    };
    
    const eligibleTasks = flattenTasks(tasks);
    
    if (eligibleTasks.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * eligibleTasks.length);
    return eligibleTasks[randomIndex];
  };

  // Get a new random task when the dialog opens or when skipping
  const refreshRandomTask = () => {
    setRandomTask(getRandomTask());
  };

  // Initialize with a random task when opened
  useEffect(() => {
    if (isOpen) {
      refreshRandomTask();
    }
  }, [isOpen]);

  // Add the style element to the document once
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = celebrationStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleDone = () => {
    if (randomTask) {
      toggleTaskCompletion(randomTask.task.id);
      
      // Show celebration animation
      setShowCelebration(true);
      
      // After animation completes, get a new task
      setTimeout(() => {
        setShowCelebration(false);
        const nextTask = getRandomTask();
        
        if (nextTask) {
          setRandomTask(nextTask);
        } else {
          // No more tasks available, close the dialog
          onClose();
        }
      }, 1500); // Animation duration
    }
  };

  const handleSkip = () => {
    refreshRandomTask();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Random Task</DialogTitle>
        </DialogHeader>
        
        {showCelebration ? (
          <div className="py-12 text-center celebration-container">
            <div className="flex flex-col items-center justify-center">
              <CheckCircle className="text-green-500 mb-4 celebration-icon" size={64} />
              <h3 className="text-2xl font-bold text-green-500 celebration-text">
                Well done!
              </h3>
            </div>
            <div className="celebration-backdrop"></div>
          </div>
        ) : randomTask ? (
          <div className="py-6">
            {/* Show parent task hierarchy for context if it exists */}
            {randomTask.path.length > 0 && (
              <div className="mb-4 space-y-2">
                {randomTask.path.map((parentTask, index) => (
                  <div 
                    key={parentTask.id} 
                    className="flex items-center text-muted-foreground"
                    style={{ 
                      marginLeft: `${index * 12}px`,
                      opacity: 0.7 + (index * 0.1) // Increasing opacity as we get closer to the subtask
                    }}
                  >
                    <div className="flex items-center">
                      {index > 0 && <ChevronRight size={14} className="mx-1" />}
                      <span>{parentTask.content}</span>
                    </div>
                    {index === randomTask.path.length - 1 && (
                      <ChevronRight size={14} className="mx-1" />
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Show the actual random task */}
            <div 
              className="flex items-center space-x-3"
              style={{ 
                marginLeft: `${randomTask.path.length * 12}px`
              }}
            >
              <Checkbox 
                checked={randomTask.task.completed} 
                onCheckedChange={() => toggleTaskCompletion(randomTask.task.id)}
              />
              <div className="font-medium">{randomTask.task.content}</div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground">
            No incomplete tasks available. Great job! 🎉
          </div>
        )}
        
        <DialogFooter className="gap-2">
          {randomTask && !showCelebration && (
            <>
              <Button variant="default" onClick={handleDone}>
                Done
              </Button>
              <Button variant="outline" onClick={handleSkip}>
                Skip
              </Button>
            </>
          )}
          {!randomTask && (
            <Button variant="default" onClick={onClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RandomTaskDialog; 