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
import { useTrainers } from "@/hooks/useTrainers"
import { Loader2, Plus, Pencil, Trash, Eye, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function TrainerTable() {
  const { trainers, loading, error, createTrainer, updateTrainer, deleteTrainer, scheduleTrainer } = useTrainers()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  })
  const [scheduleData, setScheduleData] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    location: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleScheduleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setScheduleData({
      ...scheduleData,
      [name]: value,
    })
  }

  const handleAddTrainer = async () => {
    try {
      await createTrainer(formData)
      setFormData({ full_name: "", email: "", password: "" })
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Failed to add trainer:", error)
    }
  }

  const handleEditClick = (trainer: any) => {
    setSelectedTrainer(trainer)
    setFormData({
      full_name: trainer.full_name,
      email: trainer.email,
      password: "", // Don't set password for edit
    })
    setIsEditDialogOpen(true)
  }

  const handleScheduleClick = (trainer: any) => {
    setSelectedTrainer(trainer)
    // Initialize with current date/time
    const now = new Date()
    const later = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours later

    setScheduleData({
      title: `Training Session with ${trainer.full_name}`,
      description: "",
      start_time: now.toISOString().slice(0, 16),
      end_time: later.toISOString().slice(0, 16),
      location: "Online",
    })

    setIsScheduleDialogOpen(true)
  }

  const handleUpdateTrainer = async () => {
    if (!selectedTrainer) return

    try {
      // Only update fields that are provided
      const updateData: any = {}
      if (formData.full_name) updateData.full_name = formData.full_name
      if (formData.email) updateData.email = formData.email
      if (formData.password) updateData.password = formData.password

      await updateTrainer(selectedTrainer.id, updateData)
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Failed to update trainer:", error)
    }
  }

  const handleScheduleTrainer = async () => {
    if (!selectedTrainer) return

    try {
      await scheduleTrainer(selectedTrainer.id, scheduleData)
      setIsScheduleDialogOpen(false)
    } catch (error) {
      console.error("Failed to schedule trainer:", error)
    }
  }

  const handleDeleteTrainer = async (id: number) => {
    if (confirm("Are you sure you want to delete this trainer?")) {
      try {
        await deleteTrainer(id)
      } catch (error) {
        console.error("Failed to delete trainer:", error)
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
          <CardTitle>Trainers</CardTitle>
          <CardDescription>Manage trainers and their schedules</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Trainer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Trainer</DialogTitle>
              <DialogDescription>Create a new trainer account.</DialogDescription>
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
              <Button onClick={handleAddTrainer}>Add Trainer</Button>
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
            {trainers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No trainers found
                </TableCell>
              </TableRow>
            ) : (
              trainers.map((trainer) => (
                <TableRow key={trainer.id}>
                  <TableCell>{trainer.full_name}</TableCell>
                  <TableCell>{trainer.email}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        /* View trainer details */
                      }}
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleScheduleClick(trainer)} title="Schedule">
                      <Calendar className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(trainer)} title="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteTrainer(trainer.id)} title="Delete">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Edit Trainer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Trainer</DialogTitle>
            <DialogDescription>Update trainer information.</DialogDescription>
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
            <Button onClick={handleUpdateTrainer}>Update Trainer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Trainer Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Training Session</DialogTitle>
            <DialogDescription>Schedule a training session with {selectedTrainer?.full_name}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                value={scheduleData.title}
                onChange={handleScheduleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                name="description"
                value={scheduleData.description}
                onChange={handleScheduleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start_time" className="text-right">
                Start Time
              </Label>
              <Input
                id="start_time"
                name="start_time"
                type="datetime-local"
                value={scheduleData.start_time}
                onChange={handleScheduleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end_time" className="text-right">
                End Time
              </Label>
              <Input
                id="end_time"
                name="end_time"
                type="datetime-local"
                value={scheduleData.end_time}
                onChange={handleScheduleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                name="location"
                value={scheduleData.location}
                onChange={handleScheduleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleTrainer}>Schedule Session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
