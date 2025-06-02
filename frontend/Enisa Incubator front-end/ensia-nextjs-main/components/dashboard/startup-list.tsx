"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { startupService } from "@/services/startupService"
import type { TeamMember } from "@/services/startupService"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Eye, Plus, Trash2, Users, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Startup, User, CreateStartupWithTeam } from "@/services/startupService"
import { useStartups } from "@/hooks/useStartups"
import { useUsers } from "@/hooks/useUsers"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { debounce } from "@/utils/debounce"

interface TeamMemberForm {
  name: string
  role_in_team: string
}

interface StartupForm {
  name: string
  description: string
  industry: string
  stage: string
  status: "pending" | "approved" | "rejected"
}

interface StartupListProps {
  searchQuery?: string
  statusFilter?: string
}

export default function StartupList({ searchQuery, statusFilter }: StartupListProps) {
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [formData, setFormData] = useState<StartupForm>({
    name: '',
    description: '',
    industry: '',
    stage: '',
    status: 'pending'
  })
  const [teamMembers, setTeamMembers] = useState<TeamMemberForm[]>([])
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('')
  const [teamLeaderName, setTeamLeaderName] = useState('')
  const [teamMemberNames, setTeamMemberNames] = useState<string[]>([])

  const { startups, loading, error, createStartup, updateStartup, deleteStartup, addTeamMember, removeTeamMember, fetchStartups } = useStartups()
  const { users, fetchUsers } = useUsers()

  // Debounce the fetch function to prevent excessive API calls
  const debouncedFetch = debounce(fetchStartups, 500)

  useEffect(() => {
    fetchStartups()
  }, [])

  const filteredStartups = startups.filter(startup => {
    const matchesSearch = !searchQuery || 
      startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (startup.description && startup.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = !statusFilter || statusFilter === 'all' || startup.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: {
        label: "Pending",
        className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      },
      approved: {
        label: "Approved",
        className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      },
      rejected: {
        label: "Rejected",
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      },
    }

    const config = statusConfig[status] || statusConfig.pending

    return <Badge className={config.className}>{config.label}</Badge>
  }

  const handleView = (startup: Startup) => {
    setSelectedStartup(startup)
    setIsViewOpen(true)
  }

  const handleEdit = (startup: Startup) => {
    setSelectedStartup(startup)
    setFormData({
      name: startup.name,
      description: startup.description,
      industry: startup.industry || '',
      stage: startup.stage || '',
      status: startup.status as "pending" | "approved" | "rejected",
    })

    if (startup.team_leader) {
      setTeamLeaderName(startup.team_leader.full_name)
    } else {
      setTeamLeaderName("")
    }

    if (startup.team_members) {
      const members = startup.team_members
        .filter((member) => member.role_in_team !== "Team Leader")
        .map((member) => ({
          name: member.user_details?.full_name || "Unknown",
          role_in_team: member.role_in_team,
        }))
      setTeamMemberNames(members.map(member => member.name))
    } else {
      setTeamMemberNames([])
    }

    setIsEditOpen(true)
  }

  const handleDelete = (startup: Startup) => {
    setSelectedStartup(startup)
    setIsDeleteOpen(true)
  }

  const handleCreate = () => {
    setFormData({
      name: "",
      description: "",
      industry: "",
      stage: "",
      status: "pending",
    })
    setTeamLeaderName("")
    setTeamMemberNames([])
    setIsCreateOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedStartup) return

    try {
      await startupService.updateStartupWithTeam(selectedStartup.id, {
        startup: formData,
        teamLeaderName: teamLeaderName,
        teamMembers: teamMembers.map(member => ({
          name: member.name,
          role_in_team: member.role_in_team
        })),
      })
      setIsEditOpen(false)
      setFormData({
        name: '',
        description: '',
        industry: '',
        stage: '',
        status: 'pending'
      })
      setTeamLeaderName('')
      setTeamMemberNames([])
      debouncedFetch()
    } catch (err) {
      console.error("Failed to update startup:", err)
      alert("Failed to update startup. Please try again.")
    }
  }

  const handleSaveCreate = async () => {
    try {
      // Check if users are loaded
      if (loading) {
        alert("Please wait while users are loading...")
        return
      }

      if (!formData.name.trim()) {
        alert("Please enter a startup name")
        return
      }

      if (!teamLeaderName.trim()) {
        alert("Please select a team leader")
        return
      }

      // Create startup with team members
      await createStartup({
        name: formData.name,
        description: formData.description,
        industry: formData.industry,
        stage: formData.stage,
        teamLeaderName: teamLeaderName,
        teamMemberNames: teamMemberNames
      })

      setIsCreateOpen(false)
      setFormData({
        name: '',
        description: '',
        industry: '',
        stage: '',
        status: 'pending'
      })
      setTeamLeaderName('')
      setTeamMemberNames([])
      debouncedFetch()
    } catch (err) {
      console.error("Failed to create startup:", err)
      alert("Failed to create startup. Please try again.")
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedStartup) return

    try {
      await deleteStartup(selectedStartup.id)
      setIsDeleteOpen(false)
      debouncedFetch()
    } catch (err) {
      console.error("Failed to delete startup:", err)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData({
      ...formData,
      [id]: value,
    })
  }

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      status: value as "pending" | "approved" | "rejected",
    })
  }

  const handleAddTeamMember = () => {
    if (!newMemberName || !newMemberRole) return

    // Check if member name is already in team
    if (teamMembers.some((member) => member.name === newMemberName)) {
      alert("This team member is already added")
      return
    }

    setTeamMembers([...teamMembers, { name: newMemberName, role_in_team: newMemberRole }])
    setNewMemberName("")
    setNewMemberRole("")
  }

  const handleRemoveTeamMember = (index: number) => {
    const newMembers = [...teamMembers]
    newMembers.splice(index, 1)
    setTeamMembers(newMembers)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end mb-4">
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="border rounded-md">
          <div className="h-12 border-b px-4 py-3 flex items-center">
            <Skeleton className="h-4 w-full" />
          </div>
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="px-4 py-4 border-b last:border-0">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">Failed to load startups</div>
  }

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Startup
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Startup</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStartups.length > 0 ? (
            filteredStartups.map((startup) => (
              <TableRow key={startup.id}>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-medium">{startup.name}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-md">{startup.description}</div>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(startup.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {startup.team_leader ? startup.team_leader.full_name : "No leader"}
                      {startup.team_members &&
                        startup.team_members.length > 0 &&
                        ` + ${startup.team_members.length - 1} members`}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{new Date(startup.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleView(startup)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(startup)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(startup)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                No startups found matching your filters
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* View Startup Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{selectedStartup?.name}</DialogTitle>
            <DialogDescription>Startup details</DialogDescription>
          </DialogHeader>
          {selectedStartup && (
            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
              </TabsList>
              <TabsContent value="details">
                <div className="space-y-4 py-4">
                  <div className="flex items-center">
                    <Badge className="mr-2">{selectedStartup.status}</Badge>
                  </div>
                  <div className="space-y-1">
                    <Label>Description</Label>
                    <p className="text-sm text-muted-foreground">{selectedStartup.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Created</Label>
                      <p className="text-sm">{new Date(selectedStartup.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1">
                      <Label>Last Updated</Label>
                      <p className="text-sm">{new Date(selectedStartup.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="team">
                <div className="space-y-4 py-4">
                  {selectedStartup.team_leader && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Team Leader</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>{selectedStartup.team_leader.full_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{selectedStartup.team_leader.full_name}</p>
                            <p className="text-sm text-muted-foreground">{selectedStartup.team_leader.email}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle>Team Members</CardTitle>
                      <CardDescription>
                        {selectedStartup.team_members && selectedStartup.team_members.length > 0
                          ? `${selectedStartup.team_members.length} members in this team`
                          : "No team members"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedStartup.team_members && selectedStartup.team_members.length > 0 ? (
                        <div className="space-y-4">
                          {selectedStartup.team_members
                            .filter((member: TeamMember) => member.role_in_team !== "Team Leader")
                            .map((member) => (
                              <div key={member.id} className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <Avatar>
                                    <AvatarFallback>{member.user_details?.full_name.charAt(0) || "U"}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">{member.user_details?.full_name}</p>
                                    <p className="text-xs text-muted-foreground">{member.role_in_team}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No team members have been added yet.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Startup Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Edit Startup</DialogTitle>
            <DialogDescription>Make changes to the startup details and team.</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={formData.name} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={handleSelectChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={formData.description} onChange={handleInputChange} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="team">
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="teamLeader">Team Leader</Label>
                  <Input
                    id="teamLeader"
                    placeholder="Enter team leader name"
                    value={teamLeaderName}
                    onChange={(e) => setTeamLeaderName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Team Members</Label>
                  <div className="border rounded-md p-4">
                    <div className="space-y-4">
                      {teamMembers.length > 0 ? (
                        <div className="space-y-2">
                          {teamMembers.map((member, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback>{member.name.charAt(0) || "U"}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{member.name}</p>
                                  <p className="text-xs text-muted-foreground">{member.role_in_team}</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => handleRemoveTeamMember(index)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-2">No team members added yet</p>
                      )}

                      <div className="space-y-2 pt-4 border-t">
                        <Label>Add Team Member</Label>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Member name"
                            value={newMemberName}
                            onChange={(e) => setNewMemberName(e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            placeholder="Role in team"
                            value={newMemberRole}
                            onChange={(e) => setNewMemberRole(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            onClick={handleAddTeamMember}
                            disabled={!newMemberName || !newMemberRole}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Startup Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Create New Startup</DialogTitle>
            <DialogDescription>Add details for the new startup and team.</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Startup name" value={formData.name} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Startup description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="team">
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="teamLeader">Team Leader</Label>
                  <Input
                    id="teamLeader"
                    placeholder="Enter team leader name"
                    value={teamLeaderName}
                    onChange={(e) => setTeamLeaderName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Team Members</Label>
                  <div className="border rounded-md p-4">
                    <div className="space-y-4">
                      {teamMembers.length > 0 ? (
                        <div className="space-y-2">
                          {teamMembers.map((member, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback>{member.name.charAt(0) || "U"}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{member.name}</p>
                                  <p className="text-xs text-muted-foreground">{member.role_in_team}</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => handleRemoveTeamMember(index)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-2">No team members added yet</p>
                      )}

                      <div className="space-y-2 pt-4 border-t">
                        <Label>Add Team Member</Label>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Member name"
                            value={newMemberName}
                            onChange={(e) => setNewMemberName(e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            placeholder="Role in team"
                            value={newMemberRole}
                            onChange={(e) => setNewMemberRole(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            onClick={handleAddTeamMember}
                            disabled={!newMemberName || !newMemberRole}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCreate}>Create Startup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the startup "{selectedStartup?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
