"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import applicationService from "@/services/applicationService"
import { startupService } from "@/services/startupService"

// Define interfaces for our data
interface Application {
  id: number
  project_id: string
  project_title: string
  team_leader_name: string
  team_leader_email: string
  created_at: string
  status: string
}


export default function ApplicationTable() {
  const router = useRouter()
  const { toast } = useToast()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch applications
        const applicationsData = await applicationService.getApplications()
        
        console.log("Applications data:", applicationsData)
        
        // Process application data
        setApplications(applicationsData)
        
        setError(null)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to fetch applications data")
        toast({
          title: "Error",
          description: "Failed to load applications data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleStatusUpdate = async (id: number, status: string) => {
  try {
    await applicationService.updateApplicationStatus(id, status)
    toast({
      title: "Status Updated",
      description: `Application ${id} has been ${status}.`,
    })

    // Optionally update the local state to reflect the change
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, status } : app
      )
    )
  } catch (err) {
    console.error(`Failed to update status for application ${id}:`, err)
    toast({
      title: "Error",
      description: "Failed to update application status",
      variant: "destructive",
    })
  }
}

const handleDeclineApplication = async (app: Application) => {
  try {
    await applicationService.updateApplicationStatus(app.id, "rejected")
    toast({
      title: "Status Updated",
      description: `Application ${app.id} has been rejected.`,
    })
    setApplications((prev) =>
      prev.map((a) => a.id === app.id ? { ...a, status: "rejected" } : a)
    )
  } catch (err) {
    console.error(err)
    toast({
      title: "Error",
      description: "Failed to reject application",
      variant: "destructive",
    })
  }
}



const handleAcceptApplication = async (app: Application) => {
  try {
    // Convert team_members string into array (split by comma or newline)
    const teamMembersArray = app.team_leader_name
      ? app.team_leader_name.split(/,|\n/).map(name => name.trim()).filter(Boolean)
      : []

    const startupPayload = {
      name: app.project_title,
      description: app.team_leader_email,
      industry: "",
      stage: "",
      teamLeaderName: app.team_leader_name,
      teamMemberNames: teamMembersArray,
    }

    // 1. Create startup
    await startupService.createStartupWithTeam(startupPayload)

    // 2. Update form status to "approved"
    await applicationService.updateApplicationStatus(app.id, "approved")

    toast({
      title: "Success",
      description: `Startup created for ${app.project_title}`,
    })

    // Optional: refresh the UI
    setApplications(prev =>
      prev.map((a) => a.id === app.id ? { ...a, status: "approved" } : a)
    )

  } catch (error) {
    console.error("Error accepting application:", error)
    toast({
      title: "Error",
      description: "Failed to accept application and create startup",
      variant: "destructive",
    })
  }
}

  // Function to handle review button click
  const handleReview = (id: number) => {
    router.push(`/admin/applications/`)
  }

  // Function to handle see details button click
  const handleSeeDetails = (app: Application) => {
    // Store the application data in localStorage to pass it to the form
    localStorage.setItem('applicationDetails', JSON.stringify(app))
    // Navigate to the form page
    router.push(`/admin/incubation-form/${app.id}`)
  }

  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
      case "pending review":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">Pending</Badge>
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">In Progress</Badge>
      case "approved":
      case "accepted":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Accepted</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (e) {
      return dateString
    }
  }

  // Function to handle CSV export
const handleExportCSV = async () => {
  try {
    toast({
      title: "Exporting...",
      description: "Preparing your CSV file for download",
    })

    // Define the headers you want in the CSV
    const headers = [
      "ID",
      "Project ID",
      "Project Title",
      "Team Leader Name",
      "Team Leader Email",
      "Created At",
      "Status"
    ]

    // Build CSV rows
    const rows = applications.map(app => [
      app.id,
      app.project_id,
      app.project_title,
      app.team_leader_name,
      app.team_leader_email,
      app.created_at,
      app.status
    ])

    // Convert to CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map(row =>
        row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")
      )
    ].join("\n")

    // Create a blob and trigger the download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `applications-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Success",
      description: "Applications exported successfully",
    })
  } catch (error) {
    console.error("Error exporting applications:", error)
    toast({
      title: "Error",
      description: "Failed to export applications",
      variant: "destructive",
    })
  }
}


  // Render loading state
  if (loading) {
    return (
      <div className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Startup</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-9 w-20" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="w-full p-8">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  // Sort applications by date
  const sortedApplications = [...applications].sort(
  (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
)


  // Render empty state
  if (sortedApplications.length === 0) {
    return (
      <div className="w-full">
        <Button
          variant="default"
          onClick={handleExportCSV}
          className="mb-4"
        >
          Export to CSV
        </Button>
        <Table>
  <TableHeader>
    <TableRow>
      <TableHead>ID</TableHead>
      <TableHead>Project ID</TableHead>
      <TableHead>Project Title</TableHead>
      <TableHead>Team Leader</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Submitted</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {sortedApplications.map((app) => (
      <TableRow key={`application-${app.id}`}>
        <TableCell>{app.id}</TableCell>
        <TableCell>{app.project_id}</TableCell>
        <TableCell>{app.project_title}</TableCell>
        <TableCell>{app.team_leader_name}</TableCell>
        <TableCell>{app.team_leader_email}</TableCell>
        <TableCell>{formatDate(app.created_at)}</TableCell>
        <TableCell>{getStatusBadge(app.status)}</TableCell>
        <TableCell>
          <Button size="sm" variant="outline" onClick={() => handleReview(app.id)}>
            Review
          </Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>

      </div>
    )
  }

  // Render data
  return (
    <div className="w-full">
      <Button
        variant="default"
        onClick={handleExportCSV}
        className="mb-4"
      >
        Export to CSV
      </Button>
      <Table>
        <TableHeader>
          <TableRow>
      <TableHead>Project Title</TableHead>
      <TableHead>Team Leader</TableHead>
      <TableHead>Submitted</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Average Score</TableHead>
      <TableHead>See Details</TableHead>
      <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedApplications.map((app) => (
            <TableRow key={`application-${app.id}`}>
              <TableCell className="font-medium">
                {app.project_title}
              </TableCell>
              <TableCell>{app.team_leader_name}</TableCell>
              <TableCell>{formatDate(app.created_at)}</TableCell>
              <TableCell>
                {getStatusBadge(app.status)}
              </TableCell>
              <TableCell>
  {
    (() => {
      if (typeof window !== "undefined") {
        try {
          const scoreData = localStorage.getItem(`form_scores_${app.id}`)
          if (scoreData) {
            const parsed = JSON.parse(scoreData)
            const total =
              (parsed.problem_understanding || 0) +
              (parsed.solution_fit || 0) +
              (parsed.technical_soundness || 0)
            return `${total}/20`
          }
        } catch (e) {
          console.error("Failed to parse score from localStorage:", e)
        }
      }
      return "0"
    })()
  }
</TableCell>

              <TableCell>
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => handleSeeDetails(app)}
                >
                  View Form
                </Button>
              </TableCell> 
              <TableCell>
  {app.status === "approved" ? (
    <span className="text-green-600 font-medium">Already accepted</span>
  ) : app.status === "rejected" ? (
    <span className="text-red-600 font-medium">Already declined</span>
  ) : (
    <div className="space-x-2">
      <Button
        size="sm"
        variant="default"
        onClick={() => handleAcceptApplication(app)}
      >
        Accept
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => handleDeclineApplication(app)}
      >
        Decline
      </Button>
    </div>
  )}
</TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}