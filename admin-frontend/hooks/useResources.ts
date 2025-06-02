"use client"

import { useState, useEffect } from "react"
import resourceService, { type Resource, type ResourceRequest } from "../services/resourceService"

export const useResources = () => {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchResources = async () => {
    try {
      setLoading(true)
      const data = await resourceService.getResources()
      setResources(data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch resources")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const createResource = async (data: Partial<Resource>) => {
    try {
      const newResource = await resourceService.createResource(data)
      setResources([...resources, newResource])
      return newResource
    } catch (err) {
      setError("Failed to create resource")
      console.error(err)
      throw err
    }
  }

  const updateResource = async (id: number, data: Partial<Resource>) => {
    try {
      const updatedResource = await resourceService.updateResource(id, data)
      setResources(resources.map((resource) => (resource.id === id ? updatedResource : resource)))
      return updatedResource
    } catch (err) {
      setError("Failed to update resource")
      console.error(err)
      throw err
    }
  }

  const deleteResource = async (id: number) => {
    try {
      await resourceService.deleteResource(id)
      setResources(resources.filter((resource) => resource.id !== id))
    } catch (err) {
      setError("Failed to delete resource")
      console.error(err)
      throw err
    }
  }

  useEffect(() => {
    fetchResources()
  }, [])

  return {
    resources,
    loading,
    error,
    fetchResources,
    createResource,
    updateResource,
    deleteResource,
  }
}

export const useResourceRequests = () => {
  const [requests, setRequests] = useState<ResourceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const data = await resourceService.getResourceRequests()
      setRequests(data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch resource requests")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const createRequest = async (data: { quantity_requested: number; resource: number; startup: number }) => {
    try {
      const newRequest = await resourceService.createResourceRequest(data)
      setRequests([...requests, newRequest])
      return newRequest
    } catch (err) {
      setError("Failed to create resource request")
      console.error(err)
      throw err
    }
  }

  const updateRequest = async (id: number, data: Partial<ResourceRequest>) => {
    try {
      const updatedRequest = await resourceService.updateResourceRequest(id, data)
      setRequests(requests.map((request) => (request.id === id ? updatedRequest : request)))
      return updatedRequest
    } catch (err) {
      setError("Failed to update resource request")
      console.error(err)
      throw err
    }
  }

  const deleteRequest = async (id: number) => {
    try {
      await resourceService.deleteResourceRequest(id)
      setRequests(requests.filter((request) => request.id !== id))
    } catch (err) {
      setError("Failed to delete resource request")
      console.error(err)
      throw err
    }
  }

  const approveRequest = async (id: number) => {
    try {
      const updatedRequest = await resourceService.approveResourceRequest(id)
      setRequests(requests.map((request) => (request.id === id ? updatedRequest : request)))
      return updatedRequest
    } catch (err) {
      setError("Failed to approve resource request")
      console.error(err)
      throw err
    }
  }

  const rejectRequest = async (id: number) => {
    try {
      const updatedRequest = await resourceService.rejectResourceRequest(id)
      setRequests(requests.map((request) => (request.id === id ? updatedRequest : request)))
      return updatedRequest
    } catch (err) {
      setError("Failed to reject resource request")
      console.error(err)
      throw err
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  return {
    requests,
    loading,
    error,
    fetchRequests,
    createRequest,
    updateRequest,
    deleteRequest,
    approveRequest,
    rejectRequest,
  }
}
