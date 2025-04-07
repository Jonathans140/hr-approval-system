import type { Metadata } from "next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HrHeader } from "@/components/hr-header"
import { HrRequestTable } from "@/components/hr-request-table"
import { getAllRequests, getRequestsByStatus } from "@/lib/db"

export const metadata: Metadata = {
  title: "HR Dashboard",
  description: "Dashboard for request approval",
}

export const dynamic = "force-dynamic"

export default async function HrDashboard() {
  // Get data from database
  const allRequests = await getAllRequests()
  const pendingRequests = await getRequestsByStatus("pending")
  const approvedRequests = await getRequestsByStatus("approved")
  const rejectedRequests = await getRequestsByStatus("rejected")

  return (
    <div className="flex min-h-screen flex-col">
      <HrHeader />
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">HR Dashboard</h2>
        </div>
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending Approval</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="space-y-4">
            <HrRequestTable requests={pendingRequests} />
          </TabsContent>
          <TabsContent value="approved" className="space-y-4">
            <HrRequestTable requests={approvedRequests} />
          </TabsContent>
          <TabsContent value="rejected" className="space-y-4">
            <HrRequestTable requests={rejectedRequests} />
          </TabsContent>
          <TabsContent value="all" className="space-y-4">
            <HrRequestTable requests={allRequests} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

