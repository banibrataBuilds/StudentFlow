import { useState, useEffect } from "react"
import { ActivityFeed } from "@/components/dashboard/ActivityFeed"
import { ProgressCharts } from "@/components/dashboard/ProgressCharts"
import { StatCard } from "@/components/dashboard/StatCard"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabaseClient"
import { CheckSquare, AlertCircle, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import type { Variants } from "framer-motion"

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  }
}

const item: Variants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export default function Dashboard() {
  const { user } = useAuth()
  const [totalTasks, setTotalTasks] = useState(0)
  const [overdueTasks, setOverdueTasks] = useState(0)
  const [productivityScore, setProductivityScore] = useState(0)
  const [pendingToday, setPendingToday] = useState(0)

  useEffect(() => {
    if (user) {
      fetchDashboardStats()
    }
  }, [user])

  const fetchDashboardStats = async () => {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
    
    if (error || !tasks) return

    let total = tasks.length
    let completed = 0
    let overdue = 0
    let pendingTodayCount = 0
    
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]

    tasks.forEach(task => {
      if (task.status === 'completed') {
        completed++
      } else {
        if (task.due_date) {
          const dueDateStr = task.due_date.split('T')[0]
          const dueDateObj = new Date(task.due_date)
          
          if (dueDateObj < now && dueDateStr !== todayStr) {
            overdue++
          } else if (dueDateStr === todayStr) {
            pendingTodayCount++
          }
        }
      }
    })

    const score = total > 0 ? Math.round((completed / total) * 100) : 0

    setTotalTasks(total)
    setCompletedTasks(completed)
    setOverdueTasks(overdue)
    setProductivityScore(score)
    setPendingToday(pendingTodayCount)
  }

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome back, {user?.user_metadata?.name?.split(' ')[0] || 'Student'}!
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Here's what's happening with your studies today.
        </p>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      >
        {/* Stat Cards - Linear Layout */}
        <motion.div variants={item} className="flex flex-col gap-4">
          <StatCard
            title="Total Tasks"
            value={totalTasks.toString()}
            icon={CheckSquare}
            description={pendingToday > 0 ? `${pendingToday} pending today` : "No tasks due today"}
          />
          <StatCard
            title="Productivity Score"
            value={`${productivityScore}%`}
            icon={TrendingUp}
            trend={{ value: productivityScore > 50 ? 5 : 0, isPositive: productivityScore > 50 }}
            description="overall completion rate"
          />
          <StatCard
            title="Overdue Tasks"
            value={overdueTasks.toString()}
            icon={AlertCircle}
            description={overdueTasks === 0 ? "All caught up!" : "Requires attention"}
            trend={overdueTasks > 0 ? { value: overdueTasks, isPositive: false } : undefined}
          />
        </motion.div>

        {/* Charts and Feed */}
        <motion.div variants={item} className="lg:col-span-1">
          <ProgressCharts />
        </motion.div>

        <motion.div variants={item} className="lg:col-span-1">
          <ActivityFeed />
        </motion.div>
      </motion.div>
    </div>
  )
}
