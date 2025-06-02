"use client"

import { Calendar, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import EventTable from "@/components/dashboard/event-table"
import { useState } from "react"

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-6">Events</h1>

              <div className="flex items-center justify-between mb-6">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Event Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="pitch">Pitch Events</SelectItem>
                      <SelectItem value="networking">Networking</SelectItem>
                      <SelectItem value="workshop">Workshops</SelectItem>
                      <SelectItem value="demo">Demo Days</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button>
                    <Calendar className="mr-2 h-4 w-4" />
                    View Calendar
                  </Button>
                </div>
              </div>

              <EventTable searchQuery={searchQuery} typeFilter={typeFilter} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
