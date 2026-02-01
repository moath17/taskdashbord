/**
 * User roles and permissions configuration
 * See ROLES_AND_PERMISSIONS.md for full documentation
 */

export type UserRole = 'owner' | 'manager' | 'employee';

export const ROLES: Record<UserRole, { labelEn: string; labelAr: string }> = {
  owner: { labelEn: 'Owner', labelAr: 'المالك' },
  manager: { labelEn: 'Admin', labelAr: 'مدير' },
  employee: { labelEn: 'Employee', labelAr: 'موظف' },
};

export const PERMISSIONS = {
  owner: {
    canManageUsers: true,
    canAccessDashboard: false,
    canCreateTasks: false,
    canCreateGoals: false,
    canCreateKpis: false,
    canApprovePlans: false,
  },
  manager: {
    canManageUsers: true,
    canAccessDashboard: true,
    canCreateTasks: true,
    canCreateGoals: true,
    canCreateKpis: true,
    canApprovePlans: true,
  },
  employee: {
    canManageUsers: false,
    canAccessDashboard: true,
    canCreateTasks: false,
    canCreateGoals: false,
    canCreateKpis: false,
    canApprovePlans: false,
  },
} as const;

export function hasPermission(role: UserRole, permission: keyof typeof PERMISSIONS.owner): boolean {
  return PERMISSIONS[role]?.[permission] ?? false;
}

export function getRoleLabel(role: UserRole, lang: 'en' | 'ar'): string {
  return lang === 'ar' ? ROLES[role].labelAr : ROLES[role].labelEn;
}
