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
    const response = await api.post("/events/", data)
    return response.data
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
