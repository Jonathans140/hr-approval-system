import nodemailer from "nodemailer"
import type { OvertimeRequest } from "./db"

// Email transporter configuration
// In production, use environment variables for credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "your-email@gmail.com",
    pass: process.env.SMTP_PASSWORD || "your-password",
  },
})

// HR email to receive notifications
const HR_EMAIL = process.env.HR_EMAIL || "hr@hangtong.com"

// Format date for better display
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Function to send notification email to HR
export async function sendNewRequestNotification(request: OvertimeRequest): Promise<boolean> {
  try {
    console.log("Attempting to send email notification to HR:", HR_EMAIL)
    console.log("Using SMTP config:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER ? "CONFIGURED" : "NOT CONFIGURED",
        pass: process.env.SMTP_PASSWORD ? "CONFIGURED" : "NOT CONFIGURED",
      },
    })

    // Create employee rows for email
    const employeeRows = request.employees
      .map(
        (emp) => `
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px;">${emp.name}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${emp.nik}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${emp.position}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${emp.startTime} - ${emp.endTime}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${emp.overtimeHours || "-"}</td>
    </tr>
  `,
      )
      .join("")

    // Create email content
    const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Overtime Request</h2>
      <p>A new overtime request has been created and requires your review.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3 style="margin-top: 0; color: #555;">Request Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px 0; width: 150px;"><strong>Request ID:</strong></td>
            <td style="padding: 5px 0;">${request.id}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Department:</strong></td>
            <td style="padding: 5px 0;">${request.department}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Submission Date:</strong></td>
            <td style="padding: 5px 0;">${formatDate(request.date)}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Overtime Date:</strong></td>
            <td style="padding: 5px 0;">${formatDate(request.overtimeDate)}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Day Type:</strong></td>
            <td style="padding: 5px 0;">${request.overtimeType === "workday" ? "Workday" : "Holiday"}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Location:</strong></td>
            <td style="padding: 5px 0;">${request.location}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Overtime Type:</strong></td>
            <td style="padding: 5px 0;">${request.overtimeCategory}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Leader:</strong></td>
            <td style="padding: 5px 0;">${request.signerName}</td>
          </tr>
        </table>
      </div>
      
      <div style="margin: 20px 0;">
        <h3 style="color: #555;">Work Description</h3>
        <p style="background-color: #f9f9f9; padding: 10px; border-radius: 5px;">${request.overtimeDescription}</p>
      </div>
      
      <div style="margin: 20px 0;">
        <h3 style="color: #555;">Employee List</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Name</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">ID Number</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Position</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Time</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Overtime Hours</th>
            </tr>
          </thead>
          <tbody>
            ${employeeRows}
          </tbody>
        </table>
      </div>
      
      <div style="margin: 25px 0; text-align: center;">
        <a href="${process.env.APP_URL || "http://localhost:3000"}/hr/dashboard/${request.id}" 
           style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Review Request
        </a>
      </div>
      
      <p style="color: #777; font-size: 12px; margin-top: 30px; text-align: center;">
        This email was automatically sent by the HR Approval System of PT. HANG TONG MANUFACTORY.
      </p>
    </div>
  `

    // Send email
    console.log("Sending email to:", HR_EMAIL)
    const info = await transporter.sendMail({
      from: `"HR System" <${process.env.SMTP_USER || "noreply@hangtong.com"}>`,
      to: HR_EMAIL,
      subject: `[URGENT] New Overtime Request #${request.id}`,
      html: emailContent,
    })

    console.log("Email sent successfully:", info.messageId)
    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}

// Function to send status update notification to requester
export async function sendStatusUpdateNotification(request: OvertimeRequest, requesterEmail: string): Promise<boolean> {
  try {
    const status = request.status === "approved" ? "approved" : "rejected"
    const statusColor = request.status === "approved" ? "#4CAF50" : "#F44336"

    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Overtime Request Status Update</h2>
        <p>Your overtime request with ID <strong>${request.id}</strong> has been <strong style="color: ${statusColor};">${status}</strong>.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3 style="margin-top: 0; color: #555;">Request Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 5px 0; width: 150px;"><strong>Submission Date:</strong></td>
              <td style="padding: 5px 0;">${formatDate(request.date)}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Overtime Date:</strong></td>
              <td style="padding: 5px 0;">${formatDate(request.overtimeDate)}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Status:</strong></td>
              <td style="padding: 5px 0;"><span style="color: ${statusColor}; font-weight: bold;">${status.toUpperCase()}</span></td>
            </tr>
            ${
              request.status === "approved"
                ? `
            <tr>
              <td style="padding: 5px 0;"><strong>Approved by:</strong></td>
              <td style="padding: 5px 0;">${request.approvedBy}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Approval Date:</strong></td>
              <td style="padding: 5px 0;">${formatDate(request.approvedDate || "")}</td>
            </tr>
            `
                : `
            <tr>
              <td style="padding: 5px 0;"><strong>Rejected by:</strong></td>
              <td style="padding: 5px 0;">${request.rejectedBy}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Rejection Date:</strong></td>
              <td style="padding: 5px 0;">${formatDate(request.rejectedDate || "")}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Rejection Reason:</strong></td>
              <td style="padding: 5px 0;">${request.rejectionReason}</td>
            </tr>
            `
            }
          </table>
        </div>
        
        <div style="margin: 25px 0; text-align: center;">
          <a href="${process.env.APP_URL || "http://localhost:3000"}/requester/${request.id}" 
             style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            View Details
          </a>
        </div>
        
        <p style="color: #777; font-size: 12px; margin-top: 30px; text-align: center;">
          This email was automatically sent by the HR Approval System of PT. HANG TONG MANUFACTORY.
        </p>
      </div>
    `

    // Send email
    const info = await transporter.sendMail({
      from: `"HR System" <${process.env.SMTP_USER || "noreply@hangtong.com"}>`,
      to: requesterEmail,
      subject: `Overtime Request #${request.id} Status - ${status.toUpperCase()}`,
      html: emailContent,
    })

    console.log("Email sent: %s", info.messageId)
    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}

