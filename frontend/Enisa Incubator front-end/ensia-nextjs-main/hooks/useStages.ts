"use client"

import { useState, useEffect } from "react"
import api from "@/services/api"

export interface Stage {
  id: number
  name: string
  sequence_order: number
  duration_months: number
}

export const useStages = () => {
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStages = async () => {
    try {
      setLoading(true)
      const response = await api.get("/stages/")
      setStages(response.data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch stages")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const createStage = async (data: Partial<Stage>) => {
    try {
      const response = await api.post("/stages/", data)
      setStages([...stages, response.data])
      return response.data
    } catch (err) {
      setError("Failed to create stage")
      console.error(err)
      throw err
    }
  }

  const updateStage = async (id: number, data: Partial<Stage>) => {
    try {
      const response = await api.put(`/stages/${id}/`, data)
      setStages(stages.map((stage) => (stage.id === id ? response.data : stage)))
      return response.data
    } catch (err) {
      setError("Failed to update stage")
      console.error(err)
      throw err
    }
  }

  const deleteStage = async (id: number) => {
    try {
      await api.delete(`/stages/${id}/`)
      setStages(stages.filter((stage) => stage.id !== id))
    } catch (err) {
      setError("Failed to delete stage")
      console.error(err)
      throw err
    }
  }

  useEffect(() => {
    fetchStages()
  }, [])

  return {
    stages,
    loading,
    error,
    fetchStages,
    createStage,
    updateStage,
    deleteStage,
  }
}
