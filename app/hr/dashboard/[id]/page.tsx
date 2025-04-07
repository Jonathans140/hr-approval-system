import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HrHeader } from "@/components/hr-header"
import { HrRequestDetail } from "@/components/hr-request-detail"
import { ArrowLeft } from "lucide-react"
import { getRequestById } from "@/lib/db"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Request Details",
  description: "Review and approve request",
}

export const dynamic = "force-dynamic"

export default async function HrRequestDetailPage({ params }: { params: { id: string } }) {
  // Await params before using it
  const resolvedParams = await params
  const requestId = resolvedParams.id

  const request = await getRequestById(requestId)

  if (!request) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <HrHeader />
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center space-x-2 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/hr/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Review Request #{requestId}</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
            <CardDescription>Review and make a decision for this request</CardDescription>
          </CardHeader>
          <CardContent>
            <HrRequestDetail request={request} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

