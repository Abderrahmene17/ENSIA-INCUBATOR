import api from "./api"

export interface Application {
  id: number
  status: "pending" | "approved" | "rejected"
  submitted_at: string
  google_form_url: string | null
  startup: number
  startup_name?: string
}

export interface ApplicationVote {
  id: number
  vote: boolean
  voted_at: string
  application: number
  user: number
}

export interface ApplicationScore {
  id: number
  score: number
  scored_at: string
  application: number
  user: number
}

const applicationService = {
  // Get all applications
  getApplications: async () => {
    const response = await api.get("/applications/")
    return response.data
  },

  // Get a single application by ID
  getApplication: async (id: number) => {
    const response = await api.get(`/applications/${id}/`)
    return response.data
  },

  // Update application status
  updateApplicationStatus: async (id: number, status: string) => {
    const response = await api.put(`/applications/${id}/status/`, { status })
    return response.data
  },

  // Delete an application
  deleteApplication: async (id: number) => {
    return await api.delete(`/applications/${id}/`)
  },

  // Get application votes
  getApplicationVotes: async (id: number) => {
    const response = await api.get(`/applications/${id}/votes/`)
    return response.data
  },

  // Get application scores
  getApplicationScores: async (id: number) => {
    const response = await api.get(`/applications/${id}/scores/`)
    return response.data
  },

  // Get application average score
  getApplicationAverageScore: async (id: number) => {
    const response = await api.get(`/applications/${id}/average-score/`)
    return response.data.average_score
  },

  // Export applications as CSV
  exportApplicationsCSV: async () => {
    const response = await api.get("/applications/export-csv/", {
      responseType: "blob",
    })
    return response.data
  },
}

export default applicationService
