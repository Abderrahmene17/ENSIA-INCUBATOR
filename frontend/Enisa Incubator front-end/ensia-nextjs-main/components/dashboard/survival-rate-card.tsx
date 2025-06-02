"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useSurvivalRateAnalytics } from "@/hooks/useAnalytics"
import { Skeleton } from "@/components/ui/skeleton"

export default function SurvivalRateCard() {
  const { data, loading, error } = useSurvivalRateAnalytics()

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-2">
          <h3 className="text-lg font-medium text-muted-foreground">Survival Rate</h3>
        </div>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-2 w-full" />
          </div>
        ) : error ? (
          <div className="text-sm text-red-500">Failed to load survival rate data</div>
        ) : (
          <>
            <div className="mb-2">
              <span className="text-4xl font-bold">{data?.rate || 0}%</span>
            </div>

            <p className="text-sm text-muted-foreground mb-4">Startups active after {data?.period || "6 months"}</p>

            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: `${data?.rate || 0}%` }} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
