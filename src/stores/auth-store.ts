import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Role, Permissions } from '@/types/database'

interface AuthState {
  user: User | null
  role: Role | null
  permissions: Permissions | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setRole: (role: Role | null) => void
  setPermissions: (permissions: Permissions | null) => void
  setIsLoading: (isLoading: boolean) => void
  clearAuth: () => void
  hasPermission: (resource: keyof Permissions, action: string) => boolean
}

const defaultPermissions: Permissions = {
  customers: { view: false, create: false, edit: false, delete: false, assign: false, export: false },
  teams: { view: false, create: false, edit: false, delete: false },
  users: { view: false, create: false, edit: false, delete: false },
  settings: { view: false, edit: false },
  dashboard: { view: false, viewAll: false },
  branches: { view: false, create: false, edit: false, delete: false },
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      permissions: null,
      isLoading: true,

      setUser: (user) => set({ user }),
      setRole: (role) => set({ role }),
      setPermissions: (permissions) => set({ permissions }),
      setIsLoading: (isLoading) => set({ isLoading }),

      clearAuth: () =>
        set({
          user: null,
          role: null,
          permissions: null,
          isLoading: false,
        }),

      hasPermission: (resource, action) => {
        const { permissions, role, user } = get()

        // Super admin has all permissions
        if (role?.name === 'super_admin') {
          return true
        }

        // Check user's permission mode
        const permissionMode = (user as { permission_mode?: 'role_only' | 'custom_only' } | null)?.permission_mode || 'role_only'
        const userPermissions = (user as { permissions?: Permissions | null } | null)?.permissions

        // If custom_only mode and user has custom permissions, use them
        if (permissionMode === 'custom_only' && userPermissions) {
          const customResourcePerms = userPermissions[resource]
          if (!customResourcePerms) {
            return false
          }
          return (customResourcePerms as Record<string, boolean>)[action] || false
        }

        // Default: use role permissions
        if (!permissions) {
          return false
        }

        const resourcePerms = permissions[resource]
        if (!resourcePerms) {
          return false
        }

        return (resourcePerms as Record<string, boolean>)[action] || false
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Don't persist sensitive data
        user: state.user ? { id: state.user.id, name: state.user.name } : null,
      }),
    }
  )
)
