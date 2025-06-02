import api from "./api"

export interface Event {
  id: number
  title: string
  description: string
  start_time: string
  end_time: string
  location: string
  user: number
}

const eventService = {
  // Get all events
  getEvents: async () => {
    const response = await api.get("/events/")
    return response.data
  },

  // Get a single event by ID
  getEvent: async (id: number) => {
    const response = await api.get(`/events/${id}/`)
    return response.data
  },

  // Create a new event
  createEvent: async (data: Partial<Event>) => {
    try {
      // First, check if we have a valid user
      const usersResponse = await api.get("/users/")
      const users = Array.isArray(usersResponse.data) ? usersResponse.data : usersResponse.data.results || []

      if (users.length === 0) {
        throw new Error("No users found in the database. Please create users first.")
      }

      // Use the first available user instead of hardcoding user: 1
      const firstUser = users[0]

      // Create a copy of the data and set the user to the first available user
      const eventData = { ...data, user: firstUser.id }

      const response = await api.post("/events/", eventData)
      return response.data
    } catch (error) {
      console.error("Error creating event:", error)
      throw error
    }
  },

  // Update an event
  updateEvent: async (id: number, data: Partial<Event>) => {
    const response = await api.put(`/events/${id}/`, data)
    return response.data
  },

  // Delete an event
  deleteEvent: async (id: number) => {
    return await api.delete(`/events/${id}/`)
  },
}
export default eventService
