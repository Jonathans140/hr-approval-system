import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">PT. HANG TONG MANUFACTORY</h1>
          <p className="text-slate-500 mt-2">Online Approval System</p>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Dashboard</CardTitle>
              <CardDescription>Please select a dashboard according to your role</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Button asChild className="w-full" size="lg">
                <Link href="/requester">Requester Dashboard</Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="lg">
                <Link href="/hr/login">HR Dashboard</Link>
              </Button>
            </CardContent>
            <CardFooter className="text-xs text-center text-muted-foreground">
              This system is used for online form submission and approval
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

