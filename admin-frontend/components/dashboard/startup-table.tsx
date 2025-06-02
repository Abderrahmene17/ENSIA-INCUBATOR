import { CheckCircle, HelpCircle, MoreHorizontal } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"

// Mock data - in a real app, this would come from your API
const startups = [
  {
    id: 1,
    name: "TechStart",
    cohort: "Spring 2023",
    status: "on-track",
    members: 4,
    lead: "Amina B.",
    progress: 80,
    lastActivity: "2023-08-15",
  },
  {
    id: 2,
    name: "EcoSolutions",
    cohort: "Spring 2023",
    status: "needs-attention",
    members: 3,
    lead: "Carlos M.",
    progress: 45,
    lastActivity: "2023-08-12",
  },
  {
    id: 3,
    name: "HealthAI",
    cohort: "Fall 2022",
    status: "on-track",
    members: 5,
    lead: "Sarah J.",
    progress: 90,
    lastActivity: "2023-08-14",
  },
  {
    id: 4,
    name: "FinTech Pro",
    cohort: "Spring 2023",
    status: "at-risk",
    members: 2,
    lead: "David L.",
    progress: 30,
    lastActivity: "2023-08-01",
  },
  {
    id: 5,
    name: "EdTech Innovators",
    cohort: "Fall 2022",
    status: "on-track",
    members: 4,
    lead: "Michelle K.",
    progress: 75,
    lastActivity: "2023-08-10",
  },
  {
    id: 6,
    name: "Smart Retail",
    cohort: "Spring 2023",
    status: "needs-attention",
    members: 3,
    lead: "Robert T.",
    progress: 60,
    lastActivity: "2023-08-08",
  },
]

export default function StartupTable() {
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Startup</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Cohort</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {startups.map((startup) => {
            const status = statusConfig[startup.status as keyof typeof statusConfig]

            return (
              <TableRow key={startup.id}>
                <TableCell className="font-medium">{startup.name}</TableCell>
                <TableCell>
                  <Badge className={status.color}>
                    <div className="flex items-center gap-1">
                      {status.icon}
                      {status.label}
                    </div>
                  </Badge>
                </TableCell>
                <TableCell>{startup.cohort}</TableCell>
                <TableCell>
                  {startup.members} members • {startup.lead}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={startup.progress} className="h-2 w-[60px]" />
                    <span className="text-xs">{startup.progress}%</span>
                  </div>
                </TableCell>
                <TableCell>{new Date(startup.lastActivity).toLocaleDateString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Schedule Meeting</DropdownMenuItem>
                      <DropdownMenuItem>Edit Startup</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">Delete Startup</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
