// Importer les nouvelles fonctions d'audit
import { logAuditTrail, createPatientVersion, createMedicalRecordVersion } from "./audit"
import { getDb } from "./db"
import { getPatientById } from "./queries"
import { getMedicalRecordById } from "./queries"
import { generateId } from "./utils"
import type { Patient, MedicalRecord } from "./types"

// Mise à jour de la fonction updatePatient pour utiliser les transactions et l'audit
export function updatePatient(id: number, patient: Partial<Patient>): boolean {
  const db = getDb()

  try {
    // Démarrer une transaction
    db.exec("BEGIN TRANSACTION")

    // Récupérer les données actuelles du patient
    const currentPatient = getPatientById(id)
    if (!currentPatient) {
      db.exec("ROLLBACK")
      return false
    }

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
      .filter((key) => key !== "version") // Exclure le champ version
      .map((key) => `${key} = @${key}`)
      .join(", ")

    if (!fields) {
      db.exec("ROLLBACK")
      return false
    }

    // Créer une version du patient avant la mise à jour
    createPatientVersion(id, currentPatient)

    // Effectuer la mise à jour
    const stmt = db.prepare(`UPDATE patients SET ${fields} WHERE id = @id`)
    const result = stmt.run({ ...patientData, id })

    // Journaliser la modification
    logAuditTrail("patient", id, "update", currentPatient, { ...currentPatient, ...patient })

    // Valider la transaction
    db.exec("COMMIT")

    return result.changes > 0
  } catch (error) {
    // Annuler la transaction en cas d'erreur
    db.exec("ROLLBACK")
    console.error("Erreur lors de la mise à jour du patient:", error)
    return false
  }
}

// Mise à jour de la fonction updateMedicalRecord pour utiliser les transactions et l'audit
export function updateMedicalRecord(id: string, record: Partial<MedicalRecord>): boolean {
  const db = getDb()

  try {
    // Démarrer une transaction
    db.exec("BEGIN TRANSACTION")

    // Récupérer les données actuelles du dossier médical
    const currentRecord = getMedicalRecordById(id)
    if (!currentRecord) {
      db.exec("ROLLBACK")
      return false
    }

    // Construire la requête dynamiquement
    const fields = Object.keys(record)
      .filter((key) => key !== "version") // Exclure le champ version
      .map((key) => `${key} = @${key}`)
      .join(", ")

    if (!fields) {
      db.exec("ROLLBACK")
      return false
    }

    // Créer une version du dossier médical avant la mise à jour
    createMedicalRecordVersion(id, currentRecord)

    // Effectuer la mise à jour
    const stmt = db.prepare(`UPDATE medical_records SET ${fields} WHERE id = @id`)
    const result = stmt.run({ ...record, id })

    // Journaliser la modification
    logAuditTrail("medical_record", id, "update", currentRecord, { ...currentRecord, ...record })

    // Valider la transaction
    db.exec("COMMIT")

    return result.changes > 0
  } catch (error) {
    // Annuler la transaction en cas d'erreur
    db.exec("ROLLBACK")
    console.error("Erreur lors de la mise à jour du dossier médical:", error)
    return false
  }
}

// Mise à jour de la fonction addPatient pour utiliser les transactions et l'audit
export function addPatient(patient: Omit<Patient, "id">): Patient {
  const db = getDb()

  try {
    // Démarrer une transaction
    db.exec("BEGIN TRANSACTION")

    // Convertir les tableaux en chaînes JSON
    const patientData = {
      ...patient,
      allergies: JSON.stringify(patient.allergies),
      chronicConditions: JSON.stringify(patient.chronicConditions),
      version: 1, // Version initiale
    }

    const result = db
      .prepare(`
      INSERT INTO patients (firstName, lastName, email, phoneNumber, bloodType, height, weight, allergies, chronicConditions, doctorId, version)
      VALUES (@firstName, @lastName, @email, @phoneNumber, @bloodType, @height, @weight, @allergies, @chronicConditions, @doctorId, @version)
    `)
      .run(patientData)

    const newPatient = { ...patient, id: result.lastInsertRowid as number }

    // Journaliser la création
    logAuditTrail("patient", newPatient.id, "create", null, newPatient)

    // Valider la transaction
    db.exec("COMMIT")

    return newPatient
  } catch (error) {
    // Annuler la transaction en cas d'erreur
    db.exec("ROLLBACK")
    console.error("Erreur lors de l'ajout du patient:", error)
    throw error
  }
}

// Mise à jour de la fonction addMedicalRecord pour utiliser les transactions et l'audit
export function addMedicalRecord(record: Omit<MedicalRecord, "id">): MedicalRecord {
  const db = getDb()
  const id = generateId()

  try {
    // Démarrer une transaction
    db.exec("BEGIN TRANSACTION")

    // Ajouter la version initiale
    const recordData = {
      ...record,
      id,
      version: 1,
    }

    db.prepare(`
      INSERT INTO medical_records (id, type, date, doctor, doctorId, specialty, diagnosis, notes, documentUrl, patientId, version)
      VALUES (@id, @type, @date, @doctor, @doctorId, @specialty, @diagnosis, @notes, @documentUrl, @patientId, @version)
    `).run(recordData)

    const newRecord = { ...record, id }

    // Journaliser la création
    logAuditTrail("medical_record", id, "create", null, newRecord)

    // Valider la transaction
    db.exec("COMMIT")

    return newRecord
  } catch (error) {
    // Annuler la transaction en cas d'erreur
    db.exec("ROLLBACK")
    console.error("Erreur lors de l'ajout du dossier médical:", error)
    throw error
  }
}

// Mise à jour de la fonction deletePatient pour utiliser les transactions et l'audit
export function deletePatient(id: number): boolean {
  const db = getDb()

  try {
    // Démarrer une transaction
    db.exec("BEGIN TRANSACTION")

    // Récupérer les données actuelles du patient
    const currentPatient = getPatientById(id)
    if (!currentPatient) {
      db.exec("ROLLBACK")
      return false
    }

    // Effectuer la suppression
    const result = db.prepare("DELETE FROM patients WHERE id = ?").run(id)

    // Journaliser la suppression
    logAuditTrail("patient", id, "delete", currentPatient, null)

    // Valider la transaction
    db.exec("COMMIT")

    return result.changes > 0
  } catch (error) {
    // Annuler la transaction en cas d'erreur
    db.exec("ROLLBACK")
    console.error("Erreur lors de la suppression du patient:", error)
    return false
  }
}

// Mise à jour de la fonction deleteMedicalRecord pour utiliser les transactions et l'audit
export function deleteMedicalRecord(id: string): boolean {
  const db = getDb()

  try {
    // Démarrer une transaction
    db.exec("BEGIN TRANSACTION")

    // Récupérer les données actuelles du dossier médical
    const currentRecord = getMedicalRecordById(id)
    if (!currentRecord) {
      db.exec("ROLLBACK")
      return false
    }

    // Effectuer la suppression
    const result = db.prepare("DELETE FROM medical_records WHERE id = ?").run(id)

    // Journaliser la suppression
    logAuditTrail("medical_record", id, "delete", currentRecord, null)

    // Valider la transaction
    db.exec("COMMIT")

    return result.changes > 0
  } catch (error) {
    // Annuler la transaction en cas d'erreur
    db.exec("ROLLBACK")
    console.error("Erreur lors de la suppression du dossier médical:", error)
    return false
  }
}
