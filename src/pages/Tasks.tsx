import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { TaskList } from "@/components/tasks/TaskList"
import { KanbanBoard } from "@/components/tasks/KanbanBoard"
import { TaskDialog } from "@/components/tasks/TaskDialog"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/contexts/AuthContext"

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<any | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchTasks()
    }
  }, [user])

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true })
    
    if (error) {
      console.error("Error fetching tasks:", error)
      toast({ title: "Failed to load tasks", variant: "destructive" })
    } else {
      setTasks(data || [])
    }
  }

  const handleCreateTask = () => {
    setEditingTask(null)
    setIsDialogOpen(true)
  }

  const handleEditTask = (task: any) => {
    setEditingTask({ ...task, due_date: task.due_date ? new Date(task.due_date) : undefined })
    setIsDialogOpen(true)
  }

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)
    
    if (error) {
      toast({ title: "Failed to delete task", variant: "destructive" })
    } else {
      setTasks(tasks.filter(t => t.id !== taskId))
      toast({ title: "Task deleted" })
    }
  }

  const handleToggleComplete = async (task: any) => {
    const newStatus = task.status === "completed" ? "pending" : "completed"
    
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', task.id)

    if (error) {
      toast({ title: "Failed to update task", variant: "destructive" })
    } else {
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
    }
  }

  const handleTaskMove = async (task: any, newStatus: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', task.id)

    if (error) {
      toast({ title: "Failed to move task", variant: "destructive" })
    } else {
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
    }
  }

  const handleSubmit = async (data: any) => {
    if (!user) return

    const taskData = {
      user_id: user.id,
      title: data.title,
      description: data.description,
      subject: data.subject,
      priority: data.priority,
      status: data.status || 'pending',
      due_date: data.due_date ? data.due_date.toISOString() : null,
      estimated_hours: data.estimated_hours || null
    }

    if (editingTask) {
      const { error } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', editingTask.id)

      if (error) {
        toast({ title: "Failed to update task", variant: "destructive" })
      } else {
        fetchTasks() // Refresh list
        toast({ title: "Task updated" })
      }
    } else {
      const { error } = await supabase
        .from('tasks')
        .insert([taskData])

      if (error) {
        toast({ title: "Failed to create task", variant: "destructive" })
      } else {
        fetchTasks() // Refresh list
        toast({ title: "Task created" })
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage your assignments and to-dos.
          </p>
        </div>
        <Button onClick={handleCreateTask}>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="list" className="mt-0">
          <TaskList 
            tasks={tasks} 
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onToggleComplete={handleToggleComplete}
          />
        </TabsContent>
        
        <TabsContent value="kanban" className="mt-0">
          <KanbanBoard 
            tasks={tasks} 
            onTaskMove={handleTaskMove}
            onEdit={handleEditTask}
          />
        </TabsContent>
      </Tabs>

      <TaskDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        task={editingTask}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
