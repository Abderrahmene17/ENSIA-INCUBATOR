"use client"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useResourceRequests } from "@/hooks/useResources"
import { Loader2, Check, X } from 'lucide-react'

export function ResourceRequestList() {
  const { requests, loading, error, fetchRequests, createRequest, updateRequest, deleteRequest } = useResourceRequests()

  const handleApprove = async (id: number) => {
    if (confirm("Are you sure you want to approve this request?")) {
      try {
        await updateRequest(id, { status: "approved" })
        await fetchRequests()
      } catch (error) {
        console.error("Failed to approve request:", error)
      }
    }
  }

  const handleReject = async (id: number) => {
    if (confirm("Are you sure you want to reject this request?")) {
      try {
        await updateRequest(id, { status: "rejected" })
        await fetchRequests()
      } catch (error) {
        console.error("Failed to reject request:", error)
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Requests</CardTitle>
        <CardDescription>Manage resource requests from startups</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-destructive">Error loading resource requests. Please try again later.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead>Startup</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No resource requests found
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.resource?.name || "Unknown"}</TableCell>
                    <TableCell>{request.startup?.name || "Unknown"}</TableCell>
                    <TableCell>{request.quantity_requested}</TableCell>
                    <TableCell>{request.user?.full_name || "Unknown"}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>{new Date(request.requested_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      {request.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleApprove(request.id)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleReject(request.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}