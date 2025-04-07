"use client"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Clock, XCircle } from "lucide-react"
import Image from "next/image"
import type { OvertimeRequest } from "@/lib/db"

interface RequestDetailProps {
  request: OvertimeRequest
}

export function RequestDetail({ request }: RequestDetailProps) {
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

      <div>
        <h4 className="text-sm font-medium mb-2">Approval Status</h4>
        {request.status === "pending" && (
          <div className="flex items-center gap-2 text-yellow-600">
            <Clock className="h-5 w-5" />
            <span>Waiting for HR approval</span>
          </div>
        )}

        {request.status === "approved" && (
          <div className="space-y-2">
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

            {request.hrSignature && (
              <div>
                <h4 className="text-sm font-medium mb-2">HR Signature</h4>
                <div className="border rounded-md p-2 bg-white inline-block">
                  <Image
                    src={request.hrSignature || "/placeholder.svg"}
                    alt="HR Signature"
                    width={200}
                    height={100}
                    className="max-h-[100px] w-auto"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {request.status === "rejected" && (
          <div className="space-y-2">
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

            {request.hrSignature && (
              <div>
                <h4 className="text-sm font-medium mb-2">HR Signature</h4>
                <div className="border rounded-md p-2 bg-white inline-block">
                  <Image
                    src={request.hrSignature || "/placeholder.svg"}
                    alt="HR Signature"
                    width={200}
                    height={100}
                    className="max-h-[100px] w-auto"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
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

