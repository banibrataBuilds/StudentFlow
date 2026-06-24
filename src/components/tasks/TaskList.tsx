import { format } from "date-fns"
import { Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableBody
} from "@/components/ui/table"

// We will use real data from Supabase later
export function TaskList({ tasks, onEdit, onDelete, onToggleComplete }: any) {
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No tasks found.
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task: any) => (
              <TableRow key={task.id}>
                <TableCell>
                  <Checkbox 
                    checked={task.status === "completed"}
                    onCheckedChange={() => onToggleComplete(task)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <span className={task.status === "completed" ? "line-through text-muted-foreground" : ""}>
                    {task.title}
                  </span>
                </TableCell>
                <TableCell>{task.subject}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      task.priority === 'critical' ? 'destructive' :
                      task.priority === 'high' ? 'default' :
                      task.priority === 'medium' ? 'secondary' : 'outline'
                    }
                  >
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  {task.due_date ? format(new Date(task.due_date), "MMM d, yyyy") : "-"}
                </TableCell>
                <TableCell>
                  <span className="capitalize">{task.status.replace('_', ' ')}</span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(task)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
