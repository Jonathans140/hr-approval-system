"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { createRequest, approveRequest, rejectRequest, type Employee } from "@/lib/db"
import { sendNewRequestNotification, sendStatusUpdateNotification } from "@/lib/email"

// Constant for HR name (in a real application, this would be retrieved from the authentication system)
const HR_NAME = "Meliana"

// Function to create a new overtime request
export async function createOvertimeRequest(formData: FormData) {
  try {
    // Extract data from formData
    const department = formData.get("department") as string
    const overtimeDate = formData.get("overtimeDate") as string
    const overtimeType = formData.get("overtimeType") as "workday" | "holiday"
    const location = formData.get("location") as string
    const overtimeCategory = formData.get("overtimeCategory") as string
    const overtimeDescription = formData.get("overtimeDescription") as string
    const signerName = formData.get("signerName") as string
    const signature = formData.get("signature") as string
    const requesterEmail = (formData.get("requesterEmail") as string) || ""

    console.log("Creating new overtime request with data:", {
      department,
      overtimeDate,
      overtimeType,
      location,
      overtimeCategory,
      signerName,
      requesterEmail: requesterEmail || "Not provided",
    })

    // Extract employee data
    const employeeData = JSON.parse(formData.get("employees") as string) as Employee[]

    // Create new request
    const newRequest = await createRequest({
      title: "Overtime Request",
      department,
      date: new Date().toISOString().split("T")[0],
      overtimeDate,
      overtimeType,
      location,
      overtimeCategory,
      overtimeDescription,
      signerName,
      employees: employeeData,
      signature,
    })

    console.log("Request created successfully with ID:", newRequest.id)

    // Send email notification to HR
    try {
      console.log("Attempting to send email notification...")
      const emailResult = await sendNewRequestNotification(newRequest)
      console.log("Email notification result:", emailResult ? "Success" : "Failed")
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError)
      // Continue the process even if email fails
    }

    // Revalidate path to update UI
    revalidatePath("/requester")

    return { success: true, data: newRequest }
  } catch (error) {
    console.error("Error creating request:", error)
    return { success: false, error: "Failed to create request" }
  }
}

// Function to approve a request
export async function approveOvertimeRequest(formData: FormData) {
  try {
    const id = formData.get("id") as string
    const hrSignature = formData.get("hrSignature") as string
    const requesterEmail = (formData.get("requesterEmail") as string) || ""

    if (!id || !hrSignature) {
      return { success: false, error: "Incomplete data" }
    }

    const result = await approveRequest(id, HR_NAME, hrSignature)

    if (!result) {
      return { success: false, error: "Request not found" }
    }

    // Send email notification to requester if email is available
    if (requesterEmail) {
      try {
        await sendStatusUpdateNotification(result, requesterEmail)
      } catch (emailError) {
        console.error("Failed to send status update email:", emailError)
        // Continue the process even if email fails
      }
    }

    // Revalidate paths to update UI on both sides
    revalidatePath("/hr/dashboard")
    revalidatePath(`/hr/dashboard/${id}`)
    revalidatePath("/requester")
    revalidatePath(`/requester/${id}`)

    return { success: true, data: result }
  } catch (error) {
    console.error("Error approving request:", error)
    return { success: false, error: "Failed to approve request" }
  }
}

// Function to reject a request
export async function rejectOvertimeRequest(formData: FormData) {
  try {
    const id = formData.get("id") as string
    const rejectionReason = formData.get("rejectionReason") as string
    const hrSignature = formData.get("hrSignature") as string
    const requesterEmail = (formData.get("requesterEmail") as string) || ""

    if (!id || !rejectionReason || !hrSignature) {
      return { success: false, error: "Incomplete data" }
    }

    const result = await rejectRequest(id, HR_NAME, rejectionReason, hrSignature)

    if (!result) {
      return { success: false, error: "Request not found" }
    }

    // Send email notification to requester if email is available
    if (requesterEmail) {
      try {
        await sendStatusUpdateNotification(result, requesterEmail)
      } catch (emailError) {
        console.error("Failed to send status update email:", emailError)
        // Continue the process even if email fails
      }
    }

    // Revalidate paths to update UI on both sides
    revalidatePath("/hr/dashboard")
    revalidatePath(`/hr/dashboard/${id}`)
    revalidatePath("/requester")
    revalidatePath(`/requester/${id}`)

    return { success: true, data: result }
  } catch (error) {
    console.error("Error rejecting request:", error)
    return { success: false, error: "Failed to reject request" }
  }
}

// Function for HR login (simple, for demo only)
export async function loginHR(formData: FormData) {
  const password = formData.get("password") as string

  // Simple password for demo
  if (password === "hr123") {
    // Set cookie to indicate HR is logged in
    const cookieStore = await cookies()
    cookieStore.set("hr_authenticated", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    })

    return { success: true }
  }

  return { success: false, error: "Incorrect password" }
}

// Function for HR logout
export async function logoutHR() {
  const cookieStore = await cookies()
  cookieStore.delete("hr_authenticated")
  return { success: true }
}

// Function to check if HR is logged in
export async function isHRAuthenticated() {
  const cookieStore = await cookies()
  const authenticated = cookieStore.get("hr_authenticated")?.value === "true"
  return authenticated
}

