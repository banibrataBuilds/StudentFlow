import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Plus, Trash2, FileText, Search, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

export default function Notes() {
  const [notes, setNotes] = useState<any[]>([])
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Local edit states
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) fetchNotes()
  }, [user])

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false })
      
    if (error) {
      toast({ title: "Failed to load notes", variant: "destructive" })
    } else {
      setNotes(data || [])
      if (data && data.length > 0 && !activeNoteId) {
        setActiveNoteId(data[0].id)
      }
    }
  }

  // Populate local edit state when active note changes
  useEffect(() => {
    const note = notes.find(n => n.id === activeNoteId)
    if (note) {
      setEditTitle(note.title || "")
      setEditContent(note.content || "")
    } else {
      setEditTitle("")
      setEditContent("")
    }
  }, [activeNoteId, notes])

  const activeNote = notes.find(n => n.id === activeNoteId)

  const filteredNotes = notes.filter(note => 
    (note.title && note.title.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (note.content && note.content.toLowerCase().includes(searchQuery.toLowerCase()))
  ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

  const handleCreateNote = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('notes')
      .insert([{
        user_id: user.id,
        title: "Untitled Note",
        content: ""
      }])
      .select()

    if (error) {
      toast({ title: "Failed to create note", variant: "destructive" })
    } else if (data) {
      setNotes([data[0], ...notes])
      setActiveNoteId(data[0].id)
    }
  }

  const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const { error } = await supabase.from('notes').delete().eq('id', id)
    
    if (error) {
      toast({ title: "Failed to delete note", variant: "destructive" })
    } else {
      const newNotes = notes.filter(n => n.id !== id)
      setNotes(newNotes)
      if (activeNoteId === id) {
        setActiveNoteId(newNotes.length > 0 ? newNotes[0].id : null)
      }
      toast({ title: "Note deleted" })
    }
  }

  const handleSaveNote = async () => {
    if (!activeNoteId) return
    setIsSaving(true)

    const updatedDate = new Date().toISOString()

    const { error } = await supabase
      .from('notes')
      .update({ title: editTitle, content: editContent, updated_at: updatedDate })
      .eq('id', activeNoteId)

    if (error) {
      toast({ title: "Failed to save note", variant: "destructive" })
    } else {
      setNotes(notes.map(note => 
        note.id === activeNoteId 
          ? { ...note, title: editTitle, content: editContent, updated_at: updatedDate } 
          : note
      ))
      toast({ title: "Note saved successfully" })
    }
    
    setIsSaving(false)
  }

  // Check if current edit state differs from saved note
  const hasUnsavedChanges = activeNote && (editTitle !== activeNote.title || editContent !== activeNote.content)

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
        <p className="text-muted-foreground mt-1">
          Capture your thoughts and class notes.
        </p>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col md:flex-row border shadow-sm">
        {/* Sidebar */}
        <div className="w-full md:w-80 border-r flex flex-col bg-muted/30">
          <div className="p-4 border-b space-y-4">
            <Button onClick={handleCreateNote} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search notes..." 
                className="pl-9 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {filteredNotes.length === 0 ? (
                <p className="text-sm text-center text-muted-foreground py-8">
                  No notes found.
                </p>
              ) : (
                filteredNotes.map(note => (
                  <div
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className={`
                      flex items-start justify-between p-3 rounded-lg cursor-pointer transition-colors
                      ${activeNoteId === note.id ? 'bg-primary/10 hover:bg-primary/15' : 'hover:bg-muted'}
                    `}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="font-medium text-sm truncate">
                        {note.title || "Untitled"}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {note.content || "No content"}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-2">
                        {format(new Date(note.updated_at), "MMM d, h:mm a")}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                      onClick={(e) => handleDeleteNote(note.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col bg-background">
          {activeNote ? (
            <>
              <div className="p-6 border-b flex items-start justify-between">
                <div className="flex-1 min-w-0 mr-4">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Note Title"
                    className="w-full text-2xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground focus:ring-0"
                  />
                  <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <FileText className="w-4 h-4 mr-2" />
                    Last edited {format(new Date(activeNote.updated_at), "MMMM d, yyyy 'at' h:mm a")}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button 
                    onClick={handleSaveNote}
                    disabled={!hasUnsavedChanges || isSaving}
                    variant={hasUnsavedChanges ? "default" : "secondary"}
                    className="flex-shrink-0"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={(e) => handleDeleteNote(activeNote.id, e)}
                    className="flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 p-6">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Start typing your note here..."
                  className="w-full h-full resize-none bg-transparent border-none outline-none text-base leading-relaxed placeholder:text-muted-foreground focus:ring-0"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col">
              <FileText className="w-12 h-12 mb-4 opacity-20" />
              <p>Select a note or create a new one</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
