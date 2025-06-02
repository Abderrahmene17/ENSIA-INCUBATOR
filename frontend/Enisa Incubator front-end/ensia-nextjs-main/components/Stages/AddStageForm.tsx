"use client"
import { useState } from "react"
import type React from "react"

import { useRouter } from "next/navigation"

const AddStageForm = () => {
  const [stage, setStage] = useState({
    name: "",
    sequence_order: "",
    duration_months: "",
    description: "", // This will be used for UI only as it's not in the backend model
  })

  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"success" | "error">("success")
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    const newErrors: { [key: string]: boolean } = {}
    if (stage.name === "") newErrors.name = true
    if (stage.sequence_order === "") newErrors.sequence_order = true
    if (stage.duration_months === "") newErrors.duration_months = true

    // If there are any errors, set them, otherwise proceed with the submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setIsSubmitting(true)

      // Get JWT token from localStorage
      const token = localStorage.getItem("access_token")

      // Prepare the data for the API
      const stageData = {
        name: stage.name,
        sequence_order: Number.parseInt(stage.sequence_order),
        duration_months: Number.parseInt(stage.duration_months),
      }

      // Make the API request
      const response = await fetch("http://localhost:8000/stages/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(stageData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to create stage")
      }

      const data = await response.json()

      // Show success message
      setToastType("success")
      setToastMessage("Stage added successfully!")
      setShowToast(true)

      // Redirect after a delay - go back to previous page
      setTimeout(() => {
        router.back()
      }, 2000)
    } catch (error) {
      console.error("Error creating stage:", error)
      setToastType("error")
      setToastMessage(error instanceof Error ? error.message : "An error occurred while creating the stage")
      setShowToast(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInputClass = (name: string) => {
    return errors[name]
      ? "w-full rounded-lg border border-red-500 px-5 py-3 dark:border-red-700 dark:bg-blackho dark:text-white"
      : "w-full rounded-lg border border-stroke px-5 py-3 dark:border-strokedark dark:bg-blackho dark:text-white"
  }

  return (
    <section className="min-h-screen bg-white px-6 py-24 dark:bg-blacksection">
      <div className="mx-auto max-w-4xl rounded-2xl border border-stroke bg-white p-10 shadow-lg dark:border-strokedark dark:bg-blackho">
        <h2 className="mb-10 text-3xl font-semibold text-black dark:text-white text-center">
          ➕ Add a New Incubation Stage
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white">
              Stage Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Market Validation, MVP Build..."
              value={stage.name}
              onChange={(e) => setStage({ ...stage, name: e.target.value })}
              className={getInputClass("name")}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">Stage title is required</p>}
          </div>

          <div className="flex flex-col gap-6 md:flex-row">
            <div className="w-full">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white">
                Sequence Order <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 1, 2, 3..."
                value={stage.sequence_order}
                onChange={(e) => setStage({ ...stage, sequence_order: e.target.value })}
                className={getInputClass("sequence_order")}
                min="1"
              />
              {errors.sequence_order && <p className="mt-1 text-sm text-red-500">Sequence order is required</p>}
            </div>
            <div className="w-full">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white">
                Duration (months) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 1, 2, 3..."
                value={stage.duration_months}
                onChange={(e) => setStage({ ...stage, duration_months: e.target.value })}
                className={getInputClass("duration_months")}
                min="1"
              />
              {errors.duration_months && <p className="mt-1 text-sm text-red-500">Duration is required</p>}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white">Description</label>
            <textarea
              rows={6}
              placeholder="Explain what this stage is about and what students should focus on..."
              value={stage.description}
              onChange={(e) => setStage({ ...stage, description: e.target.value })}
              className="w-full rounded-lg border border-stroke px-5 py-3 dark:border-strokedark dark:bg-blackho dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Note: This description is for UI purposes only and won't be stored in the database.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-primary py-3 text-white transition hover:bg-opacity-90 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "✅ Save Stage"}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="w-full rounded-lg border border-stroke bg-transparent py-3 text-center text-black dark:text-white transition hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        </form>

        {showToast && (
          <div
            className={`mt-6 rounded-md px-4 py-3 text-sm ${
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
    </section>
  )
}

export default AddStageForm
