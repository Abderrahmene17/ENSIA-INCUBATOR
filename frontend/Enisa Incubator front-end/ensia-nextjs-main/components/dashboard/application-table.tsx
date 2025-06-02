"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import applicationService from "@/services/applicationService"
import incubationFormService from "@/services/incubationFormService"

// Define interfaces for our data
interface Application {
  id: number
  status: string
  submitted_at: string
  startup: number
  startup_name?: string
  notes?: string
}

interface IncubationForm {
  id: number
  project_title: string
  team_leader_name: string
  created_at: string
  status: string
}

export default function ApplicationTable() {
  const router = useRouter()
  const { toast } = useToast()
  const [applications, setApplications] = useState<Application[]>([])
  const [incubationForms, setIncubationForms] = useState<IncubationForm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch both applications and incubation forms
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch applications and incubation forms in parallel
        const [applicationsData, incubationFormsData] = await Promise.all([
          applicationService.getApplications(),
          incubationFormService.getIncubationForms(),
        ])

        console.log("Applications data:", applicationsData)
        console.log("Incubation forms data:", incubationFormsData)

        // Process applications data
        setApplications(applicationsData)

        // Process incubation forms data
        setIncubationForms(incubationFormsData)

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

  // Function to handle review button click
  const handleReview = (id: number, type: "application" | "incubation") => {
    if (type === "application") {
      router.push(`/admin/applications/${id}`)
    } else {
      router.push(`/admin/incubation-forms/${id}`)
    }
  }

  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">Pending</Badge>
      case "interview":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Interview</Badge>
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
      await applicationService.exportApplicationsCSV()
    } catch (error) {
      console.error("Error exporting applications:", error)
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
              <TableHead className="w-[40%]">Notes</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-[120px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-[80px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-[100px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-9 w-[80px]" />
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
      <div className="w-full p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  // Combine and sort applications and incubation forms by date
  const combinedItems = [
    ...applications.map((app) => ({
      id: app.id,
      name: app.startup_name || `Startup #${app.startup}`,
      status: app.status,
      submitted: app.submitted_at,
      notes: app.notes || "No notes yet",
      type: "application" as const,
    })),
    ...incubationForms.map((form) => ({
      id: form.id,
      name: form.project_title,
      status: form.status,
      submitted: form.created_at,
      notes: `Team Leader: ${form.team_leader_name}`,
      type: "incubation" as const,
    })),
  ].sort((a, b) => new Date(b.submitted).getTime() - new Date(a.submitted).getTime())

  // Render empty state
  if (combinedItems.length === 0) {
    return (
      <div className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Startup</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="w-[40%]">Notes</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                No applications found
              </TableCell>
            </TableRow>
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
        color="primary"
        onClick={handleExportCSV}
        style={{ marginBottom: '1rem' }}
      >
        Export to CSV
      </Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Startup</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="w-[40%]">Notes</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {combinedItems.map((item) => (
            <TableRow key={`${item.type}-${item.id}`}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{getStatusBadge(item.status)}</TableCell>
              <TableCell>{formatDate(item.submitted)}</TableCell>
              <TableCell className="text-muted-foreground">{item.notes}</TableCell>
              <TableCell>
                <Button size="sm" variant="outline" onClick={() => handleReview(item.id, item.type)}>
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
