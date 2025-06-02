"use client"

import { useState, useEffect } from "react"
import mentorService from "../services/mentorService"
import type { User } from "../services/userService"

export const useMentors = () => {
  const [mentors, setMentors] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMentors = async () => {
    try {
      setLoading(true)
      const data = await mentorService.getMentors()
      setMentors(data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch mentors")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const createMentor = async (data: { full_name: string; email: string; password: string }) => {
    try {
      const newMentor = await mentorService.createMentor(data)
      setMentors([...mentors, newMentor])
      return newMentor
    } catch (err) {
      setError("Failed to create mentor")
      console.error(err)
      throw err
    }
  }

  const updateMentor = async (id: number, data: Partial<User>) => {
    try {
      const updatedMentor = await mentorService.updateMentor(id, data)
      setMentors(mentors.map((mentor) => (mentor.id === id ? updatedMentor : mentor)))
      return updatedMentor
    } catch (err) {
      setError("Failed to update mentor")
      console.error(err)
      throw err
    }
  }

  const deleteMentor = async (id: number) => {
    try {
      await mentorService.deleteMentor(id)
      setMentors(mentors.filter((mentor) => mentor.id !== id))
    } catch (err) {
      setError("Failed to delete mentor")
      console.error(err)
      throw err
    }
  }

  const assignMentorToStartup = async (mentorId: number, startupId: number, role = "Mentor") => {
    try {
      const result = await mentorService.assignMentorToStartup(mentorId, startupId, role)
      return result
    } catch (err) {
      setError("Failed to assign mentor to startup")
      console.error(err)
      throw err
    }
  }

  useEffect(() => {
    fetchMentors()
  }, [])

  return {
    mentors,
    loading,
    error,
    fetchMentors,
    createMentor,
    updateMentor,
    deleteMentor,
    assignMentorToStartup,
  }
}

export const useMentor = (id: number) => {
  const [mentor, setMentor] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMentor = async () => {
    try {
      setLoading(true)
      const data = await mentorService.getMentor(id)
      setMentor(data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch mentor")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchMentor()
    }
  }, [id])

  return {
    mentor,
    loading,
    error,
    fetchMentor,
  }
}
