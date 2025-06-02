"use client"

import { useState, useEffect } from "react"
import incubationFormService, { type IncubationForm } from "../services/incubationFormService"

export const useIncubationForms = () => {
  const [forms, setForms] = useState<IncubationForm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchForms = async () => {
    try {
      setLoading(true)
      const data = await incubationFormService.getIncubationForms()
      setForms(data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch incubation forms")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingForms = async () => {
    try {
      setLoading(true)
      const data = await incubationFormService.getPendingIncubationForms()
      setForms(data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch pending incubation forms")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const deleteForm = async (id: number) => {
    try {
      await incubationFormService.deleteIncubationForm(id)
      setForms(forms.filter((form) => form.id !== id))
    } catch (err) {
      setError("Failed to delete incubation form")
      console.error(err)
      throw err
    }
  }

  const exportFormsCSV = async () => {
    try {
      const blob = await incubationFormService.exportIncubationFormsCSV()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `incubation-forms-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError("Failed to export incubation forms")
      console.error(err)
      throw err
    }
  }

  useEffect(() => {
    fetchForms()
  }, [])

  return {
    forms,
    loading,
    error,
    fetchForms,
    fetchPendingForms,
    deleteForm,
    exportFormsCSV,
  }
}

export const useIncubationForm = (id: number) => {
  const [form, setForm] = useState<IncubationForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchForm = async () => {
    try {
      setLoading(true)
      const data = await incubationFormService.getIncubationForm(id)
      setForm(data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch incubation form")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateFormStatus = async (status: string) => {
    try {
      const updatedForm = await incubationFormService.updateIncubationFormStatus(id, status)
      setForm(updatedForm)
      return updatedForm
    } catch (err) {
      setError("Failed to update incubation form status")
      console.error(err)
      throw err
    }
  }

  const updateForm = async (data: Partial<IncubationForm>) => {
    try {
      const updatedForm = await incubationFormService.updateIncubationForm(id, data)
      setForm(updatedForm)
      return updatedForm
    } catch (err) {
      setError("Failed to update incubation form")
      console.error(err)
      throw err
    }
  }

  useEffect(() => {
    if (id) {
      fetchForm()
    }
  }, [id])

  return {
    form,
    loading,
    error,
    fetchForm,
    updateFormStatus,
    updateForm,
  }
}
