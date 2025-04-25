import { getDb } from "./index"
import type {
  User,
  Patient,
  Appointment,
  Medication,
  MedicalRecord,
  BloodDonation,
  BloodRequest,
  Document,
  DocumentAccess,
  Notification,
} from "@/types"

// Fonction pour générer un ID unique
export function generateId(): string {
  return Date.now().toString() + Math.floor(Math.random() * 1000).toString()
}

// Opérations sur les utilisateurs
export function getAllUsers(): User[] {
  const db = getDb()
  return db.prepare("SELECT * FROM users").all() as User[]
}

export function getUserById(id: number): User | undefined {
  const db = getDb()
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as User | undefined
}

export function getUserByEmail(email: string): User | undefined {
  const db = getDb()
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email) as User | undefined
}

export function addUser(user: Omit<User, "id">): User {
  const db = getDb()
  const result = db
    .prepare(`
    INSERT INTO users (firstName, lastName, email, password, role, phoneNumber, specialty)
    VALUES (@firstName, @lastName, @email, @password, @role, @phoneNumber, @specialty)
  `)
    .run(user)

  return { ...user, id: result.lastInsertRowid as number } as User
}

export function updateUser(id: number, user: Partial<User>): boolean {
  const db = getDb()

  // Construire la requête dynamiquement en fonction des champs à mettre à jour
  const fields = Object.keys(user)
    .map((key) => `${key} = @${key}`)
    .join(", ")
  if (!fields) return false

  const stmt = db.prepare(`UPDATE users SET ${fields} WHERE id = @id`)
  const result = stmt.run({ ...user, id })

  return result.changes > 0
}

export function deleteUser(id: number): boolean {
  const db = getDb()
  const result = db.prepare("DELETE FROM users WHERE id = ?").run(id)
  return result.changes > 0
}

// Opérations sur les patients
export function getAllPatients(): Patient[] {
  const db = getDb()
  const patients = db.prepare("SELECT * FROM patients").all() as (Omit<Patient, "allergies" | "chronicConditions"> & {
    allergies: string
    chronicConditions: string
  })[]

  // Convertir les chaînes JSON en tableaux
  return patients.map((patient) => ({
    ...patient,
    allergies: patient.allergies ? JSON.parse(patient.allergies) : [],
    chronicConditions: patient.chronicConditions ? JSON.parse(patient.chronicConditions) : [],
  }))
}

export function getPatientById(id: number): Patient | undefined {
  const db = getDb()
  const patient = db.prepare("SELECT * FROM patients WHERE id = ?").get(id) as
    | (Omit<Patient, "allergies" | "chronicConditions"> & { allergies: string; chronicConditions: string })
    | undefined

  if (!patient) return undefined

  // Convertir les chaînes JSON en tableaux
  return {
    ...patient,
    allergies: patient.allergies ? JSON.parse(patient.allergies) : [],
    chronicConditions: patient.chronicConditions ? JSON.parse(patient.chronicConditions) : [],
  }
}

export function getPatientsByDoctor(doctorId: number): Patient[] {
  const db = getDb()
  const patients = db.prepare("SELECT * FROM patients WHERE doctorId = ?").all(doctorId) as (Omit<
    Patient,
    "allergies" | "chronicConditions"
  > & { allergies: string; chronicConditions: string })[]

  // Convertir les chaînes JSON en tableaux
  return patients.map((patient) => ({
    ...patient,
    allergies: patient.allergies ? JSON.parse(patient.allergies) : [],
    chronicConditions: patient.chronicConditions ? JSON.parse(patient.chronicConditions) : [],
  }))
}

export function addPatient(patient: Omit<Patient, "id">): Patient {
  const db = getDb()

  // Convertir les tableaux en chaînes JSON
  const patientData = {
    ...patient,
    allergies: JSON.stringify(patient.allergies),
    chronicConditions: JSON.stringify(patient.chronicConditions),
  }

  const result = db
    .prepare(`
    INSERT INTO patients (firstName, lastName, email, phoneNumber, bloodType, height, weight, allergies, chronicConditions, doctorId)
    VALUES (@firstName, @lastName, @email, @phoneNumber, @bloodType, @height, @weight, @allergies, @chronicConditions, @doctorId)
  `)
    .run(patientData)

  return { ...patient, id: result.lastInsertRowid as number }
}

export function updatePatient(id: number, patient: Partial<Patient>): boolean {
  const db = getDb()

  // Préparer les données pour la mise à jour
  const patientData: any = { ...patient }

  // Convertir les tableaux en chaînes JSON si présents
  if (patient.allergies) {
    patientData.allergies = JSON.stringify(patient.allergies)
  }

  if (patient.chronicConditions) {
    patientData.chronicConditions = JSON.stringify(patient.chronicConditions)
  }

  // Construire la requête dynamiquement
  const fields = Object.keys(patientData)
    .map((key) => `${key} = @${key}`)
    .join(", ")
  if (!fields) return false

  const stmt = db.prepare(`UPDATE patients SET ${fields} WHERE id = @id`)
  const result = stmt.run({ ...patientData, id })

  return result.changes > 0
}

export function deletePatient(id: number): boolean {
  const db = getDb()
  const result = db.prepare("DELETE FROM patients WHERE id = ?").run(id)
  return result.changes > 0
}

// Opérations sur les rendez-vous
export function getAllAppointments(): Appointment[] {
  const db = getDb()
  return db.prepare("SELECT * FROM appointments").all() as Appointment[]
}

export function getAppointmentById(id: string): Appointment | undefined {
  const db = getDb()
  return db.prepare("SELECT * FROM appointments WHERE id = ?").get(id) as Appointment | undefined
}

export function getAppointmentsByPatient(patientId: number): Appointment[] {
  const db = getDb()
  return db.prepare("SELECT * FROM appointments WHERE patientId = ?").all(patientId) as Appointment[]
}

export function getAppointmentsByDoctor(doctorId: number): Appointment[] {
  const db = getDb()
  return db.prepare("SELECT * FROM appointments WHERE doctorId = ?").all(doctorId) as Appointment[]
}

export function addAppointment(appointment: Omit<Appointment, "id">): Appointment {
  const db = getDb()
  const id = generateId()

  db.prepare(`
    INSERT INTO appointments (id, doctor, doctorId, specialty, date, time, type, location, mode, notes, status, patientId)
    VALUES (@id, @doctor, @doctorId, @specialty, @date, @time, @type, @location, @mode, @notes, @status, @patientId)
  `).run({ ...appointment, id })

  return { ...appointment, id }
}

export function updateAppointment(id: string, appointment: Partial<Appointment>): boolean {
  const db = getDb()

  // Construire la requête dynamiquement
  const fields = Object.keys(appointment)
    .map((key) => `${key} = @${key}`)
    .join(", ")
  if (!fields) return false

  const stmt = db.prepare(`UPDATE appointments SET ${fields} WHERE id = @id`)
  const result = stmt.run({ ...appointment, id })

  return result.changes > 0
}

export function deleteAppointment(id: string): boolean {
  const db = getDb()
  const result = db.prepare("DELETE FROM appointments WHERE id = ?").run(id)
  return result.changes > 0
}

// Opérations sur les médicaments
export function getAllMedications(): Medication[] {
  const db = getDb()
  const medications = db.prepare("SELECT * FROM medications").all() as (Omit<Medication, "withFood"> & {
    withFood: number
  })[]

  // Convertir le champ withFood de number à boolean
  return medications.map((medication) => ({
    ...medication,
    withFood: Boolean(medication.withFood),
  }))
}

export function getMedicationById(id: string): Medication | undefined {
  const db = getDb()
  const medication = db.prepare("SELECT * FROM medications WHERE id = ?").get(id) as
    | (Omit<Medication, "withFood"> & { withFood: number })
    | undefined

  if (!medication) return undefined

  // Convertir le champ withFood de number à boolean
  return {
    ...medication,
    withFood: Boolean(medication.withFood),
  }
}

export function getMedicationsByPatient(patientId: number): Medication[] {
  const db = getDb()
  const medications = db.prepare("SELECT * FROM medications WHERE patientId = ?").all(patientId) as (Omit<
    Medication,
    "withFood"
  > & { withFood: number })[]

  // Convertir le champ withFood de number à boolean
  return medications.map((medication) => ({
    ...medication,
    withFood: Boolean(medication.withFood),
  }))
}

export function addMedication(medication: Omit<Medication, "id">): Medication {
  const db = getDb()
  const id = generateId()

  // Convertir le champ withFood de boolean à number
  const medicationData = {
    ...medication,
    withFood: medication.withFood ? 1 : 0,
    id,
  }

  db.prepare(`
    INSERT INTO medications (id, name, dosage, frequency, startDate, endDate, withFood, notes, status, adherence, patientId)
    VALUES (@id, @name, @dosage, @frequency, @startDate, @endDate, @withFood, @notes, @status, @adherence, @patientId)
  `).run(medicationData)

  return { ...medication, id }
}

export function updateMedication(id: string, medication: Partial<Medication>): boolean {
  const db = getDb()

  // Préparer les données pour la mise à jour
  const medicationData: any = { ...medication }

  // Convertir le champ withFood de boolean à number si présent
  if (medication.withFood !== undefined) {
    medicationData.withFood = medication.withFood ? 1 : 0
  }

  // Construire la requête dynamiquement
  const fields = Object.keys(medicationData)
    .map((key) => `${key} = @${key}`)
    .join(", ")
  if (!fields) return false

  const stmt = db.prepare(`UPDATE medications SET ${fields} WHERE id = @id`)
  const result = stmt.run({ ...medicationData, id })

  return result.changes > 0
}

export function deleteMedication(id: string): boolean {
  const db = getDb()
  const result = db.prepare("DELETE FROM medications WHERE id = ?").run(id)
  return result.changes > 0
}

// Opérations sur les dossiers médicaux
export function getAllMedicalRecords(): MedicalRecord[] {
  const db = getDb()
  return db.prepare("SELECT * FROM medical_records").all() as MedicalRecord[]
}

export function getMedicalRecordById(id: string): MedicalRecord | undefined {
  const db = getDb()
  return db.prepare("SELECT * FROM medical_records WHERE id = ?").get(id) as MedicalRecord | undefined
}

export function getMedicalRecordsByPatient(patientId: number): MedicalRecord[] {
  const db = getDb()
  return db.prepare("SELECT * FROM medical_records WHERE patientId = ?").all(patientId) as MedicalRecord[]
}

export function addMedicalRecord(record: Omit<MedicalRecord, "id">): MedicalRecord {
  const db = getDb()
  const id = generateId()

  db.prepare(`
    INSERT INTO medical_records (id, type, date, doctor, doctorId, specialty, diagnosis, notes, documentUrl, patientId)
    VALUES (@id, @type, @date, @doctor, @doctorId, @specialty, @diagnosis, @notes, @documentUrl, @patientId)
  `).run({ ...record, id })

  return { ...record, id }
}

export function updateMedicalRecord(id: string, record: Partial<MedicalRecord>): boolean {
  const db = getDb()

  // Construire la requête dynamiquement
  const fields = Object.keys(record)
    .map((key) => `${key} = @${key}`)
    .join(", ")
  if (!fields) return false

  const stmt = db.prepare(`UPDATE medical_records SET ${fields} WHERE id = @id`)
  const result = stmt.run({ ...record, id })

  return result.changes > 0
}

export function deleteMedicalRecord(id: string): boolean {
  const db = getDb()
  const result = db.prepare("DELETE FROM medical_records WHERE id = ?").run(id)
  return result.changes > 0
}

// Opérations sur les dons de sang
export function getAllBloodDonations(): BloodDonation[] {
  const db = getDb()
  return db.prepare("SELECT * FROM blood_donations").all() as BloodDonation[]
}

export function getBloodDonationById(id: string): BloodDonation | undefined {
  const db = getDb()
  return db.prepare("SELECT * FROM blood_donations WHERE id = ?").get(id) as BloodDonation | undefined
}

export function getBloodDonationsByDonor(donorId: number): BloodDonation[] {
  const db = getDb()
  return db.prepare("SELECT * FROM blood_donations WHERE donorId = ?").all(donorId) as BloodDonation[]
}

export function addBloodDonation(donation: Omit<BloodDonation, "id">): BloodDonation {
  const db = getDb()
  const id = generateId()

  db.prepare(`
    INSERT INTO blood_donations (id, date, location, bloodType, status, donorId)
    VALUES (@id, @date, @location, @bloodType, @status, @donorId)
  `).run({ ...donation, id })

  return { ...donation, id }
}

export function updateBloodDonation(id: string, donation: Partial<BloodDonation>): boolean {
  const db = getDb()

  // Construire la requête dynamiquement
  const fields = Object.keys(donation)
    .map((key) => `${key} = @${key}`)
    .join(", ")
  if (!fields) return false

  const stmt = db.prepare(`UPDATE blood_donations SET ${fields} WHERE id = @id`)
  const result = stmt.run({ ...donation, id })

  return result.changes > 0
}

export function deleteBloodDonation(id: string): boolean {
  const db = getDb()
  const result = db.prepare("DELETE FROM blood_donations WHERE id = ?").run(id)
  return result.changes > 0
}

// Opérations sur les demandes de sang
export function getAllBloodRequests(): BloodRequest[] {
  const db = getDb()
  return db.prepare("SELECT * FROM blood_requests").all() as BloodRequest[]
}

export function getBloodRequestById(id: string): BloodRequest | undefined {
  const db = getDb()
  return db.prepare("SELECT * FROM blood_requests WHERE id = ?").get(id) as BloodRequest | undefined
}

export function getBloodRequestsByRequester(requesterId: number): BloodRequest[] {
  const db = getDb()
  return db.prepare("SELECT * FROM blood_requests WHERE requesterId = ?").all(requesterId) as BloodRequest[]
}

export function addBloodRequest(request: Omit<BloodRequest, "id">): BloodRequest {
  const db = getDb()
  const id = generateId()

  db.prepare(`
    INSERT INTO blood_requests (id, bloodType, hospital, urgency, date, quantity, patientType, reason, status, contactPerson, contactPhone, requesterId)
    VALUES (@id, @bloodType, @hospital, @urgency, @date, @quantity, @patientType, @reason, @status, @contactPerson, @contactPhone, @requesterId)
  `).run({ ...request, id })

  return { ...request, id }
}

export function updateBloodRequest(id: string, request: Partial<BloodRequest>): boolean {
  const db = getDb()

  // Construire la requête dynamiquement
  const fields = Object.keys(request)
    .map((key) => `${key} = @${key}`)
    .join(", ")
  if (!fields) return false

  const stmt = db.prepare(`UPDATE blood_requests SET ${fields} WHERE id = @id`)
  const result = stmt.run({ ...request, id })

  return result.changes > 0
}

export function deleteBloodRequest(id: string): boolean {
  const db = getDb()
  const result = db.prepare("DELETE FROM blood_requests WHERE id = ?").run(id)
  return result.changes > 0
}

// Opérations sur les documents
export function getAllDocuments(): Document[] {
  const db = getDb()
  const documents = db.prepare("SELECT * FROM documents").all() as (Omit<Document, "isPrivate"> & {
    isPrivate: number
  })[]

  // Convertir le champ isPrivate de number à boolean
  return documents.map((document) => ({
    ...document,
    isPrivate: Boolean(document.isPrivate),
  }))
}

export function getDocumentById(id: string): Document | undefined {
  const db = getDb()
  const document = db.prepare("SELECT * FROM documents WHERE id = ?").get(id) as
    | (Omit<Document, "isPrivate"> & { isPrivate: number })
    | undefined

  if (!document) return undefined

  // Convertir le champ isPrivate de number à boolean
  return {
    ...document,
    isPrivate: Boolean(document.isPrivate),
  }
}

export function getDocumentsByOwner(ownerId: number): Document[] {
  const db = getDb()
  const documents = db.prepare("SELECT * FROM documents WHERE ownerId = ?").all(ownerId) as (Omit<
    Document,
    "isPrivate"
  > & { isPrivate: number })[]

  // Convertir le champ isPrivate de number à boolean
  return documents.map((document) => ({
    ...document,
    isPrivate: Boolean(document.isPrivate),
  }))
}

export function getDocumentsByUploader(uploaderId: number): Document[] {
  const db = getDb()
  const documents = db.prepare("SELECT * FROM documents WHERE uploaderId = ?").all(uploaderId) as (Omit<
    Document,
    "isPrivate"
  > & { isPrivate: number })[]

  // Convertir le champ isPrivate de number à boolean
  return documents.map((document) => ({
    ...document,
    isPrivate: Boolean(document.isPrivate),
  }))
}

export function addDocument(document: Omit<Document, "id">): Document {
  const db = getDb()
  const id = generateId()

  // Convertir le champ isPrivate de boolean à number
  const documentData = {
    ...document,
    isPrivate: document.isPrivate ? 1 : 0,
    id,
  }

  db.prepare(`
    INSERT INTO documents (id, name, type, date, fileType, fileSize, url, uploaderId, ownerId, isPrivate)
    VALUES (@id, @name, @type, @date, @fileType, @fileSize, @url, @uploaderId, @ownerId, @isPrivate)
  `).run(documentData)

  return { ...document, id }
}

export function updateDocument(id: string, document: Partial<Document>): boolean {
  const db = getDb()

  // Préparer les données pour la mise à jour
  const documentData: any = { ...document }

  // Convertir le champ isPrivate de boolean à number si présent
  if (document.isPrivate !== undefined) {
    documentData.isPrivate = document.isPrivate ? 1 : 0
  }

  // Construire la requête dynamiquement
  const fields = Object.keys(documentData)
    .map((key) => `${key} = @${key}`)
    .join(", ")
  if (!fields) return false

  const stmt = db.prepare(`UPDATE documents SET ${fields} WHERE id = @id`)
  const result = stmt.run({ ...documentData, id })

  return result.changes > 0
}

export function deleteDocument(id: string): boolean {
  const db = getDb()

  // Supprimer d'abord les accès au document
  db.prepare("DELETE FROM document_accesses WHERE documentId = ?").run(id)

  // Puis supprimer le document
  const result = db.prepare("DELETE FROM documents WHERE id = ?").run(id)
  return result.changes > 0
}

// Opérations sur les accès aux documents
export function getAllDocumentAccesses(): DocumentAccess[] {
  const db = getDb()
  return db.prepare("SELECT * FROM document_accesses").all() as DocumentAccess[]
}

export function getDocumentAccessById(id: string): DocumentAccess | undefined {
  const db = getDb()
  return db.prepare("SELECT * FROM document_accesses WHERE id = ?").get(id) as DocumentAccess | undefined
}

export function getDocumentAccessesByDocument(documentId: string): DocumentAccess[] {
  const db = getDb()
  return db.prepare("SELECT * FROM document_accesses WHERE documentId = ?").all(documentId) as DocumentAccess[]
}

export function getDocumentAccessesByUser(userId: number): DocumentAccess[] {
  const db = getDb()
  return db.prepare("SELECT * FROM document_accesses WHERE userId = ?").all(userId) as DocumentAccess[]
}

export function addDocumentAccess(access: Omit<DocumentAccess, "id">): DocumentAccess {
  const db = getDb()
  const id = generateId()

  db.prepare(`
    INSERT INTO document_accesses (id, documentId, userId, grantedBy, grantedAt, expiresAt, status)
    VALUES (@id, @documentId, @userId, @grantedBy, @grantedAt, @expiresAt, @status)
  `).run({ ...access, id })

  return { ...access, id }
}

export function updateDocumentAccess(id: string, access: Partial<DocumentAccess>): boolean {
  const db = getDb()

  // Construire la requête dynamiquement
  const fields = Object.keys(access)
    .map((key) => `${key} = @${key}`)
    .join(", ")
  if (!fields) return false

  const stmt = db.prepare(`UPDATE document_accesses SET ${fields} WHERE id = @id`)
  const result = stmt.run({ ...access, id })

  return result.changes > 0
}

export function deleteDocumentAccess(id: string): boolean {
  const db = getDb()
  const result = db.prepare("DELETE FROM document_accesses WHERE id = ?").run(id)
  return result.changes > 0
}

// Opérations sur les notifications
export function getAllNotifications(): Notification[] {
  const db = getDb()
  const notifications = db.prepare("SELECT * FROM notifications").all() as (Omit<Notification, "isRead"> & {
    isRead: number
  })[]

  // Convertir le champ isRead de number à boolean
  return notifications.map((notification) => ({
    ...notification,
    isRead: Boolean(notification.isRead),
  }))
}

export function getNotificationById(id: string): Notification | undefined {
  const db = getDb()
  const notification = db.prepare("SELECT * FROM notifications WHERE id = ?").get(id) as
    | (Omit<Notification, "isRead"> & { isRead: number })
    | undefined

  if (!notification) return undefined

  // Convertir le champ isRead de number à boolean
  return {
    ...notification,
    isRead: Boolean(notification.isRead),
  }
}

export function getNotificationsByUser(userId: number): Notification[] {
  const db = getDb()
  const notifications = db.prepare("SELECT * FROM notifications WHERE userId = ?").all(userId) as (Omit<
    Notification,
    "isRead"
  > & { isRead: number })[]

  // Convertir le champ isRead de number à boolean
  return notifications.map((notification) => ({
    ...notification,
    isRead: Boolean(notification.isRead),
  }))
}

export function getUnreadNotificationsByUser(userId: number): Notification[] {
  const db = getDb()
  const notifications = db.prepare("SELECT * FROM notifications WHERE userId = ? AND isRead = 0").all(userId) as (Omit<
    Notification,
    "isRead"
  > & { isRead: number })[]

  // Convertir le champ isRead de number à boolean
  return notifications.map((notification) => ({
    ...notification,
    isRead: Boolean(notification.isRead),
  }))
}

export function addNotification(notification: Omit<Notification, "id">): Notification {
  const db = getDb()
  const id = generateId()

  // Convertir le champ isRead de boolean à number
  const notificationData = {
    ...notification,
    isRead: notification.isRead ? 1 : 0,
    id,
  }

  db.prepare(`
    INSERT INTO notifications (id, userId, title, message, date, isRead, type, relatedId)
    VALUES (@id, @userId, @title, @message, @date, @isRead, @type, @relatedId)
  `).run(notificationData)

  return { ...notification, id }
}

export function updateNotification(id: string, notification: Partial<Notification>): boolean {
  const db = getDb()

  // Préparer les données pour la mise à jour
  const notificationData: any = { ...notification }

  // Convertir le champ isRead de boolean à number si présent
  if (notification.isRead !== undefined) {
    notificationData.isRead = notification.isRead ? 1 : 0
  }

  // Construire la requête dynamiquement
  const fields = Object.keys(notificationData)
    .map((key) => `${key} = @${key}`)
    .join(", ")
  if (!fields) return false

  const stmt = db.prepare(`UPDATE notifications SET ${fields} WHERE id = @id`)
  const result = stmt.run({ ...notificationData, id })

  return result.changes > 0
}

export function deleteNotification(id: string): boolean {
  const db = getDb()
  const result = db.prepare("DELETE FROM notifications WHERE id = ?").run(id)
  return result.changes > 0
}

export function markNotificationAsRead(id: string): boolean {
  const db = getDb()
  const result = db.prepare("UPDATE notifications SET isRead = 1 WHERE id = ?").run(id)
  return result.changes > 0
}

export function markAllNotificationsAsRead(userId: number): boolean {
  const db = getDb()
  const result = db.prepare("UPDATE notifications SET isRead = 1 WHERE userId = ?").run(userId)
  return result.changes > 0
}

// Fonctions utilitaires
export function userHasDocumentAccess(userId: number, documentId: string): boolean {
  const db = getDb()

  // Vérifier si le document existe
  const document = getDocumentById(documentId)
  if (!document) return false

  // Le propriétaire a toujours accès
  if (document.ownerId === userId) return true

  // L'uploader a toujours accès
  if (document.uploaderId === userId) return true

  // Si le document n'est pas privé, tout le monde y a accès
  if (!document.isPrivate) return true

  // Vérifier si l'utilisateur a un accès approuvé
  const access = db
    .prepare(`
    SELECT * FROM document_accesses 
    WHERE documentId = ? AND userId = ? AND status = 'approved'
    AND (expiresAt IS NULL OR expiresAt > datetime('now'))
  `)
    .get(documentId, userId) as DocumentAccess | undefined

  return !!access
}

export function getAccessibleDocumentsForUser(userId: number): Document[] {
  const db = getDb()

  // Documents dont l'utilisateur est propriétaire
  const ownedDocuments = getDocumentsByOwner(userId)

  // Documents dont l'utilisateur est l'uploader
  const uploadedDocuments = getDocumentsByUploader(userId)

  // Documents publics
  const publicDocuments = db.prepare("SELECT * FROM documents WHERE isPrivate = 0").all() as (Omit<
    Document,
    "isPrivate"
  > & { isPrivate: number })[]

  // Documents privés auxquels l'utilisateur a accès
  const accessiblePrivateDocuments = db
    .prepare(`
    SELECT d.* FROM documents d
    JOIN document_accesses a ON d.id = a.documentId
    WHERE d.isPrivate = 1 AND a.userId = ? AND a.status = 'approved'
    AND (a.expiresAt IS NULL OR a.expiresAt > datetime('now'))
  `)
    .all(userId) as (Omit<Document, "isPrivate"> & { isPrivate: number })[]

  // Combiner tous les documents et supprimer les doublons
  const allDocuments = [
    ...ownedDocuments,
    ...uploadedDocuments,
    ...publicDocuments.map((doc) => ({ ...doc, isPrivate: Boolean(doc.isPrivate) })),
    ...accessiblePrivateDocuments.map((doc) => ({ ...doc, isPrivate: Boolean(doc.isPrivate) })),
  ]

  // Supprimer les doublons en utilisant un Set avec les IDs
  const uniqueIds = new Set<string>()
  return allDocuments.filter((doc) => {
    if (uniqueIds.has(doc.id)) return false
    uniqueIds.add(doc.id)
    return true
  })
}

export function doctorCanAccessPatientData(doctorId: number, patientId: number): boolean {
  const db = getDb()

  // Vérifier si le patient existe et si le docteur est son médecin attitré
  const patient = db.prepare("SELECT * FROM patients WHERE id = ? AND doctorId = ?").get(patientId, doctorId)

  return !!patient
}
