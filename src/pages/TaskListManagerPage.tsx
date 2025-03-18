import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskList from "@/components/TaskListManager/TaskList";
import TaskImportExport from "@/components/TaskListManager/TaskImportExport";
import RandomTaskDialog from "@/components/TaskListManager/RandomTaskDialog";
import { useTaskListManager } from "@/hooks/use-task-list-manager";
import { Shuffle } from "lucide-react";

const TaskListManagerPage = () => {
  const { tasks } = useTaskListManager();
  const [activeTab, setActiveTab] = useState("tasks");
  const [isRandomTaskDialogOpen, setIsRandomTaskDialogOpen] = useState(false);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Task List Manager</h1>
        <Button 
          onClick={() => setIsRandomTaskDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Shuffle size={16} />
          Random Task
        </Button>
      </div>
      
      <Tabs defaultValue="tasks" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="import-export">Import/Export</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>My Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskList />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="import-export" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Import & Export</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskImportExport />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <RandomTaskDialog 
        isOpen={isRandomTaskDialogOpen}
        onClose={() => setIsRandomTaskDialogOpen(false)}
      />
    </div>
  );
};

export default TaskListManagerPage; 