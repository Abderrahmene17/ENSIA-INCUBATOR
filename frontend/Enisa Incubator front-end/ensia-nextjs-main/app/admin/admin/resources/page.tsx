"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { ResourceList } from "@/components/dashboard/resource-list"
import { ResourceRequestList } from "@/components/dashboard/resource-request-list"

export default function ResourcesPage() {
  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Resources Management</h1>
              <p className="text-muted-foreground">Manage resources and resource requests for startups</p>
            </div>

            <Tabs defaultValue="resources" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="requests">Requests</TabsTrigger>
              </TabsList>
              <TabsContent value="resources">
                <ResourceList />
              </TabsContent>
              <TabsContent value="requests">
                <ResourceRequestList />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
