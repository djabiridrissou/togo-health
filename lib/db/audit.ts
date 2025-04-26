import { db } from "./index"
import { sql } from "drizzle-orm"

/**
 * Enregistre une action dans le journal d'audit
 * @param userId ID de l'utilisateur qui effectue l'action
 * @param entityType Type d'entité (patient, medical_record, etc.)
 * @param entityId ID de l'entité concernée
 * @param action Type d'action (create, update, delete)
 * @param beforeData Données avant modification (pour les mises à jour)
 * @param afterData Données après modification
 * @param details Détails supplémentaires sur l'action
 */
export async function logAuditAction(
  userId: number,
  entityType: string,
  entityId: string | number,
  action: "create" | "update" | "delete",
  beforeData: any = null,
  afterData: any = null,
  details = "",
) {
  try {
    // Convertir les objets en JSON pour le stockage
    const beforeJson = beforeData ? JSON.stringify(beforeData) : null
    const afterJson = afterData ? JSON.stringify(afterData) : null

    // Insérer dans la table d'audit
    await db.execute(sql`
      INSERT INTO audit_logs (
        user_id, 
        entity_type, 
        entity_id, 
        action, 
        before_data, 
        after_data, 
        details, 
        timestamp
      ) VALUES (
        ${userId}, 
        ${entityType}, 
        ${String(entityId)}, 
        ${action}, 
        ${beforeJson}, 
        ${afterJson}, 
        ${details}, 
        datetime('now')
      )
    `)

    console.log(`Audit: ${action} ${entityType} ${entityId} by user ${userId}`)
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'audit:", error)
    // Ne pas faire échouer l'opération principale en cas d'erreur d'audit
  }
}

/**
 * Enregistre une nouvelle version d'une entité
 * @param userId ID de l'utilisateur qui effectue la modification
 * @param entityType Type d'entité (patient, medical_record, etc.)
 * @param entityId ID de l'entité concernée
 * @param data Données complètes de l'entité après modification
 * @param changes Description des changements effectués
 */
export async function createEntityVersion(
  userId: number,
  entityType: string,
  entityId: string | number,
  data: any,
  changes: string,
) {
  try {
    // Obtenir la dernière version
    const result = await db.execute(sql`
      SELECT MAX(version) as max_version 
      FROM entity_versions 
      WHERE entity_type = ${entityType} AND entity_id = ${String(entityId)}
    `)

    const maxVersion = result[0]?.max_version || 0
    const newVersion = maxVersion + 1

    // Insérer la nouvelle version
    await db.execute(sql`
      INSERT INTO entity_versions (
        entity_type,
        entity_id,
        version,
        user_id,
        data,
        changes,
        timestamp
      ) VALUES (
        ${entityType},
        ${String(entityId)},
        ${newVersion},
        ${userId},
        ${JSON.stringify(data)},
        ${changes},
        datetime('now')
      )
    `)

    console.log(`Version ${newVersion} created for ${entityType} ${entityId}`)
    return newVersion
  } catch (error) {
    console.error("Erreur lors de la création d'une version:", error)
    throw error
  }
}

/**
 * Récupère l'historique des versions d'une entité
 * @param entityType Type d'entité (patient, medical_record, etc.)
 * @param entityId ID de l'entité concernée
 */
export async function getEntityVersionHistory(entityType: string, entityId: string | number) {
  try {
    const versions = await db.execute(sql`
      SELECT 
        v.id,
        v.version,
        v.user_id,
        u.name as user_name,
        v.data,
        v.changes,
        v.timestamp
      FROM 
        entity_versions v
      LEFT JOIN 
        users u ON v.user_id = u.id
      WHERE 
        v.entity_type = ${entityType} AND 
        v.entity_id = ${String(entityId)}
      ORDER BY 
        v.version DESC
    `)

    return versions.map((v) => ({
      ...v,
      data: JSON.parse(v.data),
    }))
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique des versions:", error)
    throw error
  }
}

/**
 * Restaure une entité à une version précédente
 * @param userId ID de l'utilisateur qui effectue la restauration
 * @param entityType Type d'entité (patient, medical_record, etc.)
 * @param entityId ID de l'entité concernée
 * @param versionId ID de la version à restaurer
 */
export async function restoreEntityVersion(
  userId: number,
  entityType: string,
  entityId: string | number,
  versionId: number,
) {
  try {
    // Récupérer la version à restaurer
    const versionResult = await db.execute(sql`
      SELECT data FROM entity_versions 
      WHERE id = ${versionId} AND entity_type = ${entityType} AND entity_id = ${String(entityId)}
    `)

    if (!versionResult.length) {
      throw new Error("Version introuvable")
    }

    const versionData = JSON.parse(versionResult[0].data)

    // Récupérer les données actuelles pour l'audit
    const currentData = await getCurrentEntityData(entityType, entityId)

    // Effectuer la restauration (dépend du type d'entité)
    await updateEntityData(entityType, entityId, versionData)

    // Créer une nouvelle version pour tracer la restauration
    await createEntityVersion(
      userId,
      entityType,
      entityId,
      versionData,
      `Restauration à la version ${versionResult[0].version}`,
    )

    // Enregistrer l'action dans le journal d'audit
    await logAuditAction(
      userId,
      entityType,
      entityId,
      "update",
      currentData,
      versionData,
      `Restauration à une version précédente`,
    )

    return versionData
  } catch (error) {
    console.error("Erreur lors de la restauration d'une version:", error)
    throw error
  }
}

/**
 * Récupère les données actuelles d'une entité
 * @param entityType Type d'entité (patient, medical_record, etc.)
 * @param entityId ID de l'entité concernée
 */
async function getCurrentEntityData(entityType: string, entityId: string | number) {
  // Cette fonction doit être adaptée selon le type d'entité
  switch (entityType) {
    case "patient":
      const patientResult = await db.execute(sql`
        SELECT * FROM patients WHERE id = ${String(entityId)}
      `)
      return patientResult[0] || null

    case "medical_record":
      const recordResult = await db.execute(sql`
        SELECT * FROM medical_records WHERE id = ${String(entityId)}
      `)
      return recordResult[0] || null

    // Ajouter d'autres types d'entités selon les besoins

    default:
      throw new Error(`Type d'entité non pris en charge: ${entityType}`)
  }
}

/**
 * Met à jour les données d'une entité
 * @param entityType Type d'entité (patient, medical_record, etc.)
 * @param entityId ID de l'entité concernée
 * @param data Nouvelles données
 */
async function updateEntityData(entityType: string, entityId: string | number, data: any) {
  // Cette fonction doit être adaptée selon le type d'entité
  switch (entityType) {
    case "patient":
      // Extraire uniquement les champs valides pour la table patients
      const { id, name, email, phone, birthDate, address, bloodType, allergies, ...rest } = data

      await db.execute(sql`
        UPDATE patients 
        SET 
          name = ${name || null},
          email = ${email || null},
          phone = ${phone || null},
          birth_date = ${birthDate || null},
          address = ${address || null},
          blood_type = ${bloodType || null},
          allergies = ${allergies || null}
        WHERE id = ${String(entityId)}
      `)
      break

    case "medical_record":
      // Adapter selon la structure de la table medical_records
      await db.execute(sql`
        UPDATE medical_records 
        SET 
          patient_id = ${data.patientId || null},
          doctor_id = ${data.doctorId || null},
          date = ${data.date || null},
          diagnosis = ${data.diagnosis || null},
          treatment = ${data.treatment || null},
          notes = ${data.notes || null}
        WHERE id = ${String(entityId)}
      `)
      break

    // Ajouter d'autres types d'entités selon les besoins

    default:
      throw new Error(`Type d'entité non pris en charge: ${entityType}`)
  }
}
