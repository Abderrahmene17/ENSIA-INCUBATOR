"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import SidebarInfo from "@/components/Docs/SidebareInfo"
import { FiCalendar, FiUsers, FiLayers, FiCheckCircle, FiClock, FiAlertTriangle } from "react-icons/fi"

// Define the Startup interface based on your model
interface Startup {
  id: number
  name: string
  description: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
}

const statusColors = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  rejected: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
}

// Function to get an icon based on status
const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <FiClock className="text-amber-500" />
    case "approved":
      return <FiCheckCircle className="text-emerald-500" />
    case "rejected":
      return <FiAlertTriangle className="text-rose-500" />
    default:
      return <FiLayers className="text-gray-500" />
  }
}

// API base URL configuration
const API_BASE_URL = "http://localhost:8000/" // Change this to your actual API URL

export default function IncubationDashboard() {
  const [startups, setStartups] = useState<Startup[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch startups data from API
  useEffect(() => {
    const fetchStartups = async () => {
      try {
        setLoading(true)
        // Get JWT token from localStorage or wherever you store it
        const token = localStorage.getItem("access_token")

        if (!token) {
          setError("Authentication token not found")
          setLoading(false)
          return
        }

        const response = await fetch(`${API_BASE_URL}/startups/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setStartups(data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching startups:", err)
        setError("Failed to load startups data. Please try again later.")
        setLoading(false)
      }
    }

    fetchStartups()
  }, [])

  // Removed handleUpdateStatus function as it's no longer needed for view-only dashboard

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
    <section className="pb-16 pt-24 md:pb-20 md:pt-28 lg:pb-24 lg:pt-32 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-1/4">
            <div className="sticky top-8 rounded-xl border border-gray-200 p-6 shadow-sm transition-all dark:border-gray-700 dark:bg-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <FiUsers className="text-primary" /> Incubation Navigation
              </h2>
              <ul className="space-y-3">
                <SidebarInfo />
              </ul>

              <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Quick Stats
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Total Startups</span>
                    <span className="font-medium">{startups.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Pending</span>
                    <span className="font-medium text-amber-600 dark:text-amber-400">
                      {startups.filter((s) => s.status === "pending").length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Rejected</span>
                    <span className="font-medium text-rose-600 dark:text-rose-400">
                      {startups.filter((s) => s.status === "rejected").length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full lg:w-3/4 space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Incubation Dashboard</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Monitor and support startups through their incubation journey
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-1 rounded-md ${viewMode === "grid" ? "bg-primary text-white" : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-1 rounded-md ${viewMode === "list" ? "bg-primary text-white" : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}
                  >
                    List
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/50 rounded-xl p-4 shadow-sm border border-blue-100 dark:border-blue-900/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                      <FiUsers className="text-blue-600 dark:text-blue-300 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-300">Total Startups</p>
                      <p className="text-2xl font-bold text-blue-800 dark:text-white">{startups.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-900/50 rounded-xl p-4 shadow-sm border border-emerald-100 dark:border-emerald-900/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                      <FiCheckCircle className="text-emerald-600 dark:text-emerald-300 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-emerald-600 dark:text-emerald-300">Approved</p>
                      <p className="text-2xl font-bold text-emerald-800 dark:text-white">
                        {startups.filter((s) => s.status === "approved").length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-900/50 rounded-xl p-4 shadow-sm border border-purple-100 dark:border-purple-900/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                      <FiCalendar className="text-purple-600 dark:text-purple-300 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-600 dark:text-purple-300">Recently Updated</p>
                      <p className="text-2xl font-bold text-purple-800 dark:text-white">
                        {
                          startups.filter((s) => {
                            const oneWeekAgo = new Date()
                            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
                            return new Date(s.updated_at) >= oneWeekAgo
                          }).length
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Startups Grid */}
            {!loading && !error && viewMode === "grid" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {startups.map((startup) => (
                  <Link key={startup.id} href={`/docs/stages/${startup.id}`}>
                    <div className="group cursor-pointer rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800 hover:border-primary-500 dark:hover:border-primary-400">
                      {/* Placeholder for Startup Icon */}
                      <div className="h-40 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                        <span className="text-4xl">{getStatusIcon(startup.status)}</span>
                      </div>

                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600">
                              {startup.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {startup.id}</p>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[startup.status]}`}
                          >
                            {startup.status.charAt(0).toUpperCase() + startup.status.slice(1)}
                          </span>
                        </div>

                        <div className="mt-4 space-y-3">
                          <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                            {startup.description || "No description available"}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <FiCalendar className="flex-shrink-0" />
                            <span>Created: {formatDate(startup.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <FiClock className="flex-shrink-0" />
                            <span>Updated: {formatDate(startup.updated_at)}</span>
                          </div>

                          {/* Removed Update Status button */}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Startups List */}
            {!loading && !error && viewMode === "list" && (
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Startup
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Created
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Updated
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {startups.map((startup) => (
                      <tr key={startup.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                              {getStatusIcon(startup.status)}
                            </div>
                            <div className="ml-4">
                              <Link href={`/startups/${startup.id}`}>
                                <div className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary">
                                  {startup.name}
                                </div>
                              </Link>
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                {startup.description || "No description available"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[startup.status]}`}
                          >
                            {startup.status.charAt(0).toUpperCase() + startup.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{formatDate(startup.created_at)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{formatDate(startup.updated_at)}</div>
                        </td>
                        {/* Removed Actions column content */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/docs/stages/${startup.id}`}
                            className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Removed Update Status Modal */}
    </section>
  )
}
