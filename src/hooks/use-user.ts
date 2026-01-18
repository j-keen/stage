'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth-store'
import type { Permissions } from '@/types/database'

export function useUser() {
  const router = useRouter()
  const {
    user,
    role,
    permissions,
    isLoading,
    setUser,
    setRole,
    setPermissions,
    setIsLoading,
    clearAuth,
  } = useAuthStore()

  useEffect(() => {
    const supabase = createClient()

    const fetchUserData = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

        if (authError || !authUser) {
          clearAuth()
          return
        }

        // Fetch user profile with role
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select(`
            *,
            role:roles(*)
          `)
          .eq('auth_id', authUser.id)
          .single()

        if (userError || !userData) {
          console.error('Error fetching user data:', userError)
          clearAuth()
          return
        }

        setUser(userData)
        setRole(userData.role)
        setPermissions(userData.role?.permissions as unknown as Permissions || null)
      } catch (error) {
        console.error('Error in fetchUserData:', error)
        clearAuth()
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_OUT') {
        clearAuth()
        router.push('/login')
      } else if (event === 'SIGNED_IN' && session) {
        fetchUserData()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, setRole, setPermissions, setIsLoading, clearAuth, router])

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    clearAuth()
    router.push('/login')
  }

  return {
    user,
    role,
    permissions,
    isLoading,
    signOut,
    isAuthenticated: !!user,
    isSuperAdmin: role?.name === 'super_admin',
  }
}
