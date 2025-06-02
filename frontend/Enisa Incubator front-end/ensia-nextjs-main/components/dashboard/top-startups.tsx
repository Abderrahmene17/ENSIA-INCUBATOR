import { CheckCircle, HelpCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Mock data - in a real app, this would come from your API
const topStartups = [
  {
    id: 1,
    name: "TechStart",
    status: "on-track",
    progress: 80,
    lastUpdate: "2 days ago",
  },
  {
    id: 3,
    name: "HealthAI",
    status: "on-track",
    progress: 90,
    lastUpdate: "1 day ago",
  },
  {
    id: 5,
    name: "EdTech Innovators",
    status: "on-track",
    progress: 75,
    lastUpdate: "5 days ago",
  },
  {
    id: 6,
    name: "Smart Retail",
    status: "needs-attention",
    progress: 60,
    lastUpdate: "7 days ago",
  },
  {
    id: 2,
    name: "EcoSolutions",
    status: "needs-attention",
    progress: 45,
    lastUpdate: "3 days ago",
  },
]

export default function TopStartups() {
  const statusConfig = {
    "on-track": {
      label: "On Track",
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    "needs-attention": {
      label: "Needs Attention",
      color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      icon: <HelpCircle className="h-4 w-4" />,
    },
    "at-risk": {
      label: "At Risk",
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      icon: <HelpCircle className="h-4 w-4" />,
    },
  }

  return (
    <div className="space-y-4">
      {topStartups.map((startup) => {
        const status = statusConfig[startup.status as keyof typeof statusConfig]

        return (
          <div key={startup.id} className="flex items-center justify-between pb-4 border-b last:border-0">
            <div className="space-y-1">
              <div className="font-medium">{startup.name}</div>
              <Badge className={status.color}>
                <div className="flex items-center gap-1">
                  {status.icon}
                  {status.label}
                </div>
              </Badge>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <Progress value={startup.progress} className="h-2 w-[60px]" />
                <span className="text-xs">{startup.progress}%</span>
              </div>
              <div className="text-xs text-muted-foreground">Updated {startup.lastUpdate}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
