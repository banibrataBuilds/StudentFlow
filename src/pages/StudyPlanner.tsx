import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Clock, Target, BookOpen, Trash2, Edit } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/contexts/AuthContext"

const sessionSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  date: z.date({ message: "A date is required" }),
  duration_minutes: z.number().min(1, "Duration must be at least 1 minute"),
  goal: z.string().optional(),
})

export default function StudyPlanner() {
  const [sessions, setSessions] = useState<any[]>([])
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchSessions()
    }
  }, [user])

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .order('date', { ascending: false })
      
    if (error) {
      toast({ title: "Failed to load study sessions", variant: "destructive" })
    } else {
      setSessions(data || [])
    }
  }

  const form = useForm<z.infer<typeof sessionSchema>>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      subject: "",
      duration_minutes: 60,
      goal: "",
    },
  })

  const onSubmit = async (data: z.infer<typeof sessionSchema>) => {
    if (!user) return

    const sessionData = {
      user_id: user.id,
      subject: data.subject,
      date: format(data.date, 'yyyy-MM-dd'),
      duration_minutes: data.duration_minutes,
      goal: data.goal || null
    }

    if (editingSessionId) {
      const { error } = await supabase
        .from('study_sessions')
        .update(sessionData)
        .eq('id', editingSessionId)

      if (error) {
        toast({ title: "Failed to update session", variant: "destructive" })
      } else {
        toast({ title: "Study session updated successfully" })
        setEditingSessionId(null)
        form.reset({
          subject: "",
          duration_minutes: 60,
          goal: "",
          date: undefined
        })
        fetchSessions()
      }
    } else {
      const { error } = await supabase
        .from('study_sessions')
        .insert([sessionData])

      if (error) {
        toast({ title: "Failed to log session", variant: "destructive" })
      } else {
        toast({ title: "Study session logged successfully" })
        form.reset({
          subject: "",
          duration_minutes: 60,
          goal: "",
          date: undefined
        })
        fetchSessions()
      }
    }
  }

  const handleEditSession = (session: any) => {
    setEditingSessionId(session.id)
    
    // Parse the date safely. session.date is yyyy-MM-dd
    const dateParts = session.date.split('-')
    const localDate = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]))

    form.reset({
      subject: session.subject,
      date: localDate,
      duration_minutes: session.duration_minutes,
      goal: session.goal || "",
    })
    
    // Scroll to top where the form is
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingSessionId(null)
    form.reset({
      subject: "",
      duration_minutes: 60,
      goal: "",
      date: undefined
    })
  }

  const handleDeleteSession = async (id: string) => {
    const { error } = await supabase.from('study_sessions').delete().eq('id', id)
    
    if (error) {
      toast({ title: "Failed to delete session", variant: "destructive" })
    } else {
      setSessions(sessions.filter(s => s.id !== id))
      toast({ title: "Study session deleted", variant: "destructive" })
    }
  }

  const totalHours = sessions.reduce((acc, curr) => acc + curr.duration_minutes, 0) / 60
  const uniqueSubjects = new Set(sessions.map(s => s.subject)).size

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Study Planner</h1>
        <p className="text-muted-foreground mt-1">
          Log your study sessions and track your progress.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{editingSessionId ? "Edit Session" : "Log Session"}</CardTitle>
            <CardDescription>{editingSessionId ? "Update your study session details" : "Record a new study session"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., Computer Science" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col mt-2.5">
                      <FormLabel>Date</FormLabel>
                      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date)
                              setIsCalendarOpen(false)
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What do you want to achieve?" 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingSessionId ? "Save Changes" : "Log Session"}
                  </Button>
                  {editingSessionId && (
                    <Button type="button" variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Hours Studied</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subjects Covered</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{uniqueSubjects}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No study sessions logged yet.</p>
                ) : (
                  sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{session.subject}</p>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <Target className="w-3 h-3 mr-1" />
                          {session.goal || "No goal specified"}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{session.duration_minutes} mins</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(session.date), "MMM d, yyyy")}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditSession(session)}
                            className="text-muted-foreground hover:text-primary h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteSession(session.id)}
                            className="text-muted-foreground hover:text-destructive h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
