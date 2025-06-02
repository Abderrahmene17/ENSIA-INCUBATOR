"use client"

import { useEffect, useState } from "react"
import { Search } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import AnalyticsOverview from "@/components/dashboard/analytics-overview"
import SurvivalRateCard from "@/components/dashboard/survival-rate-card"
import AcceptanceRateCard from "@/components/dashboard/acceptance-rate-card"
import ResourceUtilization from "@/components/dashboard/resource-utilization"
import { useDashboardStats } from "@/hooks/useAnalytics"

export default function AnalyticsPage() {
  const { stats, loading, error, fetchStats } = useDashboardStats()
  const [timePeriod, setTimePeriod] = useState("last30")

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-6">Analytics</h1>

              <div className="flex items-center justify-between mb-6">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search analytics..." className="pl-9" />
                </div>
                <div className="flex items-center gap-2">
                  <Select 
                    defaultValue="last30"
                    onValueChange={(value) => setTimePeriod(value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Time Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last30">Last 30 Days</SelectItem>
                      <SelectItem value="last90">Last 90 Days</SelectItem>
                      <SelectItem value="last6months">Last 6 Months</SelectItem>
                      <SelectItem value="lastyear">Last Year</SelectItem>
                      <SelectItem value="alltime">All Time</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline">Export Report</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <SurvivalRateCard />
                <AcceptanceRateCard />
              </div>

              <div className="mb-8">
                <AnalyticsOverview />
              </div>

              <div className="mb-8">
                <ResourceUtilization />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}