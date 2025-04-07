import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RequesterHeader } from "@/components/requester-header"
import { OvertimeRequestForm } from "@/components/overtime-request-form"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Create Overtime Request",
  description: "Form to create overtime request",
}

export default function NewRequest() {
  return (
    <div className="flex min-h-screen flex-col">
      <RequesterHeader />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4 md:mb-6">
          <Button variant="outline" size="sm" asChild className="w-fit">
            <Link href="/requester">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Create Overtime Request</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>LABOR STATEMENT LETTER</CardTitle>
            <CardDescription>PT. HANG TONG MANUFACTORY</CardDescription>
          </CardHeader>
          <CardContent>
            <OvertimeRequestForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

