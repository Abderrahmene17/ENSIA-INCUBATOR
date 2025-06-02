import api from "./api"
import type { User } from "./userService"

const mentorService = {
  // Get all mentors
  getMentors: async () => {
    const response = await api.get("/mentors/")
    return response.data
  },

  // Get a single mentor by ID
  getMentor: async (id: number) => {
    const response = await api.get(`/mentors/${id}/`)
    return response.data
  },

  // Create a new mentor
  createMentor: async (data: { full_name: string; email: string; password: string }) => {
    const requestData = {
      ...data,
      role: 4  // Role ID for mentor
    }
    console.log('Creating mentor with data:', requestData)
    const response = await api.post("/mentors/create/", requestData)
    return response.data
  },

  // Update a mentor
  updateMentor: async (id: number, data: Partial<User>) => {
    const response = await api.put(`/mentors/${id}/`, data)
    return response.data
  },

  // Delete a mentor
  deleteMentor: async (id: number) => {
    return await api.delete(`/mentors/${id}/`)
  },

  // Assign a mentor to a startup (creates a relationship)
  assignMentorToStartup: async (mentorId: number, startupId: number, role = "Mentor") => {
    const data = {
      user: mentorId,
      startup: startupId,
      role_in_team: role,
    }
    const response = await api.post(`/startups/${startupId}/team-members/`, data)
    return response.data
  },
}

export default mentorService
