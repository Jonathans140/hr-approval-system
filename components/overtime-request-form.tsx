"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { SignaturePad } from "@/components/signature-pad"
import { Trash2 } from "lucide-react"
import { format } from "date-fns"
import { Textarea } from "@/components/ui/textarea"
import { createOvertimeRequest } from "@/lib/actions"

interface Employee {
  id: string
  name: string
  nik: string
  position: string
  startTime: string
  endTime: string
  overtimeHours: string
}

export function OvertimeRequestForm() {
  const router = useRouter()
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [signature, setSignature] = useState<string | null>(null)
  const [location, setLocation] = useState("")
  const [overtimeType, setOvertimeType] = useState("workday")
  const [overtimeCategory, setOvertimeCategory] = useState("")
  const [overtimeDescription, setOvertimeDescription] = useState("")
  const [signerName, setSignerName] = useState("")
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "1",
      name: "",
      nik: "",
      position: "",
      startTime: "",
      endTime: "",
      overtimeHours: "",
    },
  ])
  const [requesterEmail, setRequesterEmail] = useState("")

  const addEmployee = () => {
    setEmployees([
      ...employees,
      {
        id: Date.now().toString(),
        name: "",
        nik: "",
        position: "",
        startTime: "",
        endTime: "",
        overtimeHours: "",
      },
    ])
  }

  const removeEmployee = (id: string) => {
    if (employees.length === 1) {
      toast({
        title: "Cannot delete",
        description: "There must be at least one employee",
        variant: "destructive",
      })
      return
    }
    setEmployees(employees.filter((emp) => emp.id !== id))
  }

  const updateEmployee = (id: string, field: keyof Employee, value: string) => {
    setEmployees(
      employees.map((emp) => {
        if (emp.id === id) {
          return { ...emp, [field]: value }
        }
        return emp
      }),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate data
    const emptyFields =
      employees.some((emp) => !emp.name || !emp.nik || !emp.position || !emp.startTime || !emp.endTime) ||
      !location ||
      !overtimeCategory ||
      !overtimeDescription ||
      !signerName

    if (emptyFields) {
      toast({
        title: "Incomplete data",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (!signature) {
      toast({
        title: "Signature required",
        description: "Please add your signature to the form",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Get data from form
      const formData = new FormData(formRef.current!)

      // Add data not in form elements
      formData.append("signature", signature)
      formData.append("overtimeType", overtimeType)
      formData.append("employees", JSON.stringify(employees))
      formData.append("requesterEmail", requesterEmail)

      // Send data to server action
      const result = await createOvertimeRequest(formData)

      if (result.success) {
        toast({
          title: "Request created successfully",
          description: "Your overtime request has been submitted and is awaiting approval",
        })

        router.push("/requester")
      } else {
        toast({
          title: "Failed to create request",
          description: result.error || "An error occurred while creating the request",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Failed to create request",
        description: "An error occurred while creating the request",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">SPL Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={format(new Date(), "yyyy-MM-dd")}
              className="w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select name="department" required>
              <SelectTrigger id="department">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="it">IT</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="production">Production</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="overtimeDate">Overtime Work Date</Label>
          <Input id="overtimeDate" name="overtimeDate" type="date" className="w-full" required />
        </div>

        <div className="space-y-2">
          <Label>Day Type</Label>
          <RadioGroup
            defaultValue="workday"
            className="flex space-x-4"
            onValueChange={setOvertimeType}
            value={overtimeType}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="workday" id="workday" />
              <Label htmlFor="workday" className="cursor-pointer">
                Workday
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="holiday" id="holiday" />
              <Label htmlFor="holiday" className="cursor-pointer">
                Holiday
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Overtime Location</Label>
          <Input
            id="location"
            name="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter overtime location"
            className="w-full"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="overtimeCategory">Overtime Type</Label>
          <Select name="overtimeCategory" required value={overtimeCategory} onValueChange={setOvertimeCategory}>
            <SelectTrigger id="overtimeCategory">
              <SelectValue placeholder="Select overtime type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="project">Project</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="overtimeDescription">Overtime Work Description</Label>
          <Textarea
            id="overtimeDescription"
            name="overtimeDescription"
            value={overtimeDescription}
            onChange={(e) => setOvertimeDescription(e.target.value)}
            placeholder="Explain the details of overtime work"
            className="min-h-[80px]"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Employee List</Label>
            <Button type="button" variant="outline" size="sm" onClick={addEmployee}>
              Add Employee
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-1 text-left text-xs font-medium text-muted-foreground w-[25%]">
                    Employee Name
                  </th>
                  <th className="py-2 px-1 text-left text-xs font-medium text-muted-foreground w-[15%]">ID Number</th>
                  <th className="py-2 px-1 text-left text-xs font-medium text-muted-foreground w-[15%]">Position</th>
                  <th className="py-2 px-1 text-left text-xs font-medium text-muted-foreground w-[15%]">Start</th>
                  <th className="py-2 px-1 text-left text-xs font-medium text-muted-foreground w-[15%]">End</th>
                  <th className="py-2 px-1 text-left text-xs font-medium text-muted-foreground w-[10%]">
                    Overtime Hours
                  </th>
                  <th className="py-2 px-1 text-left text-xs font-medium text-muted-foreground w-[5%]"></th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id} className="border-b">
                    <td className="py-2 px-1">
                      <Input
                        value={employee.name}
                        onChange={(e) => updateEmployee(employee.id, "name", e.target.value)}
                        placeholder="Employee name"
                        className="w-full"
                        required
                      />
                    </td>
                    <td className="py-2 px-1">
                      <Input
                        value={employee.nik}
                        onChange={(e) => updateEmployee(employee.id, "nik", e.target.value)}
                        placeholder="ID Number"
                        className="w-full"
                        required
                      />
                    </td>
                    <td className="py-2 px-1">
                      <Input
                        value={employee.position}
                        onChange={(e) => updateEmployee(employee.id, "position", e.target.value)}
                        placeholder="Position"
                        className="w-full"
                        required
                      />
                    </td>
                    <td className="py-2 px-1">
                      <Input
                        type="time"
                        value={employee.startTime}
                        onChange={(e) => updateEmployee(employee.id, "startTime", e.target.value)}
                        className="w-full"
                        required
                      />
                    </td>
                    <td className="py-2 px-1">
                      <Input
                        type="time"
                        value={employee.endTime}
                        onChange={(e) => updateEmployee(employee.id, "endTime", e.target.value)}
                        className="w-full"
                        required
                      />
                    </td>
                    <td className="py-2 px-1">
                      <Input
                        value={employee.overtimeHours}
                        onChange={(e) => updateEmployee(employee.id, "overtimeHours", e.target.value)}
                        placeholder="Hours"
                        className="w-full"
                      />
                    </td>
                    <td className="py-2 px-1">
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeEmployee(employee.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="requesterEmail">Requester Email</Label>
          <Input
            id="requesterEmail"
            name="requesterEmail"
            type="email"
            value={requesterEmail}
            onChange={(e) => setRequesterEmail(e.target.value)}
            placeholder="Enter email for notifications"
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">This email will be used to send request status notifications</p>
        </div>

        <div className="space-y-2 pt-4">
          <Label htmlFor="signature">Department Leader Signature</Label>
          <SignaturePad onChange={setSignature} value={signature} />
          <div className="mt-2">
            <Label htmlFor="signerName">Leader Name</Label>
            <Input
              id="signerName"
              name="signerName"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Enter leader name"
              className="w-full mt-1"
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">Create signature with mouse or touch screen</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </Button>
      </div>
    </form>
  )
}

