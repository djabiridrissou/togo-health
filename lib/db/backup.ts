import { db } from "./index"
import { sql } from "drizzle-orm"
import fs from "fs"
import path from "path"

/**
 * Crée une sauvegarde de la base de données
 * @param reason Raison de la sauvegarde (scheduled, manual, pre-update, etc.)
 * @returns Le chemin du fichier de sauvegarde
 */
export async function createBackup(reason = "manual"): Promise<string> {
  try {
    // Créer le dossier de sauvegarde s'il n'existe pas
    const backupDir = path.join(process.cwd(), "backups")
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    // Générer un nom de fichier avec la date et l'heure
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const backupFileName = `backup-${timestamp}-${reason}.sqlite`
    const backupPath = path.join(backupDir, backupFileName)

    // Exécuter la commande de sauvegarde SQLite
    await db.execute(sql`VACUUM INTO '${backupPath}'`)

    // Enregistrer la sauvegarde dans la table des sauvegardes
    await db.execute(sql`
      INSERT INTO backups (
        file_path, 
        reason, 
        timestamp,
        status
      ) VALUES (
        ${backupPath}, 
        ${reason}, 
        datetime('now'),
        'completed'
      )
    `)

    console.log(`Sauvegarde créée: ${backupPath}`)
    return backupPath
  } catch (error) {
    console.error("Erreur lors de la création de la sauvegarde:", error)

    // Enregistrer l'échec dans la table des sauvegardes
    await db.execute(sql`
      INSERT INTO backups (
        file_path, 
        reason, 
        timestamp,
        status,
        error_message
      ) VALUES (
        'failed', 
        ${reason}, 
        datetime('now'),
        'failed',
        ${error.message || "Erreur inconnue"}
      )
    `)

    throw error
  }
}

/**
 * Restaure la base de données à partir d'une sauvegarde
 * @param backupPath Chemin du fichier de sauvegarde
 * @param userId ID de l'utilisateur qui effectue la restauration
 */
export async function restoreFromBackup(backupPath: string, userId: number): Promise<boolean> {
  try {
    // Vérifier que le fichier existe
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Fichier de sauvegarde introuvable: ${backupPath}`)
    }

    // Créer une sauvegarde de l'état actuel avant la restauration
    const preRestoreBackupPath = await createBackup("pre-restore")

    // Chemin de la base de données principale
    const dbPath = process.env.DATABASE_URL?.replace("file:", "") || "togo-healthcare.db"

    // Copier le fichier de sauvegarde vers la base de données principale
    fs.copyFileSync(backupPath, dbPath)

    // Enregistrer la restauration dans la table des restaurations
    await db.execute(sql`
      INSERT INTO restore_operations (
        backup_path,
        user_id,
        timestamp,
        status,
        pre_restore_backup
      ) VALUES (
        ${backupPath},
        ${userId},
        datetime('now'),
        'completed',
        ${preRestoreBackupPath}
      )
    `)

    console.log(`Base de données restaurée à partir de: ${backupPath}`)
    return true
  } catch (error) {
    console.error("Erreur lors de la restauration de la sauvegarde:", error)

    // Enregistrer l'échec dans la table des restaurations
    await db.execute(sql`
      INSERT INTO restore_operations (
        backup_path,
        user_id,
        timestamp,
        status,
        error_message
      ) VALUES (
        ${backupPath},
        ${userId},
        datetime('now'),
        'failed',
        ${error.message || "Erreur inconnue"}
      )
    `)

    throw error
  }
}

/**
 * Nettoie les anciennes sauvegardes en conservant uniquement un nombre spécifié
 * @param keepCount Nombre de sauvegardes à conserver
 */
export async function cleanupOldBackups(keepCount = 30): Promise<void> {
  try {
    // Récupérer toutes les sauvegardes, triées par date
    const backups = await db.execute(sql`
      SELECT id, file_path, timestamp 
      FROM backups 
      WHERE status = 'completed'
      ORDER BY timestamp DESC
    `)

    // Si nous avons plus de sauvegardes que le nombre à conserver
    if (backups.length > keepCount) {
      // Sauvegardes à supprimer
      const backupsToDelete = backups.slice(keepCount)

      for (const backup of backupsToDelete) {
        // Supprimer le fichier
        if (fs.existsSync(backup.file_path)) {
          fs.unlinkSync(backup.file_path)
        }

        // Mettre à jour le statut dans la base de données
        await db.execute(sql`
          UPDATE backups 
          SET status = 'deleted', deleted_at = datetime('now')
          WHERE id = ${backup.id}
        `)
      }

      console.log(`${backupsToDelete.length} anciennes sauvegardes supprimées`)
    }
  } catch (error) {
    console.error("Erreur lors du nettoyage des anciennes sauvegardes:", error)
    throw error
  }
}

/**
 * Planifie une sauvegarde automatique quotidienne
 * Cette fonction doit être appelée au démarrage de l'application
 */
export function scheduleAutomaticBackups(): void {
  // Calculer le temps jusqu'à minuit
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  const timeUntilMidnight = midnight.getTime() - now.getTime()

  // Planifier la première sauvegarde à minuit
  setTimeout(async () => {
    try {
      // Créer une sauvegarde
      await createBackup("scheduled")

      // Nettoyer les anciennes sauvegardes
      await cleanupOldBackups(30)

      // Planifier la prochaine sauvegarde dans 24 heures
      setInterval(
        async () => {
          await createBackup("scheduled")
          await cleanupOldBackups(30)
        },
        24 * 60 * 60 * 1000,
      )
    } catch (error) {
      console.error("Erreur lors de la sauvegarde automatique:", error)
    }
  }, timeUntilMidnight)

  console.log(`Sauvegarde automatique planifiée pour ${midnight.toLocaleString()}`)
}
