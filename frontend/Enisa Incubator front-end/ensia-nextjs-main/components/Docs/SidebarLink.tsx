"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Stage {
  id: number
  name: string
  sequence_order: number
  duration_months: number
}

export default function SidebarLink() {
  const router = useRouter()
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStages = async () => {
      try {
        const token = localStorage.getItem("access_token")
        const response = await fetch("http://localhost:8000/stages/", {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          // Sort stages by sequence_order
          data.sort((a: Stage, b: Stage) => a.sequence_order - b.sequence_order)
          setStages(data)
        }
      } catch (error) {
        console.error("Error fetching stages:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStages()
  }, [])

  return (
    <>
      

      {/* Stages Section */}
      <li className="mt-4">
        <div className="px-3 py-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Incubation Stages
        </div>
        <div className="mt-1 space-y-1">
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">Loading stages...</div>
          ) : stages.length > 0 ? (
            <>
              {stages.map((stage) => (
                <Link
                  key={stage.id}
                  href={`/docs/stages/${stage.id}/edit`}
                  className="block pl-6 pr-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  {stage.sequence_order}. {stage.name}
                </Link>
              ))}
              
            </>
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              No stages found
              <Link href="/docs/add-stage" className="block mt-1 text-primary hover:underline">
                + Add New Stage
              </Link>
            </div>
          )}
        </div>
      </li>
    </>
  )
}