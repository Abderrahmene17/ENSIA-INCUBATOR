"use client"

import { useState, useEffect, useCallback } from "react"
import analyticsService from "../services/analyticsService"

// Interface for our dashboard statistics
export interface DashboardStats {
  active_startups: number
  pending_applications: number
  pending_forms: number
  mentors_count: number
  trainers_count: number
  upcoming_events: number
  events_this_week: number
}

// Interface for chart data
export interface ChartData {
  name: string
  value: number
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

export interface ResourceUtilizationData {
  name: string
  total: number
  used: number
  available: number
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await analyticsService.getDashboardStats()
      setStats(data)
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err)
      setError("Failed to load dashboard statistics")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    fetchStats,
  }
}

export function useApplicationStatusAnalytics() {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await analyticsService.getApplicationStatusAnalytics()
        setData(result)
      } catch (err) {
        console.error("Error fetching application analytics:", err)
        setError("Failed to load application analytics")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}

export function useStartupStatusAnalytics() {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await analyticsService.getStartupStatusAnalytics()
        setData(result)
      } catch (err) {
        console.error("Error fetching startup analytics:", err)
        setError("Failed to load startup analytics")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}

export function useResourceUtilizationAnalytics() {
  const [data, setData] = useState<ResourceUtilizationData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await analyticsService.getResourceUtilizationAnalytics()
        setData(result)
      } catch (err) {
        console.error("Error fetching resource utilization analytics:", err)
        setError("Failed to load resource utilization analytics")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}

export function useAcceptanceRateAnalytics() {
  const [data, setData] = useState<AcceptanceRateData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await analyticsService.getAcceptanceRateAnalytics()
        setData(result)
      } catch (err) {
        console.error("Error fetching acceptance rate analytics:", err)
        setError("Failed to load acceptance rate analytics")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}

export function useSurvivalRateAnalytics() {
  const [data, setData] = useState<SurvivalRateData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await analyticsService.getSurvivalRateAnalytics()
        setData(result)
      } catch (err) {
        console.error("Error fetching survival rate analytics:", err)
        setError("Failed to load survival rate analytics")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}
