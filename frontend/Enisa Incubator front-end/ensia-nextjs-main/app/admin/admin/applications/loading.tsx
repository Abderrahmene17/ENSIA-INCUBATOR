import { Skeleton } from "@/components/ui/skeleton"
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard/dashboard-header"

export default function ApplicationDetailLoading() {
  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <div className="mb-6 flex items-center">
              <Skeleton className="h-10 w-20 mr-4" />
              <Skeleton className="h-8 w-1/3" />
            </div>

            <div className="mb-6 flex justify-end">
              <Skeleton className="h-10 w-24 mr-2" />
              <Skeleton className="h-10 w-24" />
            </div>

            <div className="mb-4">
              <Skeleton className="h-10 w-96" />
            </div>

            <Skeleton className="h-[500px] w-full" />
          </div>
        </main>
      </div>
    </div>
  )
}
