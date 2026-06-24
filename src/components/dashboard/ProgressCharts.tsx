import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/contexts/AuthContext"

const INITIAL_DATA = [
  { name: "Mon", hours: 0 },
  { name: "Tue", hours: 0 },
  { name: "Wed", hours: 0 },
  { name: "Thu", hours: 0 },
  { name: "Fri", hours: 0 },
  { name: "Sat", hours: 0 },
  { name: "Sun", hours: 0 },
]

export function ProgressCharts() {
  const { user } = useAuth()
  const [data, setData] = useState(INITIAL_DATA)

  useEffect(() => {
    if (user) {
      fetchStudyData()
    }
  }, [user])

  const fetchStudyData = async () => {
    // Get sessions from the past 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: sessions, error } = await supabase
      .from('study_sessions')
      .select('date, duration_minutes')
      .gte('date', sevenDaysAgo.toISOString())

    if (error || !sessions) return

    // Group by day of week
    const newData = [...INITIAL_DATA].map(d => ({ ...d, hours: 0 }))
    const daysMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    sessions.forEach(session => {
      const date = new Date(session.date)
      const dayName = daysMap[date.getDay()]
      const index = newData.findIndex(d => d.name === dayName)
      if (index !== -1) {
        newData[index].hours += session.duration_minutes / 60
      }
    })

    // Round to 1 decimal place
    const roundedData = newData.map(d => ({
      ...d,
      hours: Math.round(d.hours * 10) / 10
    }))

    setData(roundedData)
  }

  return (
    <Card className="col-span-1 lg:col-span-2 h-full flex flex-col bg-transparent border-primary/10 shadow-none backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Study Hours This Week</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-[250px]">
        <div className="h-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}h`}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar
                dataKey="hours"
                fill="currentColor"
                radius={[4, 4, 0, 0]}
                className="fill-primary"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
