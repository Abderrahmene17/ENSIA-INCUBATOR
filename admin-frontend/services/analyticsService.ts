import api from "./api"

export interface DashboardStats {
  active_startups: number
  pending_applications: number
  pending_forms: number
  mentors_count: number
  trainers_count: number
  upcoming_events: number
  events_this_week: number
}

export interface StatusAnalytics {
  name: string
  value: number
}

export interface ResourceUtilization {
  name: string
  total: number
  used: number
  available: number
}

export interface AcceptanceRateData {
  rate: number
  period: string
  accepted: number
  total: number
}

export interface SurvivalRateData {
  rate: number
  period: string
  survived: number
  total: number
}

const analyticsService = {
  // Get dashboard summary statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get("/analytics/dashboard/")
      return response.data
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      // Return default values if API fails
      return {
        active_startups: 0,
        pending_applications: 0,
        pending_forms: 0,
        mentors_count: 0,
        trainers_count: 0,
        upcoming_events: 0,
        events_this_week: 0,
      }
    }
  },

  // Get startup status analytics
  getStartupStatusAnalytics: async (): Promise<StatusAnalytics[]> => {
    try {
      const response = await api.get("/analytics/startup-status/")
      return response.data
    } catch (error) {
      console.error("Error fetching startup status analytics:", error)
      // Return default values if API fails
      return [
        { name: "Active", value: 0 },
        { name: "Inactive", value: 0 },
        { name: "Graduated", value: 0 },
      ]
    }
  },

  // Get application status analytics
  getApplicationStatusAnalytics: async (): Promise<StatusAnalytics[]> => {
    try {
      const response = await api.get("/analytics/application-status/")
      return response.data
    } catch (error) {
      console.error("Error fetching application status analytics:", error)
      // Return default values if API fails
      return [
        { name: "Pending", value: 0 },
        { name: "Approved", value: 0 },
        { name: "Rejected", value: 0 },
      ]
    }
  },

  // Get resource utilization analytics
  getResourceUtilizationAnalytics: async (): Promise<ResourceUtilization[]> => {
    try {
      const response = await api.get("/analytics/resource-utilization/")
      return response.data
    } catch (error) {
      console.error("Error fetching resource utilization analytics:", error)
      // Return default values if API fails
      return []
    }
  },

  // Get acceptance rate analytics
  getAcceptanceRateAnalytics: async (): Promise<AcceptanceRateData> => {
    try {
      const response = await api.get("/analytics/acceptance-rate/")
      return response.data
    } catch (error) {
      console.error("Error fetching acceptance rate analytics:", error)
      // Return default values if API fails
      return {
        rate: 0,
        period: "Q4 2023",
        accepted: 0,
        total: 0,
      }
    }
  },

  // Get survival rate analytics
  getSurvivalRateAnalytics: async (): Promise<SurvivalRateData> => {
    try {
      const response = await api.get("/analytics/survival-rate/")
      return response.data
    } catch (error) {
      console.error("Error fetching survival rate analytics:", error)
      // Return default values if API fails
      return {
        rate: 0,
        period: "6 months",
        survived: 0,
        total: 0,
      }
    }
  },
}

export default analyticsService
