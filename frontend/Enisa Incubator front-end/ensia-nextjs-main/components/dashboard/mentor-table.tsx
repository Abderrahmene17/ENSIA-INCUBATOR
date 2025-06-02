"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useMentors } from "@/hooks/useMentors"
import { Loader2, Plus, Pencil, Trash, Eye, UserPlus } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

interface MentorTableProps {
  searchQuery: string;
  availabilityFilter: string;
}

export function MentorTable({ searchQuery, availabilityFilter }: MentorTableProps) {
  const { mentors, loading, error, createMentor, updateMentor, deleteMentor, assignMentorToStartup } = useMentors()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedMentor, setSelectedMentor] = useState<any>(null)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  })
  const [assignData, setAssignData] = useState({
    startupId: 0,
    role: "Mentor",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleAssignInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAssignData({
      ...assignData,
      [name]: name === "startupId" ? Number.parseInt(value) || 0 : value,
    })
  }

  const handleAddMentor = async () => {
    try {
      await createMentor(formData)
      setFormData({ full_name: "", email: "", password: "" })
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Failed to add mentor:", error)
    }
  }

  const handleEditClick = (mentor: any) => {
    setSelectedMentor(mentor)
    setFormData({
      full_name: mentor.full_name,
      email: mentor.email,
      password: "", // Don't set password for edit
    })
    setIsEditDialogOpen(true)
  }

  const handleAssignClick = (mentor: any) => {
    setSelectedMentor(mentor)
    setIsAssignDialogOpen(true)
  }

  const handleUpdateMentor = async () => {
    if (!selectedMentor) return

    try {
      // Only update fields that are provided
      const updateData: any = {}
      if (formData.full_name) updateData.full_name = formData.full_name
      if (formData.email) updateData.email = formData.email
      if (formData.password) updateData.password = formData.password

      await updateMentor(selectedMentor.id, updateData)
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Failed to update mentor:", error)
    }
  }

  const handleAssignMentor = async () => {
    if (!selectedMentor) return

    try {
      await assignMentorToStartup(selectedMentor.id, assignData.startupId, assignData.role)
      setIsAssignDialogOpen(false)
    } catch (error) {
      console.error("Failed to assign mentor:", error)
    }
  }

  const handleDeleteMentor = async (id: number) => {
    if (confirm("Are you sure you want to delete this mentor?")) {
      try {
        await deleteMentor(id)
      } catch (error) {
        console.error("Failed to delete mentor:", error)
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800">Available</Badge>
      case "unavailable":
        return <Badge className="bg-red-100 text-red-800">Unavailable</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-destructive">Error: {error}</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Mentors</CardTitle>
          <CardDescription>Manage mentors and their assignments</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Mentor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Mentor</DialogTitle>
              <DialogDescription>Create a new mentor account.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="full_name" className="text-right">
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMentor}>Add Mentor</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mentors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No mentors found
                </TableCell>
              </TableRow>
            ) : (
              mentors.map((mentor) => (
                <TableRow key={mentor.id}>
                  <TableCell>{mentor.full_name}</TableCell>
                  <TableCell>{mentor.email}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        /* View mentor details */
                      }}
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleAssignClick(mentor)} title="Assign">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(mentor)} title="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteMentor(mentor.id)} title="Delete">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Edit Mentor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Mentor</DialogTitle>
            <DialogDescription>Update mentor information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-full_name" className="text-right">
                Full Name
              </Label>
              <Input
                id="edit-full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-password" className="text-right">
                New Password
              </Label>
              <Input
                id="edit-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Leave blank to keep current password"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateMentor}>Update Mentor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Mentor Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Mentor</DialogTitle>
            <DialogDescription>Assign {selectedMentor?.full_name} to a startup.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startupId" className="text-right">
                Startup ID
              </Label>
              <Input
                id="startupId"
                name="startupId"
                type="number"
                value={assignData.startupId}
                onChange={handleAssignInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Input
                id="role"
                name="role"
                value={assignData.role}
                onChange={handleAssignInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignMentor}>Assign Mentor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}