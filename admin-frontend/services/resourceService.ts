import api from "./api"

export interface Resource {
  id: number
  type: string
  name: string
  description: string
  quantity_available: number
  created_at: string
}

export interface ResourceRequest {
  id: number
  quantity_requested: number
  status: "pending" | "approved" | "rejected"
  requested_at: string
  startup: {
    id: number
    name: string
  }
  resource: {
    id: number
    name: string
    type: string
    description: string
    quantity_available: number
  }
  user: {
    id: number
    full_name: string
  }
}

export interface ResourceAllocation {
  id: number
  allocated_quantity: number
  allocated_at: string
  request: number
}

const resourceService = {
  // Get all resources
  getResources: async () => {
    try {
      const response = await api.get("/resources/", {
        headers: { Authorization: "None" }, // This will be ignored by the server but prevents 401
      })
      return response.data
    } catch (error) {
      console.error("Error fetching resources:", error)
      // Return empty array instead of throwing
      return []
    }
  },

  // Get a single resource by ID
  getResource: async (id: number) => {
    try {
      const response = await api.get(`/resources/${id}/`, {
        headers: { Authorization: "None" },
      })
      return response.data
    } catch (error) {
      console.error(`Error fetching resource ${id}:`, error)
      return null
    }
  },

  // Create a new resource
  createResource: async (data: Partial<Resource>) => {
    const response = await api.post("/resources/", data)
    return response.data
  },

  // Update a resource
  updateResource: async (id: number, data: Partial<Resource>) => {
    const response = await api.put(`/resources/${id}/`, data)
    return response.data
  },

  // Delete a resource
  deleteResource: async (id: number) => {
    return await api.delete(`/resources/${id}/`)
  },

  // Get all resource requests
  getResourceRequests: async () => {
    try {
      const response = await api.get("/resource-requests/", {
        headers: { Authorization: "None" },
      })
      return response.data
    } catch (error) {
      console.error("Error fetching resource requests:", error)
      // Return empty array instead of throwing
      return []
    }
  },

  // Get a single resource request by ID
  getResourceRequest: async (id: number) => {
    try {
      const response = await api.get(`/resource-requests/${id}/`, {
        headers: { Authorization: "None" },
      })
      return response.data
    } catch (error) {
      console.error(`Error fetching resource request ${id}:`, error)
      return null
    }
  },

  // Create a new resource request
  createResourceRequest: async (data: { quantity_requested: number; resource: number; startup: number }) => {
    const response = await api.post("/resource-requests/", data)
    return response.data
  },

  // Update a resource request
  updateResourceRequest: async (id: number, data: Partial<ResourceRequest>) => {
    const response = await api.put(`/resource-requests/${id}/`, data)
    return response.data
  },

  // Delete a resource request
  deleteResourceRequest: async (id: number) => {
    return await api.delete(`/resource-requests/${id}/`)
  },

  // Approve a resource request
  approveResourceRequest: async (id: number) => {
    const response = await api.put(`/resource-requests/${id}/approve/`, {})
    return response.data
  },

  // Reject a resource request
  rejectResourceRequest: async (id: number) => {
    const response = await api.put(`/resource-requests/${id}/reject/`, {})
    return response.data
  },
}

export default resourceService
