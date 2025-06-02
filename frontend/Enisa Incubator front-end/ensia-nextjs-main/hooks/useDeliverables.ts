"use client"

import { useState, useEffect } from "react"
import api from "@/services/api"

export interface Deliverable {
  id: number
  title: string
  description: string
  due_date: string
  submission_url: string | null
  status: "pending" | "submitted" | "reviewed"
  stage: number
  startup: number
}

export const useDeliverables = (startupId?: number) => {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDeliverables = async () => {
    try {
      setLoading(true)
      const url = startupId ? `/deliverables/?startup=${startupId}` : "/deliverables/"
      const response = await api.get(url)
      setDeliverables(response.data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch deliverables")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const createDeliverable = async (data: Partial<Deliverable>) => {
    try {
      const response = await api.post("/deliverables/", data)
      setDeliverables([...deliverables, response.data])
      return response.data
    } catch (err) {
      setError("Failed to create deliverable")
      console.error(err)
      throw err
    }
  }

  const updateDeliverable = async (id: number, data: Partial<Deliverable>) => {
    try {
      const response = await api.put(`/deliverables/${id}/`, data)
      setDeliverables(deliverables.map((deliverable) => (deliverable.id === id ? response.data : deliverable)))
      return response.data
    } catch (err) {
      setError("Failed to update deliverable")
      console.error(err)
      throw err
    }
  }

  const deleteDeliverable = async (id: number) => {
    try {
      await api.delete(`/deliverables/${id}/`)
      setDeliverables(deliverables.filter((deliverable) => deliverable.id !== id))
    } catch (err) {
      setError("Failed to delete deliverable")
      console.error(err)
      throw err
    }
  }

  const submitDeliverable = async (id: number, submissionUrl: string) => {
    try {
      const response = await api.put(`/deliverables/${id}/`, {
        status: "submitted",
        submission_url: submissionUrl,
      })
      setDeliverables(deliverables.map((deliverable) => (deliverable.id === id ? response.data : deliverable)))
      return response.data
    } catch (err) {
      setError("Failed to submit deliverable")
      console.error(err)
      throw err
    }
  }

  useEffect(() => {
    fetchDeliverables()
  }, [startupId])

  return {
    deliverables,
    loading,
    error,
    fetchDeliverables,
    createDeliverable,
    updateDeliverable,
    deleteDeliverable,
    submitDeliverable,
  }
}
