import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

// Users table
export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(),
  phoneNumber: text("phone_number").notNull(),
})

// Appointments table
export const appointments = sqliteTable("appointments", {
  id: text("id").primaryKey(),
  doctor: text("doctor").notNull(),
  specialty: text("specialty").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  type: text("type").notNull(),
  location: text("location").notNull(),
  mode: text("mode").notNull(),
  notes: text("notes"),
  status: text("status").notNull(),
  patientId: integer("patient_id").notNull(),
})

// Medications table
export const medications = sqliteTable("medications", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  withFood: integer("with_food", { mode: "boolean" }).notNull(),
  notes: text("notes"),
  status: text("status").notNull(),
  adherence: integer("adherence").notNull(),
  patientId: integer("patient_id").notNull(),
})

// Medical records table
export const medicalRecords = sqliteTable("medical_records", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  date: text("date").notNull(),
  doctor: text("doctor").notNull(),
  specialty: text("specialty").notNull(),
  diagnosis: text("diagnosis").notNull(),
  notes: text("notes").notNull(),
  documentUrl: text("document_url"),
  patientId: integer("patient_id").notNull(),
})

// Blood donations table
export const bloodDonations = sqliteTable("blood_donations", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  location: text("location").notNull(),
  bloodType: text("blood_type").notNull(),
  status: text("status").notNull(),
  donorId: integer("donor_id").notNull(),
})

// Blood requests table
export const bloodRequests = sqliteTable("blood_requests", {
  id: text("id").primaryKey(),
  bloodType: text("blood_type").notNull(),
  hospital: text("hospital").notNull(),
  urgency: text("urgency").notNull(),
  date: text("date").notNull(),
  quantity: text("quantity").notNull(),
  patientType: text("patient_type"),
  reason: text("reason"),
  status: text("status").notNull(),
  contactPerson: text("contact_person").notNull(),
  contactPhone: text("contact_phone").notNull(),
  requesterId: integer("requester_id").notNull(),
})

// Patients table
export const patients = sqliteTable("patients", {
  id: integer("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number").notNull(),
  bloodType: text("blood_type"),
  height: text("height"),
  weight: text("weight"),
  allergies: text("allergies"),
  chronicConditions: text("chronic_conditions"),
  doctorId: integer("doctor_id"),
})
