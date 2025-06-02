import api from "./api"
import type { User } from "./userService"

const trainerService = {
  // Get all trainers
  getTrainers: async () => {
    const response = await api.get("/trainers/")
    return response.data
  },

  // Get a single trainer by ID
  getTrainer: async (id: number) => {
    const response = await api.get(`/trainers/${id}/`)
    return response.data
  },

  // Create a new trainer
  createTrainer: async (data: { full_name: string; email: string; password: string }) => {
    const response = await api.post("/trainers/create/", {
      ...data,
      role: 5  // Role ID for trainer
    })
    return response.data
  },

  // Update a trainer
  updateTrainer: async (id: number, data: Partial<User>) => {
    const response = await api.put(`/trainers/${id}/`, data)
    return response.data
  },

  // Delete a trainer
  deleteTrainer: async (id: number) => {
    return await api.delete(`/trainers/${id}/`)
  },

  // Schedule a trainer for an event or session
  scheduleTrainer: async (
    trainerId: number,
    eventData: { title: string; description: string; start_time: string; end_time: string; location: string },
  ) => {
    const data = {
      ...eventData,
      user: trainerId,
    }
    const response = await api.post("/events/", data)
    return response.data
  },
}

export default trainerService
