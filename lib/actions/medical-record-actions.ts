"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { z } from "zod"
import { logActivity } from "@/lib/activity-log"

// Schema for creating a medical record
const createRecordSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  type: z.string(),
  description: z.string().min(1, "La description est requise"),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Date invalide",
  }),
  pinAccess: z.string().transform((val) => val === "true"),
})

// Schema for updating a medical record
const updateRecordSchema = z.object({
  recordId: z.string(),
  title: z.string().min(1, "Le titre est requis"),
  type: z.string(),
  description: z.string().min(1, "La description est requise"),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Date invalide",
  }),
  pinAccess: z.string().transform((val) => val === "true"),
  existingAttachments: z.string().transform((val) => {
    try {
      return JSON.parse(val)
    } catch {
      return []
    }
  }),
})

// Add a new medical record (patient self-report)
export async function addPatientMedicalRecord(formData: FormData) {
  const user = await getCurrentUser()

  if (!user || user.role !== "PATIENT") {
    return { success: false, message: "Unauthorized" }
  }

  try {
    const patient = await db.patient.findUnique({
      where: { userId: user.id },
    })

    if (!patient) {
      return { success: false, message: "Patient profile not found" }
    }

    const validatedFields = createRecordSchema.parse({
      title: formData.get("title"),
      type: formData.get("type"),
      description: formData.get("description"),
      date: formData.get("date"),
      pinAccess: formData.get("pinAccess"),
    })

    // Handle file uploads (in a real app, you would upload to a storage service)
    const attachments: string[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("attachment-") && value instanceof File && value.name) {
        attachments.push(value.name)
      }
    }

    // Create the medical record
    const record = await db.medicalRecord.create({
      data: {
        patientId: patient.id,
        title: validatedFields.title,
        type: validatedFields.type,
        description: validatedFields.description,
        date: new Date(validatedFields.date),
        pinAccess: validatedFields.pinAccess,
        attachments: attachments.length > 0 ? JSON.stringify(attachments) : null,
        isApproved: false, // Self-reported records are not approved by default
      },
    })

    // Log the activity
    await logActivity(
      "CREATE",
      "MEDICAL_RECORD",
      record.id,
      `Ajout d'une entrée au dossier médical: ${validatedFields.title}`,
      true
    )

    revalidatePath("/dashboard/medical-record")
    return { success: true, recordId: record.id }
  } catch (error) {
    console.error("Error adding medical record:", error)

    // Log the error
    await logActivity(
      "CREATE",
      "MEDICAL_RECORD",
      undefined,
      "Erreur lors de l'ajout d'une entrée au dossier médical",
      false,
      error instanceof Error ? error.message : "Erreur inconnue"
    )

    return { success: false, message: "Failed to add medical record" }
  }
}

// Update an existing medical record
export async function updatePatientMedicalRecord(formData: FormData) {
  const user = await getCurrentUser()

  if (!user || user.role !== "PATIENT") {
    return { success: false, message: "Unauthorized" }
  }

  try {
    const patient = await db.patient.findUnique({
      where: { userId: user.id },
    })

    if (!patient) {
      return { success: false, message: "Patient profile not found" }
    }

    const validatedFields = updateRecordSchema.parse({
      recordId: formData.get("recordId"),
      title: formData.get("title"),
      type: formData.get("type"),
      description: formData.get("description"),
      date: formData.get("date"),
      pinAccess: formData.get("pinAccess"),
      existingAttachments: formData.get("existingAttachments"),
    })

    // Verify that the record belongs to this patient
    const existingRecord = await db.medicalRecord.findUnique({
      where: { id: validatedFields.recordId },
    })

    if (!existingRecord || existingRecord.patientId !== patient.id) {
      return { success: false, message: "Record not found or not authorized to edit" }
    }

    // Handle file uploads (in a real app, you would upload to a storage service)
    const newAttachments: string[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("attachment-") && value instanceof File && value.name) {
        newAttachments.push(value.name)
      }
    }

    // Combine existing and new attachments
    const allAttachments = [...validatedFields.existingAttachments, ...newAttachments]

    // Update the medical record
    const record = await db.medicalRecord.update({
      where: { id: validatedFields.recordId },
      data: {
        title: validatedFields.title,
        type: validatedFields.type,
        description: validatedFields.description,
        date: new Date(validatedFields.date),
        pinAccess: validatedFields.pinAccess,
        attachments: allAttachments.length > 0 ? JSON.stringify(allAttachments) : null,
        isApproved: false, // Reset approval status when patient edits
      },
    })

    // Log the activity
    await logActivity(
      "UPDATE",
      "MEDICAL_RECORD",
      record.id,
      `Mise à jour d'une entrée du dossier médical: ${validatedFields.title}`,
      true
    )

    revalidatePath("/dashboard/medical-record")
    return { success: true }
  } catch (error) {
    console.error("Error updating medical record:", error)

    // Log the error
    await logActivity(
      "UPDATE",
      "MEDICAL_RECORD",
      formData.get("recordId")?.toString(),
      "Erreur lors de la mise à jour d'une entrée du dossier médical",
      false,
      error instanceof Error ? error.message : "Erreur inconnue"
    )

    return { success: false, message: "Failed to update medical record" }
  }
}

// Delete a medical record
export async function deletePatientMedicalRecord(recordId: string) {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, message: "Unauthorized" }
  }

  try {
    // If user is a patient, verify ownership
    if (user.role === "PATIENT") {
      const patient = await db.patient.findUnique({
        where: { userId: user.id },
      })

      if (!patient) {
        return { success: false, message: "Patient profile not found" }
      }

      const record = await db.medicalRecord.findUnique({
        where: { id: recordId },
      })

      if (!record || record.patientId !== patient.id) {
        return { success: false, message: "Record not found or not authorized to delete" }
      }
    }
    // If user is a doctor, verify they can delete this record
    else if (user.role === "DOCTOR") {
      const doctor = await db.doctor.findUnique({
        where: { userId: user.id },
      })

      if (!doctor) {
        return { success: false, message: "Doctor profile not found" }
      }

      const record = await db.medicalRecord.findUnique({
        where: { id: recordId },
      })

      if (!record || (record.doctorId !== doctor.id && !record.isApproved)) {
        return { success: false, message: "Record not found or not authorized to delete" }
      }
    }
    // If user is an admin, they can delete any record
    else if (user.role !== "ADMIN" && user.role !== "SYSTEM_ADMIN") {
      return { success: false, message: "Unauthorized" }
    }

    // Delete the record
    await db.medicalRecord.delete({
      where: { id: recordId },
    })

    // Log the activity
    await logActivity(
      "DELETE",
      "MEDICAL_RECORD",
      recordId,
      `Suppression d'une entrée du dossier médical`,
      true
    )

    revalidatePath("/dashboard/medical-record")
    return { success: true }
  } catch (error) {
    console.error("Error deleting medical record:", error)

    // Log the error
    await logActivity(
      "DELETE",
      "MEDICAL_RECORD",
      recordId,
      "Erreur lors de la suppression d'une entrée du dossier médical",
      false,
      error instanceof Error ? error.message : "Erreur inconnue"
    )

    return { success: false, message: "Failed to delete medical record" }
  }
}
