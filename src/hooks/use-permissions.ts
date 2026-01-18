'use client'

import { useAuthStore } from '@/stores/auth-store'
import type { Permissions } from '@/types/database'

type PermissionResource = keyof Permissions
type PermissionAction<R extends PermissionResource> = keyof Permissions[R]

export function usePermissions() {
  const { permissions, role, hasPermission } = useAuthStore()

  const isSuperAdmin = role?.name === 'super_admin'

  /**
   * Check if user has a specific permission
   */
  const can = <R extends PermissionResource>(
    resource: R,
    action: PermissionAction<R>
  ): boolean => {
    if (isSuperAdmin) return true
    return hasPermission(resource, action as string)
  }

  /**
   * Check if user can view a resource
   */
  const canView = (resource: PermissionResource): boolean => {
    return can(resource, 'view' as PermissionAction<typeof resource>)
  }

  /**
   * Check if user can create a resource
   */
  const canCreate = (resource: PermissionResource): boolean => {
    return can(resource, 'create' as PermissionAction<typeof resource>)
  }

  /**
   * Check if user can edit a resource
   */
  const canEdit = (resource: PermissionResource): boolean => {
    return can(resource, 'edit' as PermissionAction<typeof resource>)
  }

  /**
   * Check if user can delete a resource
   */
  const canDelete = (resource: PermissionResource): boolean => {
    return can(resource, 'delete' as PermissionAction<typeof resource>)
  }

  /**
   * Get all permissions for a resource
   */
  const getResourcePermissions = <R extends PermissionResource>(
    resource: R
  ): Permissions[R] | null => {
    if (isSuperAdmin) {
      // Return all permissions as true for super admin
      const fullPermissions: Record<string, boolean> = {}
      const resourcePerms = permissions?.[resource]
      if (resourcePerms) {
        Object.keys(resourcePerms).forEach((key) => {
          fullPermissions[key] = true
        })
      }
      return fullPermissions as Permissions[R]
    }
    return permissions?.[resource] || null
  }

  return {
    permissions,
    isSuperAdmin,
    can,
    canView,
    canCreate,
    canEdit,
    canDelete,
    getResourcePermissions,
    // Convenience checks
    canViewCustomers: can('customers', 'view'),
    canEditCustomers: can('customers', 'edit'),
    canDeleteCustomers: can('customers', 'delete'),
    canAssignCustomers: can('customers', 'assign'),
    canExportCustomers: can('customers', 'export'),
    canViewDashboard: can('dashboard', 'view'),
    canViewAllDashboard: can('dashboard', 'viewAll'),
    canViewSettings: can('settings', 'view'),
    canEditSettings: can('settings', 'edit'),
    canViewUsers: can('users', 'view'),
    canManageUsers: can('users', 'create') || can('users', 'edit'),
    canViewTeams: can('teams', 'view'),
    canManageTeams: can('teams', 'create') || can('teams', 'edit'),
    canViewBranches: can('branches', 'view'),
    canManageBranches: can('branches', 'create') || can('branches', 'edit'),
  }
}
