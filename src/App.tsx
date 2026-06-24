import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'
import AppLayout from '@/components/layout/AppLayout'

import Dashboard from '@/pages/Dashboard'
import Tasks from '@/pages/Tasks'
import StudyPlanner from '@/pages/StudyPlanner'
import Exams from '@/pages/Exams'
import Notes from '@/pages/Notes'
import Analytics from '@/pages/Analytics'
import Login from '@/pages/auth/Login'
import Signup from '@/pages/auth/Signup'
import Settings from '@/pages/Settings'

import { AntigravityBackground } from '@/components/AntigravityBackground'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (!user) return <Navigate to="/login" />
  return <>{children}</>
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <Router>
          <div className="flex h-screen w-full overflow-hidden bg-background relative z-0">
            <AntigravityBackground />
            <div className="relative z-10 flex h-full w-full overflow-hidden">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="study" element={<StudyPlanner />} />
                  <Route path="exams" element={<Exams />} />
                  <Route path="notes" element={<Notes />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Routes>
            </div>
          </div>
        </Router>
      <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
