"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card } from "@/components/ui/card"

// Mock data - in a real app, this would come from your API
const data = [
  { month: "Jan", applications: 12, acceptances: 5 },
  { month: "Feb", applications: 19, acceptances: 7 },
  { month: "Mar", applications: 25, acceptances: 9 },
  { month: "Apr", applications: 32, acceptances: 11 },
  { month: "May", applications: 28, acceptances: 10 },
  { month: "Jun", applications: 35, acceptances: 12 },
  { month: "Jul", applications: 42, acceptances: 14 },
  { month: "Aug", applications: 38, acceptances: 13 },
]

export default function TrendChart() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Card className="w-full h-full bg-muted/20 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              borderColor: "#e5e7eb",
              borderRadius: "0.375rem",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="applications"
            stroke="#3b82f6"
            strokeWidth={2}
            activeDot={{ r: 8 }}
            name="Applications"
          />
          <Line type="monotone" dataKey="acceptances" stroke="#10b981" strokeWidth={2} name="Acceptances" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
