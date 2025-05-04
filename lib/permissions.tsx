import type React from "react"

export type UserRole = "patient" | "doctor" | "nurse" | "secretary" | "admin"

export const PERMISSIONS = {
  PATIENT: {
    VIEW_APPOINTMENTS: true,
    CREATE_APPOINTMENT: true,
    CANCEL_APPOINTMENT: true,
    VIEW_MEDICAL_RECORD: true,
    VIEW_MEDICATIONS: true,
    REQUEST_PRESCRIPTION: true,
    VIEW_BLOOD_DONATION: true,
    DONATE_BLOOD: true,
    REQUEST_BLOOD: true,
  },
  DOCTOR: {
    VIEW_APPOINTMENTS: true,
    CREATE_APPOINTMENT: true,
    CANCEL_APPOINTMENT: true,
    APPROVE_APPOINTMENT: true,
    VIEW_MEDICAL_RECORD: true,
    EDIT_MEDICAL_RECORD: true,
    VIEW_MEDICATIONS: true,
    PRESCRIBE_MEDICATION: true,
    VIEW_BLOOD_DONATION: true,
    APPROVE_BLOOD_DONATION: true,
    APPROVE_BLOOD_REQUEST: true,
  },
  NURSE: {
    VIEW_APPOINTMENTS: true,
    VIEW_MEDICAL_RECORD: true,
    VIEW_MEDICATIONS: true,
    ADMINISTER_MEDICATION: true,
    VIEW_BLOOD_DONATION: true,
    COLLECT_BLOOD: true,
    DISTRIBUTE_BLOOD: true,
  },
  SECRETARY: {
    VIEW_APPOINTMENTS: true,
    CREATE_APPOINTMENT: true,
    CANCEL_APPOINTMENT: true,
    RESCHEDULE_APPOINTMENT: true,
    VIEW_PATIENT_LIST: true,
  },
  ADMIN: {
    VIEW_APPOINTMENTS: true,
    CREATE_APPOINTMENT: true,
    CANCEL_APPOINTMENT: true,
    APPROVE_APPOINTMENT: true,
    VIEW_MEDICAL_RECORD: true,
    EDIT_MEDICAL_RECORD: true,
    VIEW_MEDICATIONS: true,
    PRESCRIBE_MEDICATION: true,
    VIEW_BLOOD_DONATION: true,
    APPROVE_BLOOD_DONATION: true,
    APPROVE_BLOOD_REQUEST: true,
    MANAGE_USERS: true,
    MANAGE_ROLES: true,
    VIEW_ANALYTICS: true,
  },
}

export function hasPermission(role: UserRole, permission: string): boolean {
  if (!role || !permission) return false

  const rolePermissions = PERMISSIONS[role.toUpperCase() as keyof typeof PERMISSIONS]
  if (!rolePermissions) return false

  return !!rolePermissions[permission as keyof typeof rolePermissions]
}

export function withPermission<P extends object>(Component: React.ComponentType<P>, permission: string): React.FC<P> {
  return function PermissionGuard(props: P) {
    // Cette fonction sera remplacée par la logique côté client
    return <Component {...props} />
  }
}
