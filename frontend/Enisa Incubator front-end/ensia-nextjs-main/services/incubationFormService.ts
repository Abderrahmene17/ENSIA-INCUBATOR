import api from "./api"

export interface IncubationForm {
  id: number
  project_id: string
  team_leader_name: string
  team_leader_year: string
  team_leader_email: string
  team_leader_phone: string
  team_members: string
  project_title: string
  project_domain: string
  is_ai_project: boolean
  project_summary: string
  dev_stage: string
  demo_link: string
  project_video: string
  key_milestones: string
  current_challenges: string
  problem_statement: string
  target_audience: string
  expected_impact: string
  additional_motivation: string
  supporting_documents: string | null
  confirmation: boolean
  status: "pending" | "approved" | "rejected" | "in_progress"
  created_at: string
  updated_at: string
}

const incubationFormService = {
  getIncubationForms: async () => {
    const response = await api.get("/incubation-form/")
    return response.data
  },

  getIncubationForm: async (id: number) => {
    const response = await api.get(`/incubation-form/${id}/`)
    return response.data
  },

  getPendingIncubationForms: async () => {
    const response = await api.get("/incubation-form/pending/")
    return response.data
  },

  updateIncubationForm: async (id: number, data: Partial<IncubationForm>) => {
    const response = await api.put(`/incubation-form/${id}/`, data)
    return response.data
  },

  updateIncubationFormStatus: async (id: number, status: string) => {
    const response = await api.put(`/incubation-form/${id}/status/`, { status })
    return response.data
  },

  deleteIncubationForm: async (id: number) => {
    return await api.delete(`/incubation-form/${id}/`)
  },

  // Export incubation forms as CSV
  exportIncubationFormsCSV: async () => {
    const response = await api.get("/incubation-form/export-csv/", {
      responseType: "blob",
    })
    return response.data
  },
}

export default incubationFormService
