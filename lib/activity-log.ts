"use client"

import { getCurrentUser } from "./auth"

export type ActivityType = 
  | "LOGIN" 
  | "LOGOUT" 
  | "REGISTER" 
  | "CREATE" 
  | "UPDATE" 
  | "DELETE" 
  | "VIEW"

export type ActivityTarget = 
  | "USER" 
  | "APPOINTMENT" 
  | "MEDICATION" 
  | "MEDICAL_RECORD" 
  | "BLOOD_DONATION" 
  | "BLOOD_REQUEST"

export interface ActivityLog {
  id: string
  userId: string | null
  userEmail: string | null
  userRole: string | null
  activityType: ActivityType
  activityTarget: ActivityTarget
  targetId?: string
  details?: string
  timestamp: string
  ipAddress?: string
  success: boolean
  errorMessage?: string
}

// Fonction pour ajouter une entrée dans le journal d'activité
export async function logActivity(
  activityType: ActivityType,
  activityTarget: ActivityTarget,
  targetId?: string,
  details?: string,
  success: boolean = true,
  errorMessage?: string
): Promise<void> {
  try {
    const currentUser = getCurrentUser()
    
    const activityLog: ActivityLog = {
      id: Date.now().toString(),
      userId: currentUser?.id || null,
      userEmail: currentUser?.email || null,
      userRole: currentUser?.role || null,
      activityType,
      activityTarget,
      targetId,
      details,
      timestamp: new Date().toISOString(),
      success,
      errorMessage
    }
    
    // Enregistrer l'activité dans la base de données
    await saveActivityLog(activityLog)
    
    // Également enregistrer dans la console pour le développement
    console.log("Activité enregistrée:", activityLog)
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'activité:", error)
  }
}

// Fonction pour enregistrer l'activité dans la base de données
async function saveActivityLog(activityLog: ActivityLog): Promise<void> {
  try {
    // Vérifier si IndexedDB est disponible
    if (typeof window === "undefined" || !window.indexedDB) {
      console.warn("IndexedDB n'est pas disponible pour enregistrer l'activité")
      return
    }
    
    // Ouvrir la base de données
    const dbPromise = window.indexedDB.open("SanteTogoDB", 1)
    
    dbPromise.onupgradeneeded = function(event) {
      const db = (event.target as IDBOpenDBRequest).result
      
      // Créer le magasin d'objets pour les journaux d'activité s'il n'existe pas
      if (!db.objectStoreNames.contains("activityLogs")) {
        const store = db.createObjectStore("activityLogs", { keyPath: "id" })
        store.createIndex("by-user", "userId", { unique: false })
        store.createIndex("by-type", "activityType", { unique: false })
        store.createIndex("by-target", "activityTarget", { unique: false })
        store.createIndex("by-timestamp", "timestamp", { unique: false })
      }
    }
    
    dbPromise.onsuccess = function(event) {
      const db = (event.target as IDBOpenDBRequest).result
      const transaction = db.transaction(["activityLogs"], "readwrite")
      const store = transaction.objectStore("activityLogs")
      
      // Ajouter l'entrée de journal
      const request = store.add(activityLog)
      
      request.onsuccess = function() {
        console.log("Journal d'activité enregistré avec succès")
      }
      
      request.onerror = function(error) {
        console.error("Erreur lors de l'enregistrement du journal d'activité:", error)
      }
      
      transaction.oncomplete = function() {
        db.close()
      }
    }
    
    dbPromise.onerror = function(error) {
      console.error("Erreur lors de l'ouverture de la base de données:", error)
    }
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du journal d'activité:", error)
  }
}

// Fonction pour récupérer les journaux d'activité
export async function getActivityLogs(
  filters?: {
    userId?: string
    activityType?: ActivityType
    activityTarget?: ActivityTarget
    startDate?: string
    endDate?: string
  }
): Promise<ActivityLog[]> {
  return new Promise((resolve, reject) => {
    try {
      // Vérifier si IndexedDB est disponible
      if (typeof window === "undefined" || !window.indexedDB) {
        console.warn("IndexedDB n'est pas disponible pour récupérer les activités")
        resolve([])
        return
      }
      
      // Ouvrir la base de données
      const dbPromise = window.indexedDB.open("SanteTogoDB", 1)
      
      dbPromise.onsuccess = function(event) {
        const db = (event.target as IDBOpenDBRequest).result
        const transaction = db.transaction(["activityLogs"], "readonly")
        const store = transaction.objectStore("activityLogs")
        
        // Récupérer toutes les entrées
        const request = store.getAll()
        
        request.onsuccess = function() {
          let logs = request.result as ActivityLog[]
          
          // Appliquer les filtres si nécessaire
          if (filters) {
            if (filters.userId) {
              logs = logs.filter(log => log.userId === filters.userId)
            }
            
            if (filters.activityType) {
              logs = logs.filter(log => log.activityType === filters.activityType)
            }
            
            if (filters.activityTarget) {
              logs = logs.filter(log => log.activityTarget === filters.activityTarget)
            }
            
            if (filters.startDate) {
              const startDate = new Date(filters.startDate).getTime()
              logs = logs.filter(log => new Date(log.timestamp).getTime() >= startDate)
            }
            
            if (filters.endDate) {
              const endDate = new Date(filters.endDate).getTime()
              logs = logs.filter(log => new Date(log.timestamp).getTime() <= endDate)
            }
          }
          
          // Trier par date (du plus récent au plus ancien)
          logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          
          resolve(logs)
        }
        
        request.onerror = function(error) {
          console.error("Erreur lors de la récupération des journaux d'activité:", error)
          reject(error)
        }
        
        transaction.oncomplete = function() {
          db.close()
        }
      }
      
      dbPromise.onerror = function(error) {
        console.error("Erreur lors de l'ouverture de la base de données:", error)
        reject(error)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des journaux d'activité:", error)
      reject(error)
    }
  })
}

// Fonction pour effacer les journaux d'activité (réservée aux administrateurs)
export async function clearActivityLogs(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    try {
      const currentUser = getCurrentUser()
      
      // Vérifier si l'utilisateur est un administrateur
      if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "ADMIN" && currentUser.role !== "SYSTEM_ADMIN")) {
        console.error("Seuls les administrateurs peuvent effacer les journaux d'activité")
        resolve(false)
        return
      }
      
      // Vérifier si IndexedDB est disponible
      if (typeof window === "undefined" || !window.indexedDB) {
        console.warn("IndexedDB n'est pas disponible pour effacer les activités")
        resolve(false)
        return
      }
      
      // Ouvrir la base de données
      const dbPromise = window.indexedDB.open("SanteTogoDB", 1)
      
      dbPromise.onsuccess = function(event) {
        const db = (event.target as IDBOpenDBRequest).result
        const transaction = db.transaction(["activityLogs"], "readwrite")
        const store = transaction.objectStore("activityLogs")
        
        // Effacer toutes les entrées
        const request = store.clear()
        
        request.onsuccess = function() {
          console.log("Journaux d'activité effacés avec succès")
          
          // Enregistrer cette action d'effacement
          logActivity(
            "DELETE",
            "USER",
            undefined,
            "Effacement de tous les journaux d'activité",
            true
          )
          
          resolve(true)
        }
        
        request.onerror = function(error) {
          console.error("Erreur lors de l'effacement des journaux d'activité:", error)
          resolve(false)
        }
        
        transaction.oncomplete = function() {
          db.close()
        }
      }
      
      dbPromise.onerror = function(error) {
        console.error("Erreur lors de l'ouverture de la base de données:", error)
        resolve(false)
      }
    } catch (error) {
      console.error("Erreur lors de l'effacement des journaux d'activité:", error)
      resolve(false)
    }
  })
}
