"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle } from "lucide-react"
import Image from "next/image"
import { SignaturePad } from "@/components/signature-pad"
import type { OvertimeRequest } from "@/lib/db"
import { approveOvertimeRequest, rejectOvertimeRequest } from "@/lib/actions"
import { Input } from "@/components/ui/input"

interface HrRequestDetailProps {
  request: OvertimeRequest
}

export function HrRequestDetail({ request }: HrRequestDetailProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectionForm, setShowRejectionForm] = useState(false)
  const [hrSignature, setHrSignature] = useState<string | null>(null)
  const [requesterEmail, setRequesterEmail] = useState("")

  const handleApprove = async () => {
    if (!hrSignature) {
      toast({
        title: "Signature required",
        description: "Please add your signature to approve",
        variant: "destructive",
      })
      return
    }

    setIsApproving(true)
    try {
      const formData = new FormData()
      formData.append("id", request.id)
      formData.append("hrSignature", hrSignature)
      formData.append("requesterEmail", requesterEmail)

      const result = await approveOvertimeRequest(formData)

      if (result.success) {
        toast({
          title: "Request approved",
          description: "The overtime request has been successfully approved",
        })

        router.push("/hr/dashboard")
      } else {
        toast({
          title: "Failed to approve request",
          description: result.error || "An error occurred while approving the request",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error approving request:", error)
      toast({
        title: "Failed to approve request",
        description: "An error occurred while approving the request",
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      })
      return
    }

    if (!hrSignature) {
      toast({
        title: "Signature required",
        description: "Please add your signature to reject",
        variant: "destructive",
      })
      return
    }

    setIsRejecting(true)
    try {
      const formData = new FormData()
      formData.append("id", request.id)
      formData.append("rejectionReason", rejectionReason)
      formData.append("hrSignature", hrSignature)
      formData.append("requesterEmail", requesterEmail)

      const result = await rejectOvertimeRequest(formData)

      if (result.success) {
        toast({
          title: "Request rejected",
          description: "The overtime request has been successfully rejected",
        })

        router.push("/hr/dashboard")
      } else {
        toast({
          title: "Failed to reject request",
          description: result.error || "An error occurred while rejecting the request",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error rejecting request:", error)
      toast({
        title: "Failed to reject request",
        description: "An error occurred while rejecting the request",
        variant: "destructive",
      })
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">{request.title}</h3>
          <p className="text-sm text-muted-foreground">Submitted on {request.date}</p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <Separator />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h4 className="text-sm font-medium mb-2">Request Information</h4>
          <dl className="grid grid-cols-[140px_1fr] gap-2 text-sm">
            <dt className="font-medium text-muted-foreground">Department:</dt>
            <dd>{request.department}</dd>
            <dt className="font-medium text-muted-foreground">Overtime Date:</dt>
            <dd>{request.overtimeDate}</dd>
            <dt className="font-medium text-muted-foreground">Day Type:</dt>
            <dd>{request.overtimeType === "workday" ? "Workday" : "Holiday"}</dd>
            <dt className="font-medium text-muted-foreground">Overtime Location:</dt>
            <dd>{request.location}</dd>
            <dt className="font-medium text-muted-foreground">Overtime Type:</dt>
            <dd>{request.overtimeCategory}</dd>
          </dl>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2">Work Description</h4>
          <p className="text-sm">{request.overtimeDescription}</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Employee List</h4>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-1 text-left text-xs font-medium text-muted-foreground">Employee Name</th>
                <th className="py-2 px-1 text-left text-xs font-medium text-muted-foreground">ID Number</th>
                <th className="py-2 px-1 text-left text-xs font-medium text-muted-foreground">Position</th>
                <th className="py-2 px-1 text-left text-xs font-medium text-muted-foreground">Start</th>
                <th className="py-2 px-1 text-left text-xs font-medium text-muted-foreground">End</th>
                <th className="py-2 px-1 text-left text-xs font-medium text-muted-foreground">Overtime Hours</th>
              </tr>
            </thead>
            <tbody>
              {request.employees.map((employee, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2 px-1">{employee.name}</td>
                  <td className="py-2 px-1">{employee.nik}</td>
                  <td className="py-2 px-1">{employee.position}</td>
                  <td className="py-2 px-1">{employee.startTime}</td>
                  <td className="py-2 px-1">{employee.endTime}</td>
                  <td className="py-2 px-1">{employee.overtimeHours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Department Leader Signature</h4>
        <div className="border rounded-md p-2 bg-white inline-block">
          <Image
            src={request.signature || "/placeholder.svg"}
            alt="Department Leader Signature"
            width={200}
            height={100}
            className="max-h-[100px] w-auto"
          />
        </div>
        <p className="text-sm mt-1">Name: {request.signerName}</p>
      </div>

      <Separator />

      {request.status === "pending" && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Notification Email</h4>
          <Input
            placeholder="Requester email for status notification"
            value={requesterEmail}
            onChange={(e) => setRequesterEmail(e.target.value)}
            type="email"
          />
          <p className="text-xs text-muted-foreground">This email will be used to send request status notifications</p>
        </div>
      )}

      {request.status === "pending" ? (
        <div className="space-y-4">
          <h4 className="text-sm font-medium">HR Signature</h4>
          <SignaturePad onChange={setHrSignature} value={hrSignature} />
          <p className="text-xs text-muted-foreground">Add your signature to approve or reject the request</p>

          {showRejectionForm ? (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Rejection Reason</h4>
              <Textarea
                placeholder="Provide rejection reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowRejectionForm(false)} disabled={isRejecting}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleReject} disabled={isRejecting}>
                  {isRejecting ? "Processing..." : "Confirm Rejection"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRejectionForm(true)} disabled={isApproving}>
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button variant="default" onClick={handleApprove} disabled={isApproving}>
                <CheckCircle className="mr-2 h-4 w-4" />
                {isApproving ? "Processing..." : "Approve"}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h4 className="text-sm font-medium mb-2">Approval Status</h4>
          {request.status === "approved" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Request approved</span>
              </div>
              <dl className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                <dt className="font-medium text-muted-foreground">Approved by:</dt>
                <dd>{request.approvedBy}</dd>
                <dt className="font-medium text-muted-foreground">Date:</dt>
                <dd>{request.approvedDate}</dd>
              </dl>

              <div>
                <h4 className="text-sm font-medium mb-2">HR Signature</h4>
                <div className="border rounded-md p-2 bg-white inline-block">
                  <Image
                    src={request.hrSignature || ""}
                    alt="HR Signature"
                    width={200}
                    height={100}
                    className="max-h-[100px] w-auto"
                  />
                </div>
              </div>
            </div>
          )}

          {request.status === "rejected" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                <span>Request rejected</span>
              </div>
              <dl className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                <dt className="font-medium text-muted-foreground">Rejected by:</dt>
                <dd>{request.rejectedBy}</dd>
                <dt className="font-medium text-muted-foreground">Date:</dt>
                <dd>{request.rejectedDate}</dd>
                <dt className="font-medium text-muted-foreground">Reason:</dt>
                <dd>{request.rejectionReason}</dd>
              </dl>

              <div>
                <h4 className="text-sm font-medium mb-2">HR Signature</h4>
                <div className="border rounded-md p-2 bg-white inline-block">
                  <Image
                    src={request.hrSignature || ""}
                    alt="HR Signature"
                    width={200}
                    height={100}
                    className="max-h-[100px] w-auto"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          Pending
        </Badge>
      )
    case "approved":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Approved
        </Badge>
      )
    case "rejected":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          Rejected
        </Badge>
      )
    default:
      return null
  }
}

