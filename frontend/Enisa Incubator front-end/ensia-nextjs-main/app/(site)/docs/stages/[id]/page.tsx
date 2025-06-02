"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import SidebarLink from "@/components/Docs/SidebarLink"

// Define the Stage interface
interface Stage {
  id: number
  name: string
  sequence_order: number
  duration_months: number
}

// Define the Startup interface
interface Startup {
  id: number
  name: string
  description: string
  status: "pending" | "approved" | "rejected"
  stage: number | null // Added stage ID reference
  created_at: string
  updated_at: string
}

const cardData = [
  {
    title: "🎯 Purpose of the Platform",
    color: "primary",
    description:
      "The incubation platform serves as the central space for managing all startup-related activities. It ensures clarity, structure, and communication between students, mentors, coaches, and admins throughout the entire journey.",
  },
  {
    title: "👥 Who Uses This?",
    color: "blue-500",
    description:
      "This page is relevant to all members involved in incubation — from student founders navigating their journey, to mentors guiding progress, and coaches overseeing startup performance.",
  },
  {
    title: "🔍 What Will Be Shown Here?",
    color: "green-500",
    description:
      "This dashboard will provide visibility into startup stages, key milestones, submission requirements, and progress tracking. It enables real-time monitoring and effective communication between all roles.",
  },
  {
    title: "📌 What to Expect",
    color: "yellow-500",
    description:
      "You'll find each incubation stage clearly defined with objectives, deliverables, and deadlines. Mentors can leave feedback, students can submit updates, and coaches can validate progress seamlessly.",
  },
  {
    title: "🚀 Getting Started",
    color: "purple-500",
    description:
      "Begin by exploring the current stage your startup is in. Read the instructions carefully, align with your team, and start working on the listed tasks. Communication and timely updates are key to your success.",
  },
]

const colorMap: Record<string, string> = {
  primary: "border-primary dark:border-primary",
  "blue-500": "border-blue-500 dark:border-blue-500",
  "green-500": "border-green-500 dark:border-green-500",
  "yellow-500": "border-yellow-500 dark:border-yellow-500",
  "purple-500": "border-purple-500 dark:border-purple-500",
  "indigo-500": "border-indigo-500 dark:border-indigo-500",
  "cyan-500": "border-cyan-500 dark:border-cyan-500",
  "rose-500": "border-rose-500 dark:border-rose-500",
  "orange-500": "border-orange-500 dark:border-orange-500",
  "pink-500": "border-pink-500 dark:border-pink-500",
}

export default function StagePage() {
  const params = useParams()
  const router = useRouter()
  const startupId = params?.id

  const [startup, setStartup] = useState<Startup | null>(null)
  const [stages, setStages] = useState<Stage[]>([])
  const [currentStage, setCurrentStage] = useState<Stage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch startup and stages data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Get JWT token
        const token = localStorage.getItem("access_token")

        if (!token) {
          setError("Authentication token not found")
          setLoading(false)
          return
        }

        // Fetch startup details
        if (startupId) {
          const startupResponse = await fetch(`http://localhost:8000/startups/${startupId}/`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (!startupResponse.ok) {
            throw new Error(`HTTP error! status: ${startupResponse.status}`)
          }

          const startupData = await startupResponse.json()
          setStartup(startupData)

          // Fetch the startup's current stage if it exists
          if (startupData.stage) {
            const stageResponse = await fetch(`http://localhost:8000/stages/${startupData.stage}/`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            })

            if (stageResponse.ok) {
              const stageData = await stageResponse.json()
              setCurrentStage(stageData)
            }
          }
        }

        // Fetch all stages
        const stagesResponse = await fetch(`http://localhost:8000/stages/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!stagesResponse.ok) {
          throw new Error(`HTTP error! status: ${stagesResponse.status}`)
        }

        const stagesData = await stagesResponse.json()
        setStages(stagesData)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load data. Please try again later.")
        setLoading(false)
      }
    }

    fetchData()
  }, [startupId])

  // Format date string to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <section className="pb-16 pt-24 md:pb-20 md:pt-28 lg:pb-24 lg:pt-32 dark:bg-blacksection">
      
      
      <div className="container mx-auto">
        <div className="-mx-4 flex flex-wrap justify-center">
          {/* Sidebar */}
          <div className="w-full px-4 lg:w-1/4">
            <div className="relative rounded-lg border border-white p-4 shadow-solid-4 transition-all dark:border-strokedark dark:bg-blacksection min-h-[100%]">
              <div className="mb-4 space-y-3">
                {/* Add Stage Button */}
                <Link
                  href="/docs/add-stage"
                  className="flex w-full items-center justify-center rounded-xs bg-stroke px-3 py-2 text-base text-black hover:bg-gray-200 dark:bg-blackho dark:text-white dark:hover:bg-gray-800 transition-all"
                >
                  ➕ Add New Stage
                </Link>
              </div>

              {/* Startup Info (if available) */}
              {startup && (
                <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-semibold text-lg text-primary dark:text-white">Startup Info</h3>
                  <div className="space-y-2 mt-2">
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Name:</span> {startup.name}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Status:</span>
                      <span className="capitalize ml-1">{startup.status}</span>
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Created:</span> {formatDate(startup.created_at)}
                    </p>
                  </div>
                </div>
              )}

              {/* Current Stage */}
              {currentStage && (
                <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h3 className="font-semibold text-lg text-blue-700 dark:text-blue-300">Current Stage</h3>
                  <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-800">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-blue-600 dark:text-blue-400">{currentStage.name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {currentStage.duration_months} {currentStage.duration_months === 1 ? "month" : "months"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Stage {currentStage.sequence_order}
                    </div>
                  </div>
                </div>
              )}



              <ul className="space-y-2">
                <SidebarLink />
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full px-4 lg:w-3/4">
            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Startup Info Header */}
            {startup && !loading && (
              <div className="rounded-2xl border border-muted bg-white dark:bg-blacksection p-6 sm:p-8 shadow-lg space-y-4 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{startup.name}</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                      {currentStage
                        ? `Currently in Stage: ${currentStage.name} (${currentStage.sequence_order})`
                        : "Not assigned to any stage yet"}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                        startup.status === "approved"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : startup.status === "rejected"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}
                    >
                      {startup.status.charAt(0).toUpperCase() + startup.status.slice(1)}
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300">{startup.description || "No description available"}</p>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Created: {formatDate(startup.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Last Updated: {formatDate(startup.updated_at)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Stage Progress Visual (if startup has a stage) */}
            {!loading && startup && stages.length > 0 && (
              <div className="rounded-2xl border border-muted bg-white dark:bg-blacksection p-6 sm:p-8 shadow-lg mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Stage Progress</h2>
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    {stages.map((stage, index) => (
                      <div
                        key={stage.id}
                        className="flex flex-col items-center"
                        style={{ width: `${100 / stages.length}%` }}
                      >
                        <div
                          className={`w-8 h-8 rounded-full ${
                            currentStage && stage.sequence_order <= currentStage.sequence_order
                              ? "bg-primary text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          } flex items-center justify-center font-medium text-sm`}
                        >
                          {stage.sequence_order}
                        </div>
                        <span
                          className={`text-xs mt-1 text-center ${
                            currentStage && stage.id === currentStage.id
                              ? "font-bold text-primary"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {stage.name}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 absolute top-4 -z-10" />
                  <div
                    className="h-1 bg-primary absolute top-4 -z-10"
                    style={{
                      width: currentStage
                        ? `${((currentStage.sequence_order - 1) / (stages.length - 1)) * 100}%`
                        : "0%",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Main Welcome Content */}
            <div className="rounded-2xl border border-muted bg-white dark:bg-blacksection p-6 sm:p-8 shadow-lg space-y-8 transition-all duration-200 hover:shadow-xl">
              <div className="text-center space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-primary bg-clip-text dark:text-white">
                  Welcome to the Incubation Journey
                </h1>
                <p className="text-muted-foreground dark:text-white">
                  This section outlines the purpose of the incubation platform and how it supports students, mentors,
                  and coaches.
                </p>
                <div className="h-1 w-16 mx-auto bg-gradient-to-r from-primary/30 to-primary rounded-full" />
              </div>

              <div className="space-y-8">
                {cardData.map((card, index) => (
                  <div
                    key={index}
                    className={`bg-background border-l-4 ${colorMap[card.color]} p-5 rounded-lg shadow-sm dark:bg-blacksection`}
                  >
                    <h2 className="text-xl font-semibold text-primary dark:text-white">{card.title}</h2>
                    <p className="dark:text-white">{card.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}