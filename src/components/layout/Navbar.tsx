import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Menu, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { navItems } from '@/components/layout/Sidebar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Navbar() {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()

  const handleSignOut = async () => {
    await signOut()
  }

  // Helper to get first letter of name
  const initial = user?.user_metadata?.name ? user.user_metadata.name.charAt(0).toUpperCase() : 'U'

  return (
    <header className="h-16 glass-panel rounded-full flex items-center justify-between px-4 md:px-6 flex-shrink-0 relative z-20">
      <div className="flex items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden mr-2 hover:bg-white/10 rounded-full">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 glass-panel border-r-white/10">
            <div className="h-20 flex items-center px-6 border-b border-white/5">
              <h1 className="text-xl font-bold glow-text">StudentFlow</h1>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-2 px-3">
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
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="relative rounded-full hover:bg-white/10 hover:shadow-[0_0_15px_rgba(var(--primary),0.3)] transition-all duration-300"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-white/20 hover:border-primary transition-all duration-300 hover:shadow-[0_0_15px_rgba(var(--primary),0.4)]">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.name || 'User'} />
                <AvatarFallback className="bg-primary/20 text-primary">{initial}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 glass-panel border-white/10" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-foreground">{user?.user_metadata?.name || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem onClick={handleSignOut} className="hover:bg-white/10 cursor-pointer">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
