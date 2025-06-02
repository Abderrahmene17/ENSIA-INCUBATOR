import { Users, Calendar } from "lucide-react"
import { Card, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface StartupCardProps {
  name: string
  cohort: string
  founders: number
  lastActive: string
  funding: string
  status: "Active" | "On Track" | "Needs Help" | "At Risk"
}

export default function StartupCard({ name, cohort, founders, lastActive, funding, status }: StartupCardProps) {
  const getStatusBadge = () => {
    const statusConfig: Record<string, { className: string }> = {
      Active: {
        className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      },
      "On Track": {
        className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      },
      "Needs Help": {
        className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      },
      "At Risk": {
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      },
    }

    const config = statusConfig[status] || statusConfig["Active"]

    return <Badge className={config.className}>{status}</Badge>
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="mb-3 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <div className="mb-4 space-y-2 text-center">
          <h3 className="text-xl font-semibold">{name}</h3>
          <p className="text-sm text-muted-foreground">{cohort}</p>
        </div>
        <div className="flex items-center justify-center mb-4">{getStatusBadge()}</div>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{founders} founders</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Last active: {lastActive}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Funding:</span>
            <span className="font-medium">{funding}</span>
          </div>
        </div>
      </div>
      <CardFooter className="flex flex-col gap-2 p-3 pt-0">
        <Button variant="secondary" className="w-full">
          View Details
        </Button>
        <Button variant="outline" className="w-full">
          Schedule Meeting
        </Button>
      </CardFooter>
    </Card>
  )
}
