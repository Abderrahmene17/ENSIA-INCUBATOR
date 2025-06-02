"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useResourceUtilizationAnalytics } from "@/hooks/useAnalytics"
import { Skeleton } from "@/components/ui/skeleton"

export default function ResourceUtilization() {
  const { data: resources, loading, error } = useResourceUtilizationAnalytics()

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-4">Resource Utilization</h3>

        {loading ? (
          <div className="space-y-6">
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              ))}
          </div>
        ) : error ? (
          <div className="text-red-500">Failed to load resource utilization data</div>
        ) : resources.length === 0 ? (
          <div className="text-muted-foreground">No resources available</div>
        ) : (
          <div className="space-y-6">
            {resources.map((resource) => {
              const usagePercentage = (resource.used / resource.total) * 100

              return (
                <div key={resource.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{resource.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {resource.used} / {resource.total} used
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={usagePercentage} className="h-2 flex-1" />
                    <span className="text-xs w-12 text-right">{Math.round(usagePercentage)}%</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{resource.available} available</div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
