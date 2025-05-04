"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { verifyPin } from "@/lib/auth"
import { getCurrentUser } from "@/lib/session"
import { z } from "zod"
import bcrypt from "bcryptjs"

// Schema for PIN validation
const pinValidationSchema = z.object({
  patientId: z.string(),
  pin: z.string().min(4).max(6),
})

// Schema for patient profile update
const patientUpdateSchema = z.object({
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
})

// Schema for PIN update
const pinUpdateSchema = z.object({
  currentPin: z.string().min(4).max(6),
  newPin: z.string().min(4).max(6),
  confirmPin: z.string().min(4).max(6),
})

// Verify patient PIN
export async function verifyPatientPin(patientId: string, pin: string) {
  try {
    const validatedFields = pinValidationSchema.parse({ patientId, pin })

    const patient = await db.patient.findUnique({
      where: { id: validatedFields.patientId },
    })

    if (!patient) {
      return { success: false, message: "Patient not found" }
    }

    const isValid = await verifyPin(pin, patient.pinCode)

    if (!isValid) {
      return { success: false, message: "Invalid PIN" }
    }

    return { success: true }
  } catch (error) {
    console.error("PIN verification error:", error)
    return { success: false, message: "An error occurred during verification" }
  }
}

// Update patient profile
export async function updatePatientProfile(formData: FormData) {
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

    const validatedFields = patientUpdateSchema.parse({
      dateOfBirth: formData.get("dateOfBirth") as string,
      gender: formData.get("gender") as string,
      phoneNumber: formData.get("phoneNumber") as string,
      address: formData.get("address") as string,
      emergencyContact: formData.get("emergencyContact") as string,
      bloodType: formData.get("bloodType") as string,
      allergies: formData.get("allergies") as string,
      chronicConditions: formData.get("chronicConditions") as string,
    })

    await db.patient.update({
      where: { id: patient.id },
      data: {
        dateOfBirth: validatedFields.dateOfBirth ? new Date(validatedFields.dateOfBirth) : undefined,
        gender: validatedFields.gender,
        phoneNumber: validatedFields.phoneNumber,
        address: validatedFields.address,
        emergencyContact: validatedFields.emergencyContact,
        bloodType: validatedFields.bloodType,
        allergies: validatedFields.allergies,
        chronicConditions: validatedFields.chronicConditions,
      },
    })

    revalidatePath("/dashboard/profile")
    return { success: true, message: "Profile updated successfully" }
  } catch (error) {
    console.error("Profile update error:", error)
    return { success: false, message: "Failed to update profile" }
  }
}

// Update patient PIN
export async function updatePatientPin(formData: FormData) {
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

    const validatedFields = pinUpdateSchema.parse({
      currentPin: formData.get("currentPin") as string,
      newPin: formData.get("newPin") as string,
      confirmPin: formData.get("confirmPin") as string,
    })

    // Verify current PIN
    const isCurrentPinValid = await verifyPin(validatedFields.currentPin, patient.pinCode)

    if (!isCurrentPinValid) {
      return { success: false, message: "Current PIN is incorrect" }
    }

    // Verify new PIN matches confirmation
    if (validatedFields.newPin !== validatedFields.confirmPin) {
      return { success: false, message: "New PIN and confirmation do not match" }
    }

    // Hash and update the new PIN
    const hashedPin = await bcrypt.hash(validatedFields.newPin, 10)

    await db.patient.update({
      where: { id: patient.id },
      data: {
        pinCode: hashedPin,
      },
    })

    return { success: true, message: "PIN updated successfully" }
  } catch (error) {
    console.error("PIN update error:", error)
    return { success: false, message: "Failed to update PIN" }
  }
}

// Get patient medical records
export async function getPatientMedicalRecords(patientId: string) {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, message: "Unauthorized", records: [] }
  }

  try {
    // If user is the patient
    if (user.role === "PATIENT") {
      const patient = await db.patient.findUnique({
        where: { userId: user.id },
      })

      if (!patient || patient.id !== patientId) {
        return { success: false, message: "Unauthorized", records: [] }
      }

      const records = await db.medicalRecord.findMany({
        where: { patientId },
        include: {
          doctor: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy: { date: "desc" },
      })

      return { success: true, records }
    }

    // If user is a doctor
    if (user.role === "DOCTOR") {
      const doctor = await db.doctor.findUnique({
        where: { userId: user.id },
      })

      if (!doctor) {
        return { success: false, message: "Doctor profile not found", records: [] }
      }

      // Get only approved records or records created by this doctor
      const records = await db.medicalRecord.findMany({
        where: {
          patientId,
          OR: [{ isApproved: true }, { doctorId: doctor.id }],
        },
        include: {
          doctor: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy: { date: "desc" },
      })

      return { success: true, records }
    }

    return { success: false, message: "Unauthorized role", records: [] }
  } catch (error) {
    console.error("Error fetching medical records:", error)
    return { success: false, message: "Failed to fetch medical records", records: [] }
  }
}
