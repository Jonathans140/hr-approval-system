import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HrLoginForm } from "@/components/hr-login-form"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "HR Login",
  description: "Login for HR dashboard access",
}

export default function HrLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full px-4">
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">PT. HANG TONG MANUFACTORY</h1>
          <p className="text-slate-500 mt-2">HR Dashboard Login</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>HR Login</CardTitle>
            <CardDescription>Enter password to access HR dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <HrLoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

