import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, BookOpen, Clock, Target } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/contexts/AuthContext"
import { formatDistanceToNow } from "date-fns"

export function ActivityFeed() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      fetchActivities()
    }
  }, [user])

  const fetchActivities = async () => {
    // Fetch recent tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, title, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    // Fetch recent study sessions
    const { data: sessions } = await supabase
      .from('study_sessions')
      .select('id, subject, duration_minutes, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    let merged: any[] = []

    if (tasks) {
      tasks.forEach(task => {
        merged.push({
          id: `task-${task.id}`,
          type: task.status === 'completed' ? 'task_completed' : 'task_created',
          title: task.status === 'completed' ? `Completed task: ${task.title}` : `New task: ${task.title}`,
          date: new Date(task.created_at),
          icon: task.status === 'completed' ? CheckCircle2 : Clock,
          color: task.status === 'completed' ? "text-emerald-500" : "text-amber-500",
          bgColor: task.status === 'completed' ? "bg-emerald-500/10" : "bg-amber-500/10",
        })
      })
    }

    if (sessions) {
      sessions.forEach(session => {
        merged.push({
          id: `session-${session.id}`,
          type: 'study_session',
          title: `Studied ${session.subject} for ${session.duration_minutes}m`,
          date: new Date(session.created_at),
          icon: BookOpen,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
        })
      })
    }

    // Sort by date descending
    merged.sort((a, b) => b.date.getTime() - a.date.getTime())
    
    // Take top 5
    const top5 = merged.slice(0, 5).map(item => ({
      ...item,
      time: formatDistanceToNow(item.date, { addSuffix: true })
    }))

    setActivities(top5)
  }

  return (
    <Card className="col-span-1 h-full bg-transparent border-primary/10 shadow-none backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start">
                <div className={`mt-0.5 p-2 rounded-full ${activity.bgColor}`}>
                  <activity.icon className={`h-4 w-4 ${activity.color}`} />
                </div>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
