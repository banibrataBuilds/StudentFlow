import { useState, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

// Sortable Task Item
function SortableTaskCard({ task, onEdit }: any) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'Task', task },
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 border-2 border-primary border-dashed rounded-lg h-[100px]"
      />
    )
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing hover:border-primary transition-colors"
      onClick={() => onEdit(task)}
    >
      <CardContent className="p-4">
        <h4 className="font-semibold">{task.title}</h4>
        <div className="flex justify-between items-center mt-2">
          <Badge variant="outline">{task.subject}</Badge>
          <Badge 
            variant={
              task.priority === 'critical' ? 'destructive' :
              task.priority === 'high' ? 'default' :
              task.priority === 'medium' ? 'secondary' : 'outline'
            }
          >
            {task.priority}
          </Badge>
        </div>
        {task.due_date && (
          <p className="text-xs text-muted-foreground mt-3">
            Due: {format(new Date(task.due_date), "MMM d")}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

const COLUMNS = [
  { id: 'pending', title: 'Pending' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'completed', title: 'Completed' },
]

export function KanbanBoard({ tasks, onTaskMove, onEdit }: any) {
  const [activeTask, setActiveTask] = useState<any | null>(null)

  const columns = useMemo(() => {
    const cols = {
      pending: tasks.filter((t: any) => t.status === 'pending'),
      in_progress: tasks.filter((t: any) => t.status === 'in_progress'),
      completed: tasks.filter((t: any) => t.status === 'completed'),
    }
    return cols
  }, [tasks])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveTask(active.data.current?.task)
  }

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveTask = active.data.current?.type === 'Task'
    const isOverTask = over.data.current?.type === 'Task'
    const isOverColumn = over.data.current?.type === 'Column'

    if (!isActiveTask) return

    // Dropping a Task over another Task
    if (isActiveTask && isOverTask) {
      const activeContainer = active.data.current?.task.status
      const overContainer = over.data.current?.task.status
      if (activeContainer !== overContainer) {
        onTaskMove(active.data.current?.task, overContainer)
      }
    }

    // Dropping a Task over an empty column
    if (isActiveTask && isOverColumn) {
      const activeContainer = active.data.current?.task.status
      const overContainer = over.id
      if (activeContainer !== overContainer) {
        onTaskMove(active.data.current?.task, overContainer)
      }
    }
  }

  const onDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id
    if (activeId === overId) return

    const isActiveTask = active.data.current?.type === 'Task'
    const isOverTask = over.data.current?.type === 'Task'

    if (isActiveTask && isOverTask) {
      // Reordering logic could be added here if we had an 'order' field
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((col) => (
          <div key={col.id} className="flex flex-col bg-muted/50 rounded-xl p-4">
            <h3 className="font-bold mb-4 flex items-center justify-between">
              {col.title}
              <Badge variant="secondary" className="ml-2">
                {columns[col.id as keyof typeof columns].length}
              </Badge>
            </h3>
            <SortableContext
              id={col.id}
              items={columns[col.id as keyof typeof columns].map((t: any) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div 
                className="flex flex-col gap-3 min-h-[200px]"
                // Data attributes to identify as column for droppable area
                {...{ 'data-type': 'Column', id: col.id }}
              >
                {columns[col.id as keyof typeof columns].map((task: any) => (
                  <SortableTaskCard key={task.id} task={task} onEdit={onEdit} />
                ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <SortableTaskCard task={activeTask} onEdit={() => {}} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
