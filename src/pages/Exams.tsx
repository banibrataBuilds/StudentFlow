import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format, differenceInDays } from "date-fns"
import { Calendar as CalendarIcon, Clock, BookOpen, Plus, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/contexts/AuthContext"

export default function Exams() {
  const [exams, setExams] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExamId, setEditingExamId] = useState<string | null>(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  
  // Form State
  const [subject, setSubject] = useState("")
  const [type, setType] = useState("Midterm")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [notes, setNotes] = useState("")

  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchExams()
    }
  }, [user])

  const fetchExams = async () => {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .order('exam_date', { ascending: true })
    
    if (error) {
      toast({ title: "Failed to load exams", variant: "destructive" })
    } else {
      setExams(data || [])
    }
  }

  const handleOpenAdd = () => {
    setEditingExamId(null)
    setSubject("")
    setType("Midterm")
    setDate(new Date())
    setNotes("")
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (exam: any) => {
    setEditingExamId(exam.id)
    setSubject(exam.subject)
    setType(exam.exam_type)
    setDate(new Date(exam.exam_date))
    setNotes(exam.notes || "")
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!subject || !date || !user) {
      toast({ title: "Subject and Date are required", variant: "destructive" })
      return
    }

    const examData = {
      user_id: user.id,
      subject,
      exam_type: type,
      exam_date: date.toISOString(),
      notes
    }

    if (editingExamId) {
      const { error } = await supabase
        .from('exams')
        .update(examData)
        .eq('id', editingExamId)

      if (error) {
        toast({ title: "Failed to update exam", variant: "destructive" })
      } else {
        toast({ title: "Exam updated" })
        fetchExams()
      }
    } else {
      const { error } = await supabase
        .from('exams')
        .insert([examData])

      if (error) {
        toast({ title: "Failed to add exam", variant: "destructive" })
      } else {
        toast({ title: "Exam added" })
        fetchExams()
      }
    }
    setIsDialogOpen(false)
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('exams').delete().eq('id', id)
    
    if (error) {
      toast({ title: "Failed to delete exam", variant: "destructive" })
    } else {
      setExams(exams.filter(e => e.id !== id))
      toast({ title: "Exam deleted" })
    }
  }

  const sortedExams = [...exams].sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime())

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
          <p className="text-muted-foreground mt-1">
            Keep track of your upcoming exams and quizzes.
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Exam
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedExams.map((exam) => {
          const daysRemaining = differenceInDays(new Date(exam.exam_date), new Date())
          const isUrgent = daysRemaining >= 0 && daysRemaining <= 3
          const isPast = daysRemaining < 0

          return (
            <Card key={exam.id} className={cn("relative group transition-all", isUrgent && "border-destructive shadow-sm", isPast && "opacity-60")}>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10 bg-card rounded-md shadow-sm border p-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEdit(exam)}>
                  <Edit className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(exam.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>

              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-xl pr-12">{exam.subject}</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Badge variant="secondary" className="mr-2">{exam.exam_type}</Badge>
                  </div>
                </div>
                <div className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg flex-shrink-0",
                  isUrgent ? 'bg-destructive/10 text-destructive' : 
                  isPast ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
                )}>
                  <span className="text-2xl font-bold">{isPast ? "Done" : daysRemaining}</span>
                  {!isPast && <span className="text-[10px] uppercase font-semibold">Days</span>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mt-4">
                  <div className="flex items-center text-sm">
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                    {format(new Date(exam.exam_date), "EEEE, MMMM do, yyyy")}
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4 opacity-70" />
                    {format(new Date(exam.exam_date), "h:mm a")}
                  </div>
                  {exam.notes && (
                    <div className="flex items-start text-sm bg-muted/50 p-3 rounded-md mt-4">
                      <BookOpen className="mr-2 h-4 w-4 mt-0.5 opacity-70 flex-shrink-0" />
                      <span className="text-muted-foreground">{exam.notes}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {sortedExams.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg">
            <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-lg font-medium">No Exams Scheduled</h3>
            <p className="text-muted-foreground">You are all caught up! Enjoy your free time.</p>
            <Button onClick={handleOpenAdd} variant="outline" className="mt-4">Add your first exam</Button>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingExamId ? "Edit Exam" : "Add Exam"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., Data Structures" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={type} 
                onChange={(e) => setType(e.target.value)}
              >
                <option value="Midterm">Midterm</option>
                <option value="Final">Final</option>
                <option value="Quiz">Quiz</option>
                <option value="Assignment">Assignment</option>
                <option value="Presentation">Presentation</option>
              </select>
            </div>

            <div className="space-y-2 flex flex-col">
              <label className="text-sm font-medium">Date</label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full pl-3 text-left font-normal", !date && "text-muted-foreground")}
                  >
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                      setDate(d)
                      setIsCalendarOpen(false)
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Chapters 1-5, focus on definitions" 
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
