import mysql from "mysql2/promise"

// Type definitions
export type RequestStatus = "pending" | "approved" | "rejected"

export interface Employee {
  id: string
  name: string
  nik: string
  position: string
  startTime: string
  endTime: string
  overtimeHours: string
}

export interface OvertimeRequest {
  id: string
  title: string
  department: string
  date: string
  overtimeDate: string
  overtimeType: "workday" | "holiday"
  location: string
  overtimeCategory: string
  overtimeDescription: string
  signerName: string
  employees: Employee[]
  status: RequestStatus
  signature: string
  hrSignature?: string | null
  approvedBy?: string | null
  approvedDate?: string | null
  rejectedBy?: string | null
  rejectedDate?: string | null
  rejectionReason?: string | null
  createdAt: string
  updatedAt: string
}

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "hr_approval_system",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Create a connection pool
const pool = mysql.createPool(dbConfig)

// Initialize database tables if they don't exist
export const initializeDatabase = async (): Promise<void> => {
  try {
    const connection = await pool.getConnection()

    try {
      // Check if the departments table exists and has data
      const [deptRows] = await connection.query("SELECT COUNT(*) as count FROM departments")
      const deptCount = (deptRows as any[])[0].count

      if (deptCount === 0) {
        // Insert default departments if none exist
        await connection.query(`
          INSERT INTO departments (name) VALUES 
          ('IT'),
          ('HR'),
          ('Finance'),
          ('Marketing'),
          ('Production')
        `)
      }

      console.log("Database tables initialized successfully")
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Error initializing database:", error)
    throw error
  }
}

// Ensure database is initialized
export const ensureDbExists = async (): Promise<void> => {
  try {
    await initializeDatabase()
  } catch (error) {
    console.error("Error ensuring database exists:", error)
    throw error
  }
}

// Helper function to get department ID from name
const getDepartmentId = async (departmentName: string): Promise<number> => {
  try {
    const [rows] = await pool.query("SELECT id FROM departments WHERE name = ?", [departmentName])

    if ((rows as any[]).length === 0) {
      // Default to IT department (id 1) if not found
      return 1
    }

    return (rows as any[])[0].id
  } catch (error) {
    console.error(`Error getting department ID for ${departmentName}:`, error)
    // Default to IT department (id 1) if error
    return 1
  }
}

// Function to get all requests
export const getAllRequests = async (): Promise<OvertimeRequest[]> => {
  try {
    await ensureDbExists()

    const [rows] = await pool.query(`
      SELECT r.*, d.name as department_name 
      FROM overtime_requests r
      JOIN departments d ON r.department_id = d.id
      ORDER BY r.created_at DESC
    `)

    const requests = await Promise.all(
      (rows as any[]).map(async (row) => {
        const employees = await getEmployeesByRequestId(row.id)
        return mapRowToOvertimeRequest(row, employees)
      }),
    )

    return requests
  } catch (error) {
    console.error("Error getting all requests:", error)
    return []
  }
}

// Function to get request by ID
export const getRequestById = async (id: string): Promise<OvertimeRequest | undefined> => {
  try {
    await ensureDbExists()

    const [rows] = await pool.query(
      `
      SELECT r.*, d.name as department_name 
      FROM overtime_requests r
      JOIN departments d ON r.department_id = d.id
      WHERE r.id = ?
    `,
      [id],
    )

    if ((rows as any[]).length === 0) {
      return undefined
    }

    const employees = await getEmployeesByRequestId(id)
    return mapRowToOvertimeRequest((rows as any[])[0], employees)
  } catch (error) {
    console.error(`Error getting request by ID ${id}:`, error)
    return undefined
  }
}

// Function to get requests by status
export const getRequestsByStatus = async (status: RequestStatus): Promise<OvertimeRequest[]> => {
  try {
    await ensureDbExists()

    const [rows] = await pool.query(
      `
      SELECT r.*, d.name as department_name 
      FROM overtime_requests r
      JOIN departments d ON r.department_id = d.id
      WHERE r.status = ? 
      ORDER BY r.created_at DESC
    `,
      [status],
    )

    const requests = await Promise.all(
      (rows as any[]).map(async (row) => {
        const employees = await getEmployeesByRequestId(row.id)
        return mapRowToOvertimeRequest(row, employees)
      }),
    )

    return requests
  } catch (error) {
    console.error(`Error getting requests by status ${status}:`, error)
    return []
  }
}

// Function to create a new request
export const createRequest = async (
  requestData: Omit<OvertimeRequest, "id" | "status" | "createdAt" | "updatedAt">,
): Promise<OvertimeRequest> => {
  try {
    await ensureDbExists()

    // Get the next request ID
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM overtime_requests")
    const count = (rows as any[])[0].count
    const id = `REQ${String(count + 1).padStart(3, "0")}`

    // Get department ID from name
    const departmentId = await getDepartmentId(requestData.department)

    const now = new Date().toISOString()
    const submissionDate = now.split("T")[0]

    // Insert the request
    await pool.query(
      `
      INSERT INTO overtime_requests (
        id, title, department_id, submission_date, overtime_date, overtime_type,
        location, overtime_category, description, signer_name,
        status, signature_path, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        requestData.title,
        departmentId,
        submissionDate,
        requestData.overtimeDate,
        requestData.overtimeType,
        requestData.location,
        requestData.overtimeCategory,
        requestData.overtimeDescription,
        requestData.signerName,
        "pending",
        requestData.signature,
        now,
        now,
      ],
    )

    // Insert employees
    for (const employee of requestData.employees) {
      await pool.query(
        `
        INSERT INTO overtime_employees (
          request_id, name, nik, position, start_time, end_time, overtime_hours
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          id,
          employee.name,
          employee.nik,
          employee.position,
          employee.startTime,
          employee.endTime,
          employee.overtimeHours,
        ],
      )
    }

    // Return the created request
    const newRequest: OvertimeRequest = {
      ...requestData,
      id,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    }

    return newRequest
  } catch (error) {
    console.error("Error creating request:", error)
    throw error
  }
}

// Function to update a request
export const updateRequest = async (id: string, data: Partial<OvertimeRequest>): Promise<OvertimeRequest | null> => {
  try {
    await ensureDbExists()

    // Get the current request
    const currentRequest = await getRequestById(id)
    if (!currentRequest) {
      return null
    }

    // Prepare update fields
    const updateFields: any = {}
    const updateParams: any[] = []

    if (data.title) {
      updateFields.title = "?"
      updateParams.push(data.title)
    }

    if (data.department) {
      const departmentId = await getDepartmentId(data.department)
      updateFields.department_id = "?"
      updateParams.push(departmentId)
    }

    if (data.date) {
      updateFields.submission_date = "?"
      updateParams.push(data.date)
    }

    if (data.overtimeDate) {
      updateFields.overtime_date = "?"
      updateParams.push(data.overtimeDate)
    }

    if (data.overtimeType) {
      updateFields.overtime_type = "?"
      updateParams.push(data.overtimeType)
    }

    if (data.location) {
      updateFields.location = "?"
      updateParams.push(data.location)
    }

    if (data.overtimeCategory) {
      updateFields.overtime_category = "?"
      updateParams.push(data.overtimeCategory)
    }

    if (data.overtimeDescription) {
      updateFields.description = "?"
      updateParams.push(data.overtimeDescription)
    }

    if (data.signerName) {
      updateFields.signer_name = "?"
      updateParams.push(data.signerName)
    }

    if (data.status) {
      updateFields.status = "?"
      updateParams.push(data.status)
    }

    if (data.signature) {
      updateFields.signature_path = "?"
      updateParams.push(data.signature)
    }

    if ("hrSignature" in data) {
      updateFields.hr_signature_path = "?"
      updateParams.push(data.hrSignature)
    }

    if ("approvedBy" in data) {
      updateFields.approved_by = "?"
      updateParams.push(data.approvedBy)
    }

    if ("approvedDate" in data) {
      updateFields.approved_date = "?"
      updateParams.push(data.approvedDate)
    }

    if ("rejectedBy" in data) {
      updateFields.rejected_by = "?"
      updateParams.push(data.rejectedBy)
    }

    if ("rejectedDate" in data) {
      updateFields.rejected_date = "?"
      updateParams.push(data.rejectedDate)
    }

    if ("rejectionReason" in data) {
      updateFields.rejection_reason = "?"
      updateParams.push(data.rejectionReason)
    }

    // If there are no fields to update, return the current request
    if (Object.keys(updateFields).length === 0) {
      return currentRequest
    }

    // Build the update query
    const setClause = Object.entries(updateFields)
      .map(([field, placeholder]) => `${field} = ${placeholder}`)
      .join(", ")

    // Add the ID parameter
    updateParams.push(id)

    // Execute the update query
    await pool.query(
      `
      UPDATE overtime_requests
      SET ${setClause}
      WHERE id = ?
      `,
      updateParams,
    )

    // If employees are provided, update them
    if (data.employees) {
      // Delete existing employees
      await pool.query("DELETE FROM overtime_employees WHERE request_id = ?", [id])

      // Insert new employees
      for (const employee of data.employees) {
        await pool.query(
          `
          INSERT INTO overtime_employees (
            request_id, name, nik, position, start_time, end_time, overtime_hours
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          [
            id,
            employee.name,
            employee.nik,
            employee.position,
            employee.startTime,
            employee.endTime,
            employee.overtimeHours,
          ],
        )
      }
    }

    // Get the updated request
    const updatedRequest = await getRequestById(id)
    return updatedRequest || null
  } catch (error) {
    console.error(`Error updating request ${id}:`, error)
    return null
  }
}

// Function to delete a request
export const deleteRequest = async (id: string): Promise<boolean> => {
  try {
    await ensureDbExists()

    // Delete the request (employees will be deleted via ON DELETE CASCADE)
    const [result] = await pool.query("DELETE FROM overtime_requests WHERE id = ?", [id])

    return (result as any).affectedRows > 0
  } catch (error) {
    console.error(`Error deleting request ${id}:`, error)
    return false
  }
}

// Function to approve a request
export const approveRequest = async (
  id: string,
  hrName: string,
  hrSignature: string,
): Promise<OvertimeRequest | null> => {
  try {
    const now = new Date().toISOString()
    const approvedDate = now.split("T")[0]

    // Update the request with approval information
    await pool.query(
      `
      UPDATE overtime_requests
      SET status = ?, approved_by = ?, approved_date = ?, hr_signature_path = ?, updated_at = ?
      WHERE id = ?
      `,
      ["approved", hrName, approvedDate, hrSignature, now, id],
    )

    // Get the updated request
    return await getRequestById(id)
  } catch (error) {
    console.error(`Error approving request ${id}:`, error)
    return null
  }
}

// Function to reject a request
export const rejectRequest = async (
  id: string,
  hrName: string,
  rejectionReason: string,
  hrSignature: string,
): Promise<OvertimeRequest | null> => {
  try {
    const now = new Date().toISOString()
    const rejectedDate = now.split("T")[0]

    // Update the request with rejection information
    await pool.query(
      `
      UPDATE overtime_requests
      SET status = ?, rejected_by = ?, rejected_date = ?, rejection_reason = ?, hr_signature_path = ?, updated_at = ?
      WHERE id = ?
      `,
      ["rejected", hrName, rejectedDate, rejectionReason, hrSignature, now, id],
    )

    // Get the updated request
    return await getRequestById(id)
  } catch (error) {
    console.error(`Error rejecting request ${id}:`, error)
    return null
  }
}

// Helper function to get employees by request ID
const getEmployeesByRequestId = async (requestId: string): Promise<Employee[]> => {
  try {
    const [rows] = await pool.query("SELECT * FROM overtime_employees WHERE request_id = ?", [requestId])

    return (rows as any[]).map((row) => ({
      id: row.id.toString(),
      name: row.name,
      nik: row.nik,
      position: row.position,
      startTime: row.start_time,
      endTime: row.end_time,
      overtimeHours: row.overtime_hours || "",
    }))
  } catch (error) {
    console.error(`Error getting employees for request ${requestId}:`, error)
    return []
  }
}

// Helper function to map database row to OvertimeRequest object
const mapRowToOvertimeRequest = (row: any, employees: Employee[]): OvertimeRequest => {
  return {
    id: row.id,
    title: row.title,
    department: row.department_name, // Use the joined department name
    date: formatDate(row.submission_date),
    overtimeDate: formatDate(row.overtime_date),
    overtimeType: row.overtime_type as "workday" | "holiday",
    location: row.location,
    overtimeCategory: row.overtime_category,
    overtimeDescription: row.description,
    signerName: row.signer_name,
    employees,
    status: row.status as RequestStatus,
    signature: row.signature_path,
    hrSignature: row.hr_signature_path,
    approvedBy: row.approved_by,
    approvedDate: row.approved_date ? formatDate(row.approved_date) : null,
    rejectedBy: row.rejected_by,
    rejectedDate: row.rejected_date ? formatDate(row.rejected_date) : null,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }
}

// Helper function to format date to YYYY-MM-DD
const formatDate = (date: Date | string): string => {
  if (!date) return ""

  const d = typeof date === "string" ? new Date(date) : date
  return d.toISOString().split("T")[0]
}

