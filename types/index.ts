// User roles
export type UserRole = "patient" | "doctor" | "secretary" | "admin"

// Basic user structure
export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  password: string
  role: UserRole
  phoneNumber: string
  specialty?: string // For doctors
}

// Patient structure
export interface Patient {
  id: number
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  bloodType?: string
  height?: string
  weight?: string
  allergies: string[]
  chronicConditions: string[]
  doctorId?: number
}

// Appointment structure
export interface Appointment {
  id: string
  doctor: string
  doctorId: number
  specialty: string
  date: string
  time: string
  type: string
  location: string
  mode: "in-person" | "virtual"
  notes?: string
  status: "scheduled" | "completed" | "cancelled"
  patientId: number
}

// Medication structure
export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  startDate: string
  endDate: string
  withFood: boolean
  notes: string
  status: "active" | "completed"
  adherence: number
  patientId: number
}

// Medical record structure
export interface MedicalRecord {
  id: string
  type: string
  date: string
  doctor: string
  doctorId: number
  specialty: string
  diagnosis: string
  notes: string
  documentUrl?: string
  patientId: number
}

// Blood donation structure
export interface BloodDonation {
  id: string
  date: string
  location: string
  bloodType: string
  status: "scheduled" | "completed" | "cancelled"
  donorId: number
}

// Blood request structure
export interface BloodRequest {
  id: string
  bloodType: string
  hospital: string
  urgency: "high" | "medium" | "low"
  date: string
  quantity: string
  patientType: string
  reason: string
  status: "active" | "fulfilled" | "cancelled"
  contactPerson: string
  contactPhone: string
  requesterId: number
}

// Document structure
export interface Document {
  id: string
  name: string
  type: "prescription" | "medical_test" | "invoice" | "report" | "other"
  date: string
  fileType: string
  fileSize: string
  url: string
  uploaderId: number
  ownerId: number
  isPrivate: boolean
}

// Document access structure
export interface DocumentAccess {
  id: string
  documentId: string
  userId: number
  grantedBy: number
  grantedAt: string
  expiresAt?: string
  status: "pending" | "approved" | "denied" | "revoked"
}

// Notification structure
export interface Notification {
  id: string
  userId: number
  title: string
  message: string
  date: string
  isRead: boolean
  type: "appointment" | "medication" | "document" | "blood_donation" | "other"
  relatedId?: string
}
