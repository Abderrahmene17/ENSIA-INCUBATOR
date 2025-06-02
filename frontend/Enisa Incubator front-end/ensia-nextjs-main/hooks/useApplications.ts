"use client"

import { useState, useEffect } from "react"
import applicationService, {
  type Application,
  type ApplicationVote,
  type ApplicationScore,
} from "../services/applicationService"

export const useApplications = () => {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const data = await applicationService.getApplications()
      setApplications(data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch applications")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const deleteApplication = async (id: number) => {
    try {
      await applicationService.deleteApplication(id)
      setApplications(applications.filter((app) => app.id !== id))
    } catch (err) {
      setError("Failed to delete application")
      console.error(err)
      throw err
    }
  }

  const exportApplicationsCSV = async () => {
    try {
      const blob = await applicationService.exportApplicationsCSV()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `applications-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError("Failed to export applications")
      console.error(err)
      throw err
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  return {
    applications,
    loading,
    error,
    fetchApplications,
    deleteApplication,
    exportApplicationsCSV,
  }
}

export const useApplication = (id: number) => {
  const [application, setApplication] = useState<Application | null>(null)
  const [votes, setVotes] = useState<ApplicationVote[]>([])
  const [scores, setScores] = useState<ApplicationScore[]>([])
  const [averageScore, setAverageScore] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchApplication = async () => {
    try {
      setLoading(true)
      const data = await applicationService.getApplication(id)
      setApplication(data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch application")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchVotes = async () => {
    try {
      const data = await applicationService.getApplicationVotes(id)
      setVotes(data)
    } catch (err) {
      console.error("Failed to fetch votes", err)
    }
  }

  const fetchScores = async () => {
    try {
      const data = await applicationService.getApplicationScores(id)
      setScores(data)
    } catch (err) {
      console.error("Failed to fetch scores", err)
    }
  }

  const fetchAverageScore = async () => {
    try {
      const score = await applicationService.getApplicationAverageScore(id)
      setAverageScore(score)
    } catch (err) {
      console.error("Failed to fetch average score", err)
    }
  }

  const updateApplicationStatus = async (status: string) => {
    try {
      const updatedApplication = await applicationService.updateApplicationStatus(id, status)
      setApplication(updatedApplication)
      return updatedApplication
    } catch (err) {
      setError("Failed to update application status")
      console.error(err)
      throw err
    }
  }

  useEffect(() => {
    if (id) {
      fetchApplication()
      fetchVotes()
      fetchScores()
      fetchAverageScore()
    }
  }, [id])

  return {
    application,
    votes,
    scores,
    averageScore,
    loading,
    error,
    fetchApplication,
    fetchVotes,
    fetchScores,
    fetchAverageScore,
    updateApplicationStatus,
  }
}
