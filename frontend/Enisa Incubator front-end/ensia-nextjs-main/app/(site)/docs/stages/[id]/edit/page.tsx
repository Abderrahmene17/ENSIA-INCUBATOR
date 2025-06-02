"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

interface Stage {
  id: number
  name: string
  sequence_order: number
  duration_months: number
}

interface Deliverable {
  id: number
  title: string
  description: string
  due_date: string
  submission_url: string | null
  status: string
  submitted_at: string | null
  stage: number
  startup: number
}

export default function EditStagePage() {
  const params = useParams()
  const stageId = params?.id
  const router = useRouter()

  const [stage, setStage] = useState<Stage | null>(null)
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"success" | "error">("success")

  // New deliverable form state
  const [newDeliverable, setNewDeliverable] = useState({
    title: "",
    description: "",
    due_date: "",
    submission_url: "",
  })
  const [deliverableErrors, setDeliverableErrors] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    const fetchStageAndDeliverables = async () => {
      try {
        setLoading(true)
        // Get JWT token from localStorage
        const token = localStorage.getItem("access_token")

        // Fetch stage details
        const stageResponse = await fetch(`http://localhost:8000/stages/${stageId}/`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "Content-Type": "application/json",
          },
        })

        if (!stageResponse.ok) {
          throw new Error(`HTTP error! status: ${stageResponse.status}`)
        }

        const stageData = await stageResponse.json()
        setStage(stageData)

        // Fetch deliverables for this stage
        const deliverablesResponse = await fetch(`http://localhost:8000/deliverables/`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "Content-Type": "application/json",
          },
        })

        if (deliverablesResponse.ok) {
          const allDeliverables = await deliverablesResponse.json()
          // Filter deliverables for this stage
          const stageDeliverables = allDeliverables.filter(
            (d: Deliverable) => d.stage === Number.parseInt(stageId as string),
          )
          setDeliverables(stageDeliverables)
        }

        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load stage data. Please try again later.")
        setLoading(false)
      }
    }

    if (stageId) {
      fetchStageAndDeliverables()
    }
  }, [stageId])

  const handleStageUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stage) return

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("access_token")

      const response = await fetch(`http://localhost:8000/stages/${stageId}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(stage),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to update stage")
      }

      setToastType("success")
      setToastMessage("Stage updated successfully!")
      setShowToast(true)

      // Hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false)
      }, 3000)
    } catch (error) {
      console.error("Error updating stage:", error)
      setToastType("error")
      setToastMessage(error instanceof Error ? error.message : "An error occurred while updating the stage")
      setShowToast(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteStage = async () => {
    if (!window.confirm("Are you sure you want to delete this stage? This action cannot be undone.")) {
      return
    }

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("access_token")

      const response = await fetch(`http://localhost:8000/stages/${stageId}/`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete stage: ${response.statusText}`)
      }

      // Show success message and redirect
      alert("Stage deleted successfully")
      router.back()
    } catch (error) {
      console.error("Error deleting stage:", error)
      alert(error instanceof Error ? error.message : "An error occurred while deleting the stage")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddDeliverable = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    const errors: { [key: string]: boolean } = {}
    if (!newDeliverable.title) errors.title = true
    if (!newDeliverable.description) errors.description = true
    if (!newDeliverable.due_date) errors.due_date = true

    if (Object.keys(errors).length > 0) {
      setDeliverableErrors(errors)
      return
    }

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("access_token")

      // For demo purposes, we'll use a default startup ID
      // In a real app, you might want to select a startup or make this more dynamic
      const defaultStartupId = 1

      const deliverableData = {
        title: newDeliverable.title,
        description: newDeliverable.description,
        due_date: newDeliverable.due_date,
        submission_url: newDeliverable.submission_url || null,
        status: "pending",
        stage: Number.parseInt(stageId as string),
        startup: defaultStartupId,
      }

      const response = await fetch("http://localhost:8000/deliverables/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(deliverableData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to create deliverable")
      }

      const data = await response.json()

      // Add the new deliverable to the list
      setDeliverables([...deliverables, data])

      // Reset the form
      setNewDeliverable({
        title: "",
        description: "",
        due_date: "",
        submission_url: "",
      })
      setDeliverableErrors({})

      setToastType("success")
      setToastMessage("Deliverable added successfully!")
      setShowToast(true)

      // Hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false)
      }, 3000)
    } catch (error) {
      console.error("Error adding deliverable:", error)
      setToastType("error")
      setToastMessage(error instanceof Error ? error.message : "An error occurred while adding the deliverable")
      setShowToast(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteDeliverable = async (deliverableId: number) => {
    if (!window.confirm("Are you sure you want to delete this deliverable?")) {
      return
    }

    try {
      const token = localStorage.getItem("access_token")

      const response = await fetch(`http://localhost:8000/deliverables/${deliverableId}/`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete deliverable: ${response.statusText}`)
      }

      // Remove the deleted deliverable from the list
      setDeliverables(deliverables.filter((d) => d.id !== deliverableId))

      setToastType("success")
      setToastMessage("Deliverable deleted successfully!")
      setShowToast(true)

      // Hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false)
      }, 3000)
    } catch (error) {
      console.error("Error deleting deliverable:", error)
      setToastType("error")
      setToastMessage(error instanceof Error ? error.message : "An error occurred while deleting the deliverable")
      setShowToast(true)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!stage) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-700 dark:text-yellow-300">Stage not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <section className="pb-16 pt-24 md:pb-20 md:pt-28 lg:pb-24 lg:pt-32 dark:bg-blacksection">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Stage Edit Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Edit Stage</h1>
              <button
                onClick={() => router.back()}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                ← Back
              </button>
            </div>

            <form onSubmit={handleStageUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stage Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={stage.name}
                  onChange={(e) => setStage({ ...stage, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sequence Order <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={stage.sequence_order}
                    onChange={(e) => setStage({ ...stage, sequence_order: Number.parseInt(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 dark:bg-gray-700 dark:text-white"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Duration (months) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={stage.duration_months}
                    onChange={(e) => setStage({ ...stage, duration_months: Number.parseInt(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 dark:bg-gray-700 dark:text-white"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-70"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={handleDeleteStage}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-70"
                >
                  Delete Stage
                </button>
              </div>
            </form>
          </div>

          {/* Deliverables Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">Deliverables</h2>

            {/* Existing Deliverables */}
            {deliverables.length > 0 ? (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Existing Deliverables</h3>
                <div className="space-y-4">
                  {deliverables.map((deliverable) => (
                    <div
                      key={deliverable.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="flex justify-between">
                        <h4 className="font-medium text-lg">{deliverable.title}</h4>
                        <div className="flex space-x-2">
                          <Link
                            href={`/docs/deliverables/${deliverable.id}/edit`}
                            className="text-primary hover:text-primary/80"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteDeliverable(deliverable.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mt-2">{deliverable.description}</p>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          Due: {new Date(deliverable.due_date).toLocaleDateString()}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            deliverable.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : deliverable.status === "submitted"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          }`}
                        >
                          {deliverable.status.charAt(0).toUpperCase() + deliverable.status.slice(1)}
                        </span>
                      </div>
                      {deliverable.submission_url && (
                        <div className="mt-2">
                          <a
                            href={deliverable.submission_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            View Submission
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 mb-6">No deliverables found for this stage.</p>
            )}

            {/* Add New Deliverable Form */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold mb-4">Add New Deliverable</h3>
              <form onSubmit={handleAddDeliverable} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newDeliverable.title}
                    onChange={(e) => setNewDeliverable({ ...newDeliverable, title: e.target.value })}
                    className={`w-full rounded-lg border ${
                      deliverableErrors.title ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } px-4 py-2 dark:bg-gray-700 dark:text-white`}
                    placeholder="e.g. Business Model Canvas"
                  />
                  {deliverableErrors.title && <p className="mt-1 text-sm text-red-500">Title is required</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={newDeliverable.description}
                    onChange={(e) => setNewDeliverable({ ...newDeliverable, description: e.target.value })}
                    className={`w-full rounded-lg border ${
                      deliverableErrors.description ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } px-4 py-2 dark:bg-gray-700 dark:text-white`}
                    rows={3}
                    placeholder="Describe what students need to submit..."
                  ></textarea>
                  {deliverableErrors.description && (
                    <p className="mt-1 text-sm text-red-500">Description is required</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newDeliverable.due_date}
                    onChange={(e) => setNewDeliverable({ ...newDeliverable, due_date: e.target.value })}
                    className={`w-full rounded-lg border ${
                      deliverableErrors.due_date ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } px-4 py-2 dark:bg-gray-700 dark:text-white`}
                  />
                  {deliverableErrors.due_date && <p className="mt-1 text-sm text-red-500">Due date is required</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Submission URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={newDeliverable.submission_url}
                    onChange={(e) => setNewDeliverable({ ...newDeliverable, submission_url: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g. https://drive.google.com/file/..."
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-70"
                  >
                    {isSubmitting ? "Adding..." : "Add Deliverable"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Toast Message */}
          {showToast && (
            <div
              className={`fixed bottom-4 right-4 px-6 py-3 rounded-md shadow-lg ${
                toastType === "success"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {toastType === "success" ? "✅ " : "❌ "}
              {toastMessage}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
