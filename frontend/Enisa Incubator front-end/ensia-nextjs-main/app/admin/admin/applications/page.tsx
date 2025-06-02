"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle, Clock, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import applicationService from "@/services/applicationService"
import incubationFormService from "@/services/incubationFormService"

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [application, setApplication] = useState<any>(null)
  const [incubationForm, setIncubationForm] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return

      try {
        setLoading(true)
        const id = Number(params.id)

        // Fetch application data
        const appData = await applicationService.getApplication(id)
        setApplication(appData)

        // Try to fetch related incubation form if it exists
        try {
          // This is a simplified approach - in a real app, you'd have a proper relation
          // between applications and incubation forms
          const formsData = await incubationFormService.getIncubationForms()
          const relatedForm = formsData.find((form: any) =>
            form.project_title?.toLowerCase().includes(appData.startup_name?.toLowerCase() || ""),
          )

          if (relatedForm) {
            const formDetail = await incubationFormService.getIncubationForm(relatedForm.id)
            setIncubationForm(formDetail)
          }
        } catch (formError) {
          console.error("Error fetching incubation form:", formError)
          // We don't set the main error here as the application data was loaded successfully
        }

        setError(null)
      } catch (err) {
        console.error("Error fetching application:", err)
        setError("Failed to load application data")
        toast({
          title: "Error",
          description: "Failed to load application data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, toast])

  const handleStatusUpdate = async (status: string) => {
    if (!application) return

    try {
      setLoading(true)
      await applicationService.updateApplicationStatus(application.id, status)

      // Update local state
      setApplication({
        ...application,
        status,
      })

      toast({
        title: "Status updated",
        description: `Application status updated to ${status}`,
      })
    } catch (err) {
      console.error("Error updating status:", err)
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
            <Clock className="mr-1 h-3 w-3" /> Pending
          </Badge>
        )
      case "approved":
      case "accepted":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="mr-1 h-3 w-3" /> Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            <XCircle className="mr-1 h-3 w-3" /> Rejected
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (e) {
      return dateString
    }
  }

  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <div className="mb-6 flex items-center">
              <Button variant="ghost" onClick={() => router.back()} className="mr-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-3xl font-bold">
                Application Details
                {application && <span className="ml-2">{getStatusBadge(application.status)}</span>}
              </h1>
            </div>

            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-[300px] w-full" />
              </div>
            ) : error ? (
              <div className="rounded-md border p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={() => router.back()}>Go Back</Button>
              </div>
            ) : (
              <>
                <div className="mb-6 flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleStatusUpdate("approved")}
                    disabled={application?.status === "approved"}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusUpdate("rejected")}
                    disabled={application?.status === "rejected"}
                    className="text-red-500 hover:text-red-700"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>

                <Tabs defaultValue="details">
                  <TabsList className="mb-4">
                    <TabsTrigger value="details">Application Details</TabsTrigger>
                    <TabsTrigger value="incubation-form">Incubation Form</TabsTrigger>
                    <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details">
                    <Card>
                      <CardHeader>
                        <CardTitle>Application Information</CardTitle>
                        <CardDescription>Submitted on {formatDate(application?.submitted_at)}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-lg font-medium mb-2">Startup Details</h3>
                            <dl className="space-y-2">
                              <div>
                                <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                                <dd>{application?.startup_name || `Startup #${application?.startup}`}</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                                <dd>{getStatusBadge(application?.status)}</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-muted-foreground">Submission Date</dt>
                                <dd>{formatDate(application?.submitted_at)}</dd>
                              </div>
                              {application?.google_form_url && (
                                <div>
                                  <dt className="text-sm font-medium text-muted-foreground">Google Form</dt>
                                  <dd>
                                    <a
                                      href={application.google_form_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      View Form Responses
                                    </a>
                                  </dd>
                                </div>
                              )}
                            </dl>
                          </div>

                          <div>
                            <h3 className="text-lg font-medium mb-2">Notes</h3>
                            <p className="text-muted-foreground">
                              {application?.notes || "No notes available for this application."}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="incubation-form">
                    {incubationForm ? (
                      <Card>
                        <CardHeader>
                          <CardTitle>{incubationForm.project_title}</CardTitle>
                          <CardDescription>
                            Submitted by {incubationForm.team_leader_name} on {formatDate(incubationForm.created_at)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-lg font-medium mb-2">Project Information</h3>
                              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <dt className="text-sm font-medium text-muted-foreground">Project ID</dt>
                                  <dd>{incubationForm.project_id}</dd>
                                </div>
                                <div>
                                  <dt className="text-sm font-medium text-muted-foreground">Domain</dt>
                                  <dd>{incubationForm.project_domain}</dd>
                                </div>
                                <div>
                                  <dt className="text-sm font-medium text-muted-foreground">AI Project</dt>
                                  <dd>{incubationForm.is_ai_project ? "Yes" : "No"}</dd>
                                </div>
                                <div>
                                  <dt className="text-sm font-medium text-muted-foreground">Development Stage</dt>
                                  <dd>{incubationForm.dev_stage}</dd>
                                </div>
                              </dl>
                            </div>

                            <div>
                              <h3 className="text-lg font-medium mb-2">Team Information</h3>
                              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <dt className="text-sm font-medium text-muted-foreground">Team Leader</dt>
                                  <dd>{incubationForm.team_leader_name}</dd>
                                </div>
                                <div>
                                  <dt className="text-sm font-medium text-muted-foreground">Year of Study</dt>
                                  <dd>{incubationForm.team_leader_year}</dd>
                                </div>
                                <div>
                                  <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                                  <dd>{incubationForm.team_leader_email}</dd>
                                </div>
                                <div>
                                  <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                                  <dd>{incubationForm.team_leader_phone}</dd>
                                </div>
                              </dl>
                            </div>

                            <div>
                              <h3 className="text-lg font-medium mb-2">Project Summary</h3>
                              <p className="whitespace-pre-line">{incubationForm.project_summary}</p>
                            </div>

                            {incubationForm.problem_statement && (
                              <div>
                                <h3 className="text-lg font-medium mb-2">Problem Statement</h3>
                                <p className="whitespace-pre-line">{incubationForm.problem_statement}</p>
                              </div>
                            )}

                            {incubationForm.target_audience && (
                              <div>
                                <h3 className="text-lg font-medium mb-2">Target Audience</h3>
                                <p className="whitespace-pre-line">{incubationForm.target_audience}</p>
                              </div>
                            )}

                            {incubationForm.expected_impact && (
                              <div>
                                <h3 className="text-lg font-medium mb-2">Expected Impact</h3>
                                <p className="whitespace-pre-line">{incubationForm.expected_impact}</p>
                              </div>
                            )}

                            {incubationForm.demo_link && (
                              <div>
                                <h3 className="text-lg font-medium mb-2">Demo Link</h3>
                                <a
                                  href={incubationForm.demo_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {incubationForm.demo_link}
                                </a>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardHeader>
                          <CardTitle>No Incubation Form Found</CardTitle>
                          <CardDescription>
                            There is no incubation form associated with this application.
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="evaluation">
                    <Card>
                      <CardHeader>
                        <CardTitle>Application Evaluation</CardTitle>
                        <CardDescription>Review and score this application</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-center py-8 text-muted-foreground">
                          Evaluation functionality will be implemented in a future update.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
