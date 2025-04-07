import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RequesterHeader } from "@/components/requester-header"
import { RequestTable } from "@/components/request-table"
import { PlusCircle } from "lucide-react"
import { getAllRequests, getRequestsByStatus } from "@/lib/db"

export const metadata: Metadata = {
  title: "Requester Dashboard",
  description: "Dashboard for submitting and viewing approval status",
}

export const dynamic = "force-dynamic"

export default async function RequesterDashboard() {
  // Get data from database
  const allRequests = await getAllRequests()
  const pendingRequests = await getRequestsByStatus("pending")
  const approvedRequests = await getRequestsByStatus("approved")
  const rejectedRequests = await getRequestsByStatus("rejected")

  return (
    <div className="flex min-h-screen flex-col">
      <RequesterHeader />
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Requester Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Button asChild>
              <Link href="/requester/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Request
              </Link>
            </Button>
          </div>
        </div>
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <RequestTable requests={allRequests} />
          </TabsContent>
          <TabsContent value="pending" className="space-y-4">
            <RequestTable requests={pendingRequests} />
          </TabsContent>
          <TabsContent value="approved" className="space-y-4">
            <RequestTable requests={approvedRequests} />
          </TabsContent>
          <TabsContent value="rejected" className="space-y-4">
            <RequestTable requests={rejectedRequests} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

