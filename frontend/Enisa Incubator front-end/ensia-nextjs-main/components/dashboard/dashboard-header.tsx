"use client"

import { usePathname } from "next/navigation"
import { Bell, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { useMobile } from "@/hooks/use-mobile"

export default function DashboardHeader() {
  const { setTheme, theme } = useTheme()
  const isMobile = useMobile()
  const pathname = usePathname()

  // Determine current section based on pathname
  const getCurrentSection = () => {
    if (pathname?.includes("/startups")) return "Startups"
    if (pathname?.includes("/mentors")) return "Mentors & Trainers"
    if (pathname?.includes("/trainers")) return "Mentors & Trainers"
    if (pathname?.includes("/applications")) return "Applications"
    if (pathname?.includes("/events")) return "Events & Workshops"
    if (pathname?.includes("/analytics")) return "Analytics"
    if (pathname?.includes("/settings")) return "Settings"
    return "Admin Dashboard"
  }

  return (
    <header className="flex h-16 items-center border-b bg-background">
      <div className="flex w-64 items-center border-r px-4">
        <span className="text-lg font-semibold">Admin</span>
      </div>
      <div className="flex flex-1 items-center justify-between px-4">
        <h1 className="text-xl font-semibold">{getCurrentSection()}</h1>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>New application received</DropdownMenuItem>
              <DropdownMenuItem>Mentor session scheduled</DropdownMenuItem>
              <DropdownMenuItem>Milestone completed by TechStart</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm" className="gap-2">
            <span>AD</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
