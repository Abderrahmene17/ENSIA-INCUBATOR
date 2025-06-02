import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  title: string
  value: string
  trend?: string
  trendLabel?: string
  icon: React.ReactNode
  color: "blue" | "green" | "amber" | "red" | "purple" | "pink"
}

export default function KpiCard({ title, value, trend, trendLabel, icon, color }: KpiCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    green: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
    red: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
    pink: "bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-400",
  }

  const trendColorClasses = {
    "+": "text-green-600 dark:text-green-400",
    "-": "text-red-600 dark:text-red-400",
  }

  const trendPrefix = trend?.startsWith("+") ? "+" : trend?.startsWith("-") ? "-" : ""
  const trendColor = trendPrefix ? trendColorClasses[trendPrefix as "+" | "-"] : ""

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">{title}</h3>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className={cn("p-2 rounded-full", colorClasses[color])}>{icon}</div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-sm">
            <span className={trendColor}>{trend}</span>
            {trendLabel && <span className="text-muted-foreground ml-1">{trendLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
