
import { ProgressCharts } from "@/components/dashboard/ProgressCharts"

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Detailed insights into your productivity and study habits.
        </p>
      </div>

      <div className="grid gap-6">
        <ProgressCharts />
      </div>
    </div>
  )
}
