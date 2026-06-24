import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, BookOpen, GraduationCap, FileText, BarChart2, Settings as SettingsIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Study Planner', href: '/study', icon: BookOpen },
  { name: 'Exams', href: '/exams', icon: GraduationCap },
  { name: 'Notes', href: '/notes', icon: FileText },
  { name: 'Analytics', href: '/analytics', icon: BarChart2 },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
]

export default function Sidebar() {
  return (
    <aside className="w-64 glass-panel rounded-3xl flex-shrink-0 hidden md:flex flex-col relative z-20">
      <div className="h-20 flex items-center px-6 border-b border-white/5">
        <h1 className="text-2xl font-bold glow-text">StudentFlow</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-2 px-4">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300',
                    isActive 
                      ? 'bg-primary/20 text-primary dark:text-white shadow-[0_0_15px_rgba(var(--primary),0.2)] dark:shadow-[0_0_15px_rgba(var(--primary),0.3)] border border-primary/30 dark:border-primary/50' 
                      : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white border border-transparent'
                  )
                }
              >
                <item.icon className={cn("w-5 h-5", "transition-transform group-hover:scale-110")} />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
