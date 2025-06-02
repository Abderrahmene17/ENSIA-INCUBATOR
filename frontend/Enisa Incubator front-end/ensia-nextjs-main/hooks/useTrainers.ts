"use client"

import { useState, useEffect } from "react"
import trainerService from "../services/trainerService"
import type { User } from "../services/userService"

export const useTrainers = () => {
  const [trainers, setTrainers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTrainers = async () => {
    try {
      setLoading(true)
      const data = await trainerService.getTrainers()
      setTrainers(data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch trainers")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const createTrainer = async (data: { full_name: string; email: string; password: string }) => {
    try {
      const newTrainer = await trainerService.createTrainer(data)
      setTrainers([...trainers, newTrainer])
      return newTrainer
    } catch (err) {
      setError("Failed to create trainer")
      console.error(err)
      throw err
    }
  }

  const updateTrainer = async (id: number, data: Partial<User>) => {
    try {
      const updatedTrainer = await trainerService.updateTrainer(id, data)
      setTrainers(trainers.map((trainer) => (trainer.id === id ? updatedTrainer : trainer)))
      return updatedTrainer
    } catch (err) {
      setError("Failed to update trainer")
      console.error(err)
      throw err
    }
  }

  const deleteTrainer = async (id: number) => {
    try {
      await trainerService.deleteTrainer(id)
      setTrainers(trainers.filter((trainer) => trainer.id !== id))
    } catch (err) {
      setError("Failed to delete trainer")
      console.error(err)
      throw err
    }
  }

  const scheduleTrainer = async (
    trainerId: number,
    eventData: { title: string; description: string; start_time: string; end_time: string; location: string },
  ) => {
    try {
      const result = await trainerService.scheduleTrainer(trainerId, eventData)
      return result
    } catch (err) {
      setError("Failed to schedule trainer")
      console.error(err)
      throw err
    }
  }

  useEffect(() => {
    fetchTrainers()
  }, [])

  return {
    trainers,
    loading,
    error,
    fetchTrainers,
    createTrainer,
    updateTrainer,
    deleteTrainer,
    scheduleTrainer,
  }
}

export const useTrainer = (id: number) => {
  const [trainer, setTrainer] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTrainer = async () => {
    try {
      setLoading(true)
      const data = await trainerService.getTrainer(id)
      setTrainer(data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch trainer")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchTrainer()
    }
  }, [id])

  return {
    trainer,
    loading,
    error,
    fetchTrainer,
  }
}
