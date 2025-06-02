"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, type TooltipProps } from "recharts"
import { useApplicationStatusAnalytics, useStartupStatusAnalytics } from "@/hooks/useAnalytics"
import { Skeleton } from "@/components/ui/skeleton"

// Colors for pie chart
const COLORS = ["#ffa726", "#66bb6a", "#ef5350"]

// Custom tooltip for startups chart
const StartupsTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-4 shadow-sm">
        <p className="font-medium">{label}</p>
        <p className="text-[#228be6]">Active : {payload[0].value}</p>
        <p className="text-[#fcc419]">Graduated : {payload[1].value}</p>
      </div>
    )
  }
  return null
}

export default function AnalyticsOverview() {
  const [activeTab, setActiveTab] = useState("applications")
  const { data: applicationData, loading: appLoading, error: appError } = useApplicationStatusAnalytics()
  const { data: startupData, loading: startupLoading, error: startupError } = useStartupStatusAnalytics()

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Analytics Overview</h2>
          <p className="text-muted-foreground">Track key metrics and performance indicators over time</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="startups">Startups</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="h-[300px]">
            {appLoading ? (
              <div className="flex items-center justify-center h-full">
                <Skeleton className="w-full h-full" />
              </div>
            ) : appError ? (
              <div className="flex items-center justify-center h-full text-red-500">
                Failed to load application analytics
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={applicationData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {applicationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </TabsContent>

          <TabsContent value="startups" className="h-[300px]">
            {startupLoading ? (
              <div className="flex items-center justify-center h-full">
                <Skeleton className="w-full h-full" />
              </div>
            ) : startupError ? (
              <div className="flex items-center justify-center h-full text-red-500">
                Failed to load startup analytics
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={startupData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {startupData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
