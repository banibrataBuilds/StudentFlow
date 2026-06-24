import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, User, Building2, BookOpen } from "lucide-react"

export default function Settings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Local state for form fields
  const [name, setName] = useState(user?.user_metadata?.name || "")
  const [gender, setGender] = useState(user?.user_metadata?.gender || "")
  const [age, setAge] = useState(user?.user_metadata?.age || "")
  const [college, setCollege] = useState(user?.user_metadata?.college || "")
  const [semester, setSemester] = useState(user?.user_metadata?.semester || "")
  const [department, setDepartment] = useState(user?.user_metadata?.department || "")

  // Fetch initial profile from Supabase profiles table
  useEffect(() => {
    async function loadProfile() {
      if (!user) return
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        
      if (data) {
        if (data.name) setName(data.name)
        if (data.university) setCollege(data.university)
        if (data.department) setDepartment(data.department)
        if (data.semester) setSemester(data.semester)
        
        // Load additional fields from user metadata if they exist
        if (user.user_metadata?.gender) setGender(user.user_metadata.gender)
        if (user.user_metadata?.age) setAge(user.user_metadata.age)
      }
    }
    
    loadProfile()
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!user) {
      toast({ title: "You must be logged in", variant: "destructive" })
      setIsLoading(false)
      return
    }

    try {
      // 1. Update auth.users metadata
      const { error: authError } = await supabase.auth.updateUser({ 
        data: { name, gender, age, college, semester, department } 
      })
      
      if (authError) throw authError

      // 2. Upsert profile table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name,
          email: user.email,
          university: college,
          department,
          semester
        })
        
      if (profileError) throw profileError

      toast({
        title: "Profile Updated",
        description: "Your settings have been saved successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and personal information.
        </p>
      </div>

      <div className="grid gap-6">
        <form onSubmit={handleSave}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your basic profile details here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="E.g., John Doe" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    value={user?.email || ""} 
                    disabled 
                    className="bg-muted/50"
                  />
                  <p className="text-[10px] text-muted-foreground">Email cannot be changed directly.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input 
                    id="age" 
                    type="number" 
                    value={age} 
                    onChange={(e) => setAge(e.target.value)} 
                    placeholder="E.g., 20" 
                    min={10} max={100}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Academic Details
              </CardTitle>
              <CardDescription>
                Information about your university and current studies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="college">College / University Name</Label>
                  <Input 
                    id="college" 
                    value={college} 
                    onChange={(e) => setCollege(e.target.value)} 
                    placeholder="E.g., Massachusetts Institute of Technology" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department / Major</Label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="department" 
                      className="pl-9"
                      value={department} 
                      onChange={(e) => setDepartment(e.target.value)} 
                      placeholder="E.g., Computer Science" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester">Current Semester</Label>
                  <Select value={semester} onValueChange={setSemester}>
                    <SelectTrigger id="semester">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Semester 1</SelectItem>
                      <SelectItem value="2">Semester 2</SelectItem>
                      <SelectItem value="3">Semester 3</SelectItem>
                      <SelectItem value="4">Semester 4</SelectItem>
                      <SelectItem value="5">Semester 5</SelectItem>
                      <SelectItem value="6">Semester 6</SelectItem>
                      <SelectItem value="7">Semester 7</SelectItem>
                      <SelectItem value="8">Semester 8</SelectItem>
                      <SelectItem value="other">Other / Graduated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
