import { useState } from "react";
import { useTaskListManager } from "@/hooks/use-task-list-manager";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Download, Upload, ClipboardCopy, Check } from "lucide-react";

const TaskImportExport = () => {
  const { importFromMarkdown, exportToMarkdown } = useTaskListManager();
  const [importText, setImportText] = useState("");
  const [exportText, setExportText] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [copied, setCopied] = useState(false);

  const handleImport = () => {
    try {
      if (!importText.trim()) {
        setMessage({ 
          type: "error", 
          text: "Please enter Markdown content to import" 
        });
        return;
      }
      
      importFromMarkdown(importText);
      setMessage({ 
        type: "success", 
        text: "Tasks imported successfully" 
      });
      setImportText("");
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: "Error importing tasks. Please check your Markdown format." 
      });
    }
  };

  const handleExport = () => {
    try {
      const markdown = exportToMarkdown();
      setExportText(markdown);
      
      if (!markdown.trim()) {
        setMessage({ 
          type: "info", 
          text: "No tasks to export" 
        });
      } else {
        setMessage({ 
          type: "success", 
          text: "Tasks exported to Markdown" 
        });
      }
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: "Error exporting tasks" 
      });
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: "Failed to copy to clipboard" 
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([exportText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tasks.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Tabs defaultValue="import">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="import">Import</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>
        
        <TabsContent value="import" className="mt-4">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Import tasks from Markdown format. Each task should be in the format:
              <br />
              <code>- [ ] Task content</code> for incomplete tasks
              <br />
              <code>- [x] Task content</code> for completed tasks
              <br />
              Use indentation for subtasks (2 spaces = 1 level).
            </p>
            
            <Textarea
              placeholder="Paste your Markdown tasks here..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={10}
              className="font-mono"
            />
            
            <Button onClick={handleImport} className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Import Tasks
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="export" className="mt-4">
          <div className="space-y-4">
            <Button onClick={handleExport} className="w-full">
              Generate Markdown
            </Button>
            
            {exportText && (
              <>
                <Textarea
                  value={exportText}
                  readOnly
                  rows={10}
                  className="font-mono"
                />
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleCopyToClipboard}
                    className="flex-1"
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <ClipboardCopy className="mr-2 h-4 w-4" />
                        Copy to Clipboard
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={handleDownload}
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {message.text && (
        <Alert 
          className={`mt-4 ${
            message.type === "error" 
              ? "bg-red-50 text-red-800 border-red-300" 
              : message.type === "success" 
                ? "bg-green-50 text-green-800 border-green-300"
                : "bg-blue-50 text-blue-800 border-blue-300"
          }`}
        >
          <AlertTitle>
            {message.type === "error" 
              ? "Error" 
              : message.type === "success" 
                ? "Success"
                : "Info"}
          </AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}
      
      <div className="mt-6">
        <h3 className="font-medium text-lg mb-2">Example Format</h3>
        <Card className="p-4 bg-muted font-mono text-sm">
          <pre className="whitespace-pre-wrap">
{`- [ ] Task 1
- [x] Task 2 (completed)
  - [ ] Subtask 2.1
    - [ ] Sub-subtask 2.1.1
  - [x] Subtask 2.2 (completed)
- [ ] Task 3`}
          </pre>
        </Card>
      </div>
    </div>
  );
};

export default TaskImportExport; 