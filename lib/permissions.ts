import type React from "react"
// Définition des rôles disponibles dans l'application
export type UserRole = "patient" | "doctor" | "secretary" | "admin" | "guest"

// Définition des permissions possibles
export type Permission =
  | "view_dashboard"
  | "view_medical_record"
  | "edit_medical_record"
  | "view_appointments"
  | "create_appointment"
  | "edit_appointment"
  | "cancel_appointment"
  | "view_medications"
  | "add_medication"
  | "edit_medication"
  | "view_blood_donation"
  | "create_blood_donation"
  | "view_blood_request"
  | "create_blood_request"
  | "view_patients"
  | "add_patient"
  | "edit_patient"
  | "view_doctors"
  | "admin_access"

// Mapping des permissions par rôle
export const rolePermissions: Record<UserRole, Permission[]> = {
  guest: ["view_dashboard"],
  patient: [
    "view_dashboard",
    "view_medical_record",
    "view_appointments",
    "create_appointment",
    "cancel_appointment",
    "view_medications",
    "view_blood_donation",
    "create_blood_donation",
    "view_blood_request",
    "create_blood_request",
  ],
  doctor: [
    "view_dashboard",
    "view_medical_record",
    "edit_medical_record",
    "view_appointments",
    "create_appointment",
    "edit_appointment",
    "cancel_appointment",
    "view_medications",
    "add_medication",
    "edit_medication",
    "view_blood_donation",
    "view_blood_request",
    "create_blood_request",
    "view_patients",
    "edit_patient",
  ],
  secretary: [
    "view_dashboard",
    "view_medical_record",
    "view_appointments",
    "create_appointment",
    "edit_appointment",
    "cancel_appointment",
    "view_medications",
    "view_blood_donation",
    "view_blood_request",
    "view_patients",
    "add_patient",
  ],
  admin: [
    "view_dashboard",
    "view_medical_record",
    "edit_medical_record",
    "view_appointments",
    "create_appointment",
    "edit_appointment",
    "cancel_appointment",
    "view_medications",
    "add_medication",
    "edit_medication",
    "view_blood_donation",
    "create_blood_donation",
    "view_blood_request",
    "create_blood_request",
    "view_patients",
    "add_patient",
    "edit_patient",
    "view_doctors",
    "admin_access",
  ],
}

// Fonction pour vérifier si un rôle a une permission spécifique
export function hasPermission(role: UserRole | null, permission: Permission): boolean {
  if (!role) return false
  return rolePermissions[role].includes(permission)
}

// Fonction pour vérifier si un rôle a toutes les permissions spécifiées
export function hasAllPermissions(role: UserRole | null, permissions: Permission[]): boolean {
  if (!role) return false
  return permissions.every((permission) => rolePermissions[role].includes(permission))
}

// Fonction pour vérifier si un rôle a au moins une des permissions spécifiées
export function hasAnyPermission(role: UserRole | null, permissions: Permission[]): boolean {
  if (!role) return false
  return permissions.some((permission) => rolePermissions[role].includes(permission))
}

// Composant HOC pour protéger les routes en fonction des permissions
export function withPermission(permission: Permission) {
  return <P,>(Component: React.ComponentType<P>) =>
    function WithPermissionComponent(props: P) {
      const role = localStorage.getItem("userRole") as UserRole | null

      if (!hasPermission(role, permission)) {
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h2>
            <p className="text-gray-600 mb-4">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          </div>
        )
      }

      return <Component {...props} />
    }
}

// Composant pour conditionner l'affichage en fonction des permissions
export function PermissionGuard({
  permission,
  children,
  fallback,
}: {
  permission: Permission
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const role = localStorage.getItem("userRole") as UserRole | null

  if (!hasPermission(role, permission)) {
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}
