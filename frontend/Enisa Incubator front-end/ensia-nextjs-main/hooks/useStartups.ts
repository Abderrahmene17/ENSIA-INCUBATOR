"use client"

import { useState, useEffect, useCallback } from "react"
import startupService from "../services/startupService"
import type { User, TeamMember as ServiceTeamMember, Startup as ServiceStartup } from "../services/startupService"
import { debounce } from "../utils/debounce"

// Re-export the types from startupService to maintain compatibility
export type { User, TeamMember as ServiceTeamMember, Startup as ServiceStartup } from "../services/startupService"

export interface Startup {
  id: number
  name: string
  description: string
  status: "pending" | "approved" | "rejected"
  user: number | null
  team_members: TeamMember[]
  created_at: string
  updated_at: string
  industry?: string
  stage?: string
  team_leader?: User
}

export interface TeamMember {
  id: number
  user: number
  role_in_team: string
  startup: number
  user_details?: User
}

export const useStartups = () => {
  const [startups, setStartups] = useState<Startup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStartups = async () => {
    try {
      setLoading(true)
      const data = await startupService.getStartups()
      setStartups(data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch startups")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const createStartup = async (data: {
    name: string
    description: string
    industry: string
    stage: string
    teamLeaderName: string
    teamMemberNames: string[]
  }) => {
    try {
      const response = await startupService.createStartupWithTeam(data)
      const startup = response.data
      setStartups((prev) => [...prev, startup])
      return startup
    } catch (err) {
      setError("Failed to create startup")
      console.error(err)
      throw err
    }
  }

  const updateStartup = async (id: number, data: Partial<ServiceStartup>) => {
    try {
      const updatedStartup = await startupService.updateStartup(id, data)
      setStartups((prev) => prev.map((startup) => (startup.id === id ? updatedStartup : startup)))
      return updatedStartup
    } catch (err) {
      setError("Failed to update startup")
      console.error(err)
      throw err
    }
  }

  const deleteStartup = async (id: number) => {
    try {
      await startupService.deleteStartup(id)
      setStartups((prev) => prev.filter((startup) => startup.id !== id))
    } catch (err) {
      setError("Failed to delete startup")
      console.error(err)
      throw err
    }
  }

  const addTeamMember = async (
    startupId: number,
    data: {
      user: number
      role_in_team: string
    },
  ) => {
    try {
      await startupService.addTeamMember(startupId, data)
      const startup = await startupService.getStartup(startupId)
      setStartups((prev) => prev.map((s) => (s.id === startupId ? startup : s)))
    } catch (err) {
      setError("Failed to add team member")
      console.error(err)
      throw err
    }
  }

  const removeTeamMember = async (startupId: number, memberId: number) => {
    try {
      await startupService.removeTeamMember(startupId, memberId)
      const startup = await startupService.getStartup(startupId)
      setStartups((prev) => prev.map((s) => (s.id === startupId ? startup : s)))
    } catch (err) {
      setError("Failed to remove team member")
      console.error(err)
      throw err
    }
  }

  useEffect(() => {
    fetchStartups()
  }, [])

  return {
    startups,
    loading,
    error,
    fetchStartups,
    createStartup,
    updateStartup,
    deleteStartup,
    addTeamMember,
    removeTeamMember,
  }
}

export const useStartup = (id: number) => {
  const [startup, setStartup] = useState<Startup | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Debounce the fetch function
  const debouncedFetch = useCallback(
    debounce(async () => {
      try {
        setLoading(true)
        const [startupData, teamMembersData] = await Promise.all([
          startupService.getStartup(id),
          startupService.getTeamMembers(id),
        ])
        setStartup(startupData)
        setTeamMembers(teamMembersData)
        setError(null)
      } catch (err) {
        setError("Failed to fetch startup data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }, 500),
    [id],
  )

  const addTeamMember = async (data: Partial<ServiceTeamMember> & { member_name?: string }) => {
    try {
      const newMember = await startupService.addTeamMember(id, data)
      setTeamMembers([...teamMembers, newMember])
      return newMember
    } catch (err) {
      setError("Failed to add team member")
      console.error(err)
      throw err
    }
  }

  const removeTeamMember = async (memberId: number) => {
    try {
      await startupService.removeTeamMember(id, memberId)
      setTeamMembers(teamMembers.filter((member) => member.id !== memberId))
    } catch (err) {
      setError("Failed to remove team member")
      console.error(err)
      throw err
    }
  }

  useEffect(() => {
    if (id) {
      debouncedFetch()
    }
  }, [id, debouncedFetch])

  return {
    startup,
    teamMembers,
    loading,
    error,
    addTeamMember,
    removeTeamMember,
  }
}
