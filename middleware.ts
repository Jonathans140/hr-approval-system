import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Mendapatkan path saat ini
  const path = request.nextUrl.pathname

  // Memeriksa apakah path dimulai dengan /hr/dashboard
  if (path.startsWith("/hr/dashboard")) {
    // Memeriksa apakah HR sudah login
    const isAuthenticated = request.cookies.get("hr_authenticated")?.value === "true"

    // Jika belum login, redirect ke halaman login HR
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/hr/login", request.url))
    }
  }

  return NextResponse.next()
}

// Konfigurasi path yang akan diproses oleh middleware
export const config = {
  matcher: ["/hr/dashboard/:path*"],
}

