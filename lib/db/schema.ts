import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

// Tables existantes...

// Nouvelle table pour l'audit des modifications
export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull(),
  entityType: text("entity_type").notNull(), // 'patient', 'appointment', etc.
  entityId: text("entity_id").notNull(),
  action: text("action").notNull(), // 'create', 'update', 'delete'
  timestamp: text("timestamp").notNull(),
  oldData: text("old_data"), // JSON serialized
  newData: text("new_data"), // JSON serialized
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
})

// Table pour le versionnement des dossiers médicaux
export const medicalRecordsHistory = sqliteTable("medical_records_history", {
  id: text("id").primaryKey(),
  recordId: text("record_id").notNull(),
  version: integer("version").notNull(),
  data: text("data").notNull(), // JSON serialized
  modifiedBy: integer("modified_by").notNull(),
  modifiedAt: text("modified_at").notNull(),
  reason: text("reason"),
})

// Table pour le versionnement des patients
export const patientsHistory = sqliteTable("patients_history", {
  id: text("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  version: integer("version").notNull(),
  data: text("data").notNull(), // JSON serialized
  modifiedBy: integer("modified_by").notNull(),
  modifiedAt: text("modified_at").notNull(),
  reason: text("reason"),
})

// Ajout d'un champ version aux tables principales
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
  version: integer("version").notNull().default(1), // Nouveau champ pour le versionnement
})

export const medicalRecords = sqliteTable("medical_records", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  date: text("date").notNull(),
  doctor: text("doctor").notNull(),
  doctorId: integer("doctor_id").notNull(),
  specialty: text("specialty").notNull(),
  diagnosis: text("diagnosis").notNull(),
  notes: text("notes").notNull(),
  documentUrl: text("document_url"),
  patientId: integer("patient_id").notNull(),
  version: integer("version").notNull().default(1), // Nouveau champ pour le versionnement
})
