import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function GET() {
  try {
    // Email transporter configuration
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "your-email@gmail.com",
        pass: process.env.SMTP_PASSWORD || "your-password",
      },
    })

    // Log configuration (don't show password in production)
    console.log("SMTP Config:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER ? "CONFIGURED" : "NOT CONFIGURED",
        pass: process.env.SMTP_PASSWORD ? "CONFIGURED" : "NOT CONFIGURED",
      },
    })

    // Send test email
    const info = await transporter.sendMail({
      from: `"Test Email" <${process.env.SMTP_USER}>`,
      to: process.env.HR_EMAIL || "hrteam.hangtong@gmail.com",
      subject: "Test Email from HR Approval System",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Test Email</h2>
          <p>This is a test email from the HR Approval System.</p>
          <p>If you receive this email, the SMTP configuration is working properly.</p>
          <p>Sent at: ${new Date().toLocaleString()}</p>
        </div>
      `,
    })

    console.log("Test email sent:", info.messageId)

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      details: {
        messageId: info.messageId,
        time: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error sending test email:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send test email",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

