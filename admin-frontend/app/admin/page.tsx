"use client"

import { useEffect } from "react"
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Building, Calendar, FileText, Users } from "lucide-react"
import AnalyticsOverview from "@/components/dashboard/analytics-overview"
import SurvivalRateCard from "@/components/dashboard/survival-rate-card"
import AcceptanceRateCard from "@/components/dashboard/acceptance-rate-card"
import { useDashboardStats } from "@/hooks/useAnalytics"
import { Skeleton } from "@/components/ui/skeleton"

export default function Dashboard() {
  const { stats, loading, error, fetchStats } = useDashboardStats()

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Welcome to the University Incubator Dashboard</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {loading ? (
                Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))
              ) : error ? (
                <div className="col-span-4 text-center text-red-500">Failed to load dashboard statistics</div>
              ) : (
                <>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Active Teams</p>
                          <h3 className="text-3xl font-bold mt-2">{stats?.active_startups || 0}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-full dark:bg-blue-900 dark:text-blue-400">
                          <Building className="h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Pending Apps</p>
                          <h3 className="text-3xl font-bold mt-2">{stats?.pending_applications || 0}</h3>
                        </div>
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-full dark:bg-amber-900 dark:text-amber-400">
                          <FileText className="h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Mentors</p>
                          <h3 className="text-3xl font-bold mt-2">{stats?.mentors_count || 0}</h3>
                        </div>
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-full dark:bg-purple-900 dark:text-purple-400">
                          <Users className="h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Upcoming Events</p>
                          <h3 className="text-3xl font-bold mt-2">{stats?.upcoming_events || 0}</h3>
                        </div>
                        <div className="p-2 bg-pink-50 text-pink-600 rounded-full dark:bg-pink-900 dark:text-pink-400">
                          <Calendar className="h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            <div className="mb-8">
              <AnalyticsOverview />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <SurvivalRateCard rate={85} period="6 months" />
              <AcceptanceRateCard rate={42} period="Q4 2023" />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
