"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { FileText, LogOut, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { logoutHR } from "@/lib/actions"

export function HrHeader() {
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      await logoutHR()
      router.push("/")
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Unable to process logout request",
        variant: "destructive",
      })
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <FileText className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">PT. HANG TONG</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/hr/dashboard" className="transition-colors hover:text-foreground/80 text-foreground">
              Dashboard
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Button variant="outline" size="sm" className="ml-auto hidden h-8 md:flex">
              <ShieldCheck className="mr-2 h-4 w-4" />
              HR Admin
            </Button>
          </div>
          <nav className="flex items-center">
            <ModeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} className="ml-2">
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}

