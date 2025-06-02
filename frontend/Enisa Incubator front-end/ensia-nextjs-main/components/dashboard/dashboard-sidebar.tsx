"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Building,
  Calendar,
  LayoutDashboard,
  Settings,
  Users,
  FileText,
  GraduationCap,
  Database,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useDashboardStats } from "@/hooks/useAnalytics"
import { useEffect } from "react"

interface SidebarItem {
  title: string
  icon: React.ReactNode
  href: string
}

export default function DashboardSidebar() {
  const pathname = usePathname()
  const { stats, fetchStats } = useDashboardStats()

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const isActive = (href: string) => {
    return pathname === href
  }

  const sidebarItems: SidebarItem[] = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/admin",
    },
    {
      title: "Startups",
      icon: <Building className="h-5 w-5" />,
      href: "/admin/startups",
    },
    {
      title: "Applications",
      icon: <FileText className="h-5 w-5" />,
      href: "/admin/applications",
    },
    {
      title: "Mentors",
      icon: <Users className="h-5 w-5" />,
      href: "/admin/mentors",
    },
    {
      title: "Trainers",
      icon: <GraduationCap className="h-5 w-5" />,
      href: "/admin/trainers",
    },
    {
      title: "Resources",
      icon: <Database className="h-5 w-5" />,
      href: "/admin/resources",
    },
    {
      title: "Events",
      icon: <Calendar className="h-5 w-5" />,
      href: "/admin/events",
    },
    {
      title: "Analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/admin/analytics",
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/admin/settings",
    },
  ]

  return (
    <aside className="flex w-64 flex-col border-r bg-background">
      <div className="flex items-center gap-2 border-b p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-semibold">Incubator</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 space-y-1 px-2 py-4">
          {sidebarItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                isActive(item.href) ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
              )}
            >
              <span className="mr-3">{item.icon}</span>
              {item.title}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t p-4">
        <div className="rounded-md bg-muted p-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide">Quick Stats</h4>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Active Teams</span>
              <span className="text-sm font-medium text-primary">{stats?.active_startups || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Pending Apps</span>
              <span className="text-sm font-medium text-primary">{stats?.pending_applications || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Events This Week</span>
              <span className="text-sm font-medium text-primary">{stats?.events_this_week || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
