"use client"

import { useEffect, useState } from "react"
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import ApplicationTable from "@/components/dashboard/application-table" // Adjust this path if needed

export default function ApplicationsPage() {
  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Applications</h1>
            <ApplicationTable />
          </div>
        </main>
      </div>
    </div>
  )
}