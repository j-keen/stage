export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string
          name: string
          parent_id: string | null
          description: string | null
          memo: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          parent_id?: string | null
          description?: string | null
          memo?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          parent_id?: string | null
          description?: string | null
          memo?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      roles: {
        Row: {
          id: string
          name: string
          permissions: Json
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          permissions: Json
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          permissions?: Json
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          auth_id: string
          username: string
          name: string
          email: string
          role_id: string
          team_id: string | null
          is_active: boolean
          permissions: Json | null
          permission_mode: 'role_only' | 'custom_only'
          memo: string | null
          last_activity_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_id: string
          username: string
          name: string
          email: string
          role_id: string
          team_id?: string | null
          is_active?: boolean
          permissions?: Json | null
          permission_mode?: 'role_only' | 'custom_only'
          memo?: string | null
          last_activity_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_id?: string
          username?: string
          name?: string
          email?: string
          role_id?: string
          team_id?: string | null
          is_active?: boolean
          permissions?: Json | null
          permission_mode?: 'role_only' | 'custom_only'
          memo?: string | null
          last_activity_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      branches: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          primary_color: string
          is_active: boolean
          landing_settings: {
            title?: string
            description?: string
            buttonText?: string
            successMessage?: string
            privacyText?: string
          } | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          logo_url?: string | null
          primary_color?: string
          is_active?: boolean
          landing_settings?: {
            title?: string
            description?: string
            buttonText?: string
            successMessage?: string
            privacyText?: string
          } | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          logo_url?: string | null
          primary_color?: string
          is_active?: boolean
          landing_settings?: {
            title?: string
            description?: string
            buttonText?: string
            successMessage?: string
            privacyText?: string
          } | null
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          phone: string
          name: string | null
          birth_date: string | null
          gender: string | null
          address: string | null
          address_detail: string | null
          occupation: string | null
          income: number | null
          loan_amount: number | null
          loan_purpose: string | null
          existing_loans: number | null
          credit_score: number | null
          status: string
          category: string
          has_overdue: boolean
          has_license: boolean
          has_insurance: boolean
          has_credit_card: boolean
          employment_period: string | null
          required_amount: number | null
          fund_purpose: string | null
          assigned_to: string | null
          branch_id: string
          notes: string | null
          callback_date: string | null
          is_duplicate: boolean
          source: string | null
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          custom_fields: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          phone: string
          name?: string | null
          birth_date?: string | null
          gender?: string | null
          address?: string | null
          address_detail?: string | null
          occupation?: string | null
          income?: number | null
          loan_amount?: number | null
          loan_purpose?: string | null
          existing_loans?: number | null
          credit_score?: number | null
          status?: string
          category?: string
          has_overdue?: boolean
          has_license?: boolean
          has_insurance?: boolean
          has_credit_card?: boolean
          employment_period?: string | null
          required_amount?: number | null
          fund_purpose?: string | null
          assigned_to?: string | null
          branch_id: string
          notes?: string | null
          callback_date?: string | null
          is_duplicate?: boolean
          source?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          custom_fields?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          phone?: string
          name?: string | null
          birth_date?: string | null
          gender?: string | null
          address?: string | null
          address_detail?: string | null
          occupation?: string | null
          income?: number | null
          loan_amount?: number | null
          loan_purpose?: string | null
          existing_loans?: number | null
          credit_score?: number | null
          status?: string
          category?: string
          has_overdue?: boolean
          has_license?: boolean
          has_insurance?: boolean
          has_credit_card?: boolean
          employment_period?: string | null
          required_amount?: number | null
          fund_purpose?: string | null
          assigned_to?: string | null
          branch_id?: string
          notes?: string | null
          callback_date?: string | null
          is_duplicate?: boolean
          source?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          custom_fields?: Json
          created_at?: string
          updated_at?: string
        }
      }
      customer_histories: {
        Row: {
          id: string
          customer_id: string
          user_id: string | null
          field_name: string
          old_value: string | null
          new_value: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          user_id?: string | null
          field_name: string
          old_value?: string | null
          new_value?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          user_id?: string | null
          field_name?: string
          old_value?: string | null
          new_value?: string | null
          created_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          key: string
          value: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          preference_key: string
          preference_value: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          preference_key: string
          preference_value: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          preference_key?: string
          preference_value?: Json
          created_at?: string
          updated_at?: string
        }
      }
      user_activity_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          resource_type: string | null
          resource_id: string | null
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          resource_type?: string | null
          resource_id?: string | null
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          resource_type?: string | null
          resource_id?: string | null
          details?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_duplicate_phone: {
        Args: {
          phone_number: string
        }
        Returns: boolean
      }
    }
    Enums: {
      customer_status: 'prospect' | 'in_progress' | 'completed' | 'callback' | 'absent' | 'cancelled'
      customer_category: 'new_customer' | 'existing' | 'blacklist' | 'vip' | 'duplicate'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenience type aliases
export type Team = Tables<'teams'>
export type Role = Tables<'roles'>
export type User = Tables<'users'>
export type Branch = Tables<'branches'>
export type Customer = Tables<'customers'>
export type CustomerHistory = Tables<'customer_histories'>
export type Setting = Tables<'settings'>
export type UserPreference = Tables<'user_preferences'>
export type UserActivityLog = Tables<'user_activity_logs'>

// Permission types
export interface Permissions {
  customers: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
    assign: boolean
    export: boolean
  }
  teams: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
  }
  users: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
  }
  settings: {
    view: boolean
    edit: boolean
  }
  dashboard: {
    view: boolean
    viewAll: boolean
  }
  branches: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
  }
}

// Customer status type (6 statuses per specification)
export type CustomerStatus = 'prospect' | 'in_progress' | 'completed' | 'callback' | 'absent' | 'cancelled'

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  prospect: '가망고객',
  in_progress: '진행중',
  completed: '완료',
  callback: '재통화',
  absent: '부재',
  cancelled: '취소',
}

export const CUSTOMER_STATUS_COLORS: Record<CustomerStatus, string> = {
  prospect: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  callback: 'bg-purple-100 text-purple-800',
  absent: 'bg-orange-100 text-orange-800',
  cancelled: 'bg-red-100 text-red-800',
}

// Customer category type (4 categories per specification)
export type CustomerCategory = 'new_customer' | 'existing' | 'blacklist' | 'vip'

export const CUSTOMER_CATEGORY_LABELS: Record<CustomerCategory, string> = {
  new_customer: '신규고객',
  existing: '기존고객',
  blacklist: '사고자(블랙)',
  vip: 'VIP',
}

export const CUSTOMER_CATEGORY_COLORS: Record<CustomerCategory, string> = {
  new_customer: 'bg-sky-100 text-sky-800',
  existing: 'bg-gray-100 text-gray-800',
  blacklist: 'bg-red-100 text-red-800',
  vip: 'bg-amber-100 text-amber-800',
}

// Default statuses and categories (for dynamic badge system)
export const DEFAULT_STATUSES = ['prospect', 'in_progress', 'completed', 'callback', 'absent', 'cancelled'] as const
export const DEFAULT_CATEGORIES = ['new_customer', 'existing', 'blacklist', 'vip'] as const

// Custom column types
export type CustomColumnType = 'text' | 'number' | 'date' | 'select' | 'boolean'

export interface CustomColumnConfig {
  id: string
  label: string
  type: CustomColumnType
  options?: string[]
  hidden: boolean
  order: number
}

export interface DynamicBadgeConfig {
  id: string
  label: string
  color: string
  bgColor: string
  hidden: boolean
  order: number
  isDefault?: boolean
}
