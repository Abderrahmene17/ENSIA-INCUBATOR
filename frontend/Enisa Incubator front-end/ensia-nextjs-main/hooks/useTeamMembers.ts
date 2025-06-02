"use client"

import { useState, useEffect } from "react"
import api from "@/services/api"

interface TeamMember {
  id: number
  user: number
  startup: number
  role_in_team: string
  user_details: {
    id: number
    full_name: string
    email: string
  }
}

export const useTeamMembers = (startupId: number) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeamMembers = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/startups/${startupId}/team/`)
      setTeamMembers(response.data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch team members")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const addTeamMember = async (data: { user: number; role_in_team: string }) => {
    try {
      const response = await api.post(`/startups/${startupId}/team/`, data)
      setTeamMembers([...teamMembers, response.data])
      return response.data
    } catch (err) {
      setError("Failed to add team member")
      console.error(err)
      throw err
    }
  }

  const removeTeamMember = async (memberId: number) => {
    try {
      await api.delete(`/startups/${startupId}/team/${memberId}/`)
      setTeamMembers(teamMembers.filter((member) => member.id !== memberId))
    } catch (err) {
      setError("Failed to remove team member")
      console.error(err)
      throw err
    }
  }

  useEffect(() => {
    if (startupId) {
      fetchTeamMembers()
    }
  }, [startupId])

  return {
    teamMembers,
    loading,
    error,
    fetchTeamMembers,
    addTeamMember,
    removeTeamMember,
  }
}
