"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import SidebarLink from "@/components/Docs/SidebarLink"

interface Stage {
  id: number
  name: string
  sequence_order: number
  duration_months: number
}

export default function StagesPage() {
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStages = async () => {
      try {
        setLoading(true)
        // Get JWT token from localStorage
        const token = localStorage.getItem("access_token")

        const response = await fetch("http://localhost:8000/stages/", {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setStages(data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching stages:", err)
        setError("Failed to load stages. Please try again later.")
        setLoading(false)
      }
    }

    fetchStages()
  }, [])

  return (
    <section className="pb-16 pt-24 md:pb-20 md:pt-28 lg:pb-24 lg:pt-32 dark:bg-blacksection">
      <div className="container mx-auto">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4 lg:w-1/4">
            <div className="sticky top-[74px] rounded-lg border border-white p-4 shadow-solid-4 transition-all dark:border-strokedark dark:bg-blacksection">
              <ul className="space-y-2">
                <SidebarLink />
              </ul>
            </div>
          </div>

          <div className="w-full px-4 lg:w-3/4">
            <div className="blog-details blog-details-docs shadow-three dark:bg-gray-dark rounded-xs bg-white px-8 py-11 sm:p-[55px] lg:mb-5 lg:px-8 xl:p-[55px]">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Incubation Stages</h1>
                <Link
                  href="/docs/add-stage"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                >
                  Add New Stage
                </Link>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              ) : stages.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No stages found.</p>
                  <Link
                    href="/docs/add-stage"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                  >
                    Create Your First Stage
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Below are all the stages in the incubation process. Startups progress through these stages
                    sequentially.
                  </p>

                  <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Order
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Stage Name
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Duration
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                        {stages
                          .sort((a, b) => a.sequence_order - b.sequence_order)
                          .map((stage) => (
                            <tr key={stage.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {stage.sequence_order}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">{stage.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {stage.duration_months} {stage.duration_months === 1 ? "month" : "months"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <Link
                                  href={`/docs/stages/${stage.id}/edit`}
                                  className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 mr-4"
                                >
                                  Edit
                                </Link>
                                <button
                                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to delete the stage "${stage.name}"?`)) {
                                      // Delete functionality would go here
                                      alert("Delete functionality not implemented yet")
                                    }
                                  }}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
