#!/usr/bin/env node

import { createBackup, cleanupOldBackups } from "../lib/db/backup"

async function main() {
  try {
    console.log("Création d'une sauvegarde manuelle de la base de données...")
    const backupPath = await createBackup("manual-script")
    console.log(`Sauvegarde créée avec succès: ${backupPath}`)

    console.log("Nettoyage des anciennes sauvegardes...")
    await cleanupOldBackups(30)
    console.log("Nettoyage terminé")

    process.exit(0)
  } catch (error) {
    console.error("Erreur lors de la sauvegarde:", error)
    process.exit(1)
  }
}

main()
