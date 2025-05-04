"use server"
import { z } from "zod"

// Schema for creating a medical record
const createRecordSchema = z.object({
  patientId: z.string(),
  title: z.string().min
