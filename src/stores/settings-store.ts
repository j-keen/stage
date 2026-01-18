import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { CustomColumnConfig } from '@/types/database'

export interface BadgeConfig {
  id: string
  label: string
  color: string
  bgColor: string
  hidden: boolean
  order: number
  isDefault?: boolean
  bold?: boolean
}

// Default statuses and categories
export const DEFAULT_STATUS_BADGES: BadgeConfig[] = [
  { id: 'prospect', label: '가망고객', color: '#1E40AF', bgColor: '#DBEAFE', hidden: false, order: 0, isDefault: true },
  { id: 'in_progress', label: '진행중', color: '#B45309', bgColor: '#FEF3C7', hidden: false, order: 1, isDefault: true },
  { id: 'completed', label: '완료', color: '#047857', bgColor: '#D1FAE5', hidden: false, order: 2, isDefault: true },
  { id: 'callback', label: '재통화', color: '#6D28D9', bgColor: '#EDE9FE', hidden: false, order: 3, isDefault: true },
  { id: 'absent', label: '부재', color: '#C2410C', bgColor: '#FFEDD5', hidden: false, order: 4, isDefault: true },
  { id: 'cancelled', label: '취소', color: '#DC2626', bgColor: '#FEE2E2', hidden: false, order: 5, isDefault: true },
]

export const DEFAULT_CATEGORY_BADGES: BadgeConfig[] = [
  { id: 'new_customer', label: '신규고객', color: '#0369A1', bgColor: '#E0F2FE', hidden: false, order: 0, isDefault: true },
  { id: 'existing', label: '기존고객', color: '#4B5563', bgColor: '#F3F4F6', hidden: false, order: 1, isDefault: true },
  { id: 'blacklist', label: '사고자(블랙)', color: '#DC2626', bgColor: '#FEE2E2', hidden: false, order: 2, isDefault: true },
  { id: 'vip', label: 'VIP', color: '#B45309', bgColor: '#FEF3C7', hidden: false, order: 3, isDefault: true },
  { id: 'duplicate', label: '중복', color: '#C2410C', bgColor: '#FFEDD5', hidden: false, order: 4, isDefault: true },
]

const DEFAULT_COLUMN_LABELS: Record<string, string> = {
  category: '분류',
  status: '상태',
  name: '이름',
  phone: '전화번호',
  birth_date: '생년월일',
  gender: '성별',
  address: '주소',
  address_detail: '상세주소',
  occupation: '직업',
  income: '급여',
  employment_period: '재직기간',
  existing_loans: '보유대출',
  loan_amount: '대출희망금액',
  loan_purpose: '대출목적',
  credit_score: '신용점수',
  required_amount: '필요자금',
  fund_purpose: '자금용도',
  has_overdue: '연체유무',
  has_license: '면허증유무',
  has_insurance: '4대보험유무',
  has_credit_card: '신용카드유무',
  assigned_to: '담당자',
  branch_id: '접수처',
  notes: '메모',
  callback_date: '콜백일시',
  created_at: '등록일',
  updated_at: '최종수정일',
}

interface SettingsState {
  // Badge arrays (dynamic)
  statusBadges: BadgeConfig[]
  categoryBadges: BadgeConfig[]

  // Custom columns
  customColumns: CustomColumnConfig[]

  // Column labels
  columnLabels: Record<string, string>

  // Loading state
  isLoading: boolean
  isLoaded: boolean

  // Load/refresh
  loadSettings: () => Promise<void>
  refreshSettings: () => Promise<void>

  // Badge getters (for compatibility)
  getStatusBadge: (statusId: string) => BadgeConfig
  getCategoryBadge: (categoryId: string) => BadgeConfig
  getColumnLabel: (columnId: string) => string

  // Visibility getters
  getVisibleStatuses: () => BadgeConfig[]
  getVisibleCategories: () => BadgeConfig[]
  getAllStatuses: () => BadgeConfig[]
  getAllCategories: () => BadgeConfig[]

  // Custom column getters
  getVisibleCustomColumns: () => CustomColumnConfig[]
  getAllCustomColumns: () => CustomColumnConfig[]

  // Custom column mutations
  toggleCustomColumnVisibility: (columnId: string) => void
  getCustomColumn: (columnId: string) => CustomColumnConfig | undefined
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  statusBadges: DEFAULT_STATUS_BADGES,
  categoryBadges: DEFAULT_CATEGORY_BADGES,
  customColumns: [],
  columnLabels: DEFAULT_COLUMN_LABELS,
  isLoading: false,
  isLoaded: false,

  loadSettings: async () => {
    if (get().isLoaded) return

    set({ isLoading: true })
    const supabase = createClient()

    try {
      const [statusRes, categoryRes, columnRes, customColumnRes] = await Promise.all([
        supabase.from('settings').select('value').eq('key', 'statusBadges').single(),
        supabase.from('settings').select('value').eq('key', 'categoryBadges').single(),
        supabase.from('settings').select('value').eq('key', 'columnLabels').single(),
        supabase.from('settings').select('value').eq('key', 'customColumns').single(),
      ])

      // Merge status badges
      let mergedStatusBadges = [...DEFAULT_STATUS_BADGES]
      if (!statusRes.error && statusRes.data?.value) {
        const loaded = statusRes.data.value as BadgeConfig[]
        if (Array.isArray(loaded)) {
          // Use loaded badges, but ensure defaults exist
          const loadedIds = new Set(loaded.map(b => b.id))
          const defaults = DEFAULT_STATUS_BADGES.filter(d => !loadedIds.has(d.id))
          mergedStatusBadges = [...loaded, ...defaults].sort((a, b) => a.order - b.order)
        }
      }

      // Merge category badges
      let mergedCategoryBadges = [...DEFAULT_CATEGORY_BADGES]
      if (!categoryRes.error && categoryRes.data?.value) {
        const loaded = categoryRes.data.value as BadgeConfig[]
        if (Array.isArray(loaded)) {
          const loadedIds = new Set(loaded.map(b => b.id))
          const defaults = DEFAULT_CATEGORY_BADGES.filter(d => !loadedIds.has(d.id))
          mergedCategoryBadges = [...loaded, ...defaults].sort((a, b) => a.order - b.order)
        }
      }

      // Load custom columns
      let customColumns: CustomColumnConfig[] = []
      if (!customColumnRes.error && customColumnRes.data?.value) {
        const loaded = customColumnRes.data.value as CustomColumnConfig[]
        if (Array.isArray(loaded)) {
          customColumns = loaded.sort((a, b) => a.order - b.order)
        }
      }

      set({
        statusBadges: mergedStatusBadges,
        categoryBadges: mergedCategoryBadges,
        customColumns,
        columnLabels: { ...DEFAULT_COLUMN_LABELS, ...(columnRes.data?.value as Record<string, string> || {}) },
        isLoading: false,
        isLoaded: true,
      })
    } catch (error) {
      console.error('Failed to load settings:', error)
      set({ isLoading: false, isLoaded: true })
    }
  },

  refreshSettings: async () => {
    set({ isLoaded: false })
    await get().loadSettings()
  },

  getStatusBadge: (statusId) => {
    const { statusBadges } = get()
    const badge = statusBadges.find(b => b.id === statusId)
    return badge || {
      id: statusId,
      label: statusId,
      color: '#6B7280',
      bgColor: '#F3F4F6',
      hidden: false,
      order: 999,
    }
  },

  getCategoryBadge: (categoryId) => {
    const { categoryBadges } = get()
    const badge = categoryBadges.find(b => b.id === categoryId)
    return badge || {
      id: categoryId,
      label: categoryId,
      color: '#6B7280',
      bgColor: '#F3F4F6',
      hidden: false,
      order: 999,
    }
  },

  getColumnLabel: (columnId) => {
    const { columnLabels, customColumns } = get()
    // Check custom columns first
    const customCol = customColumns.find(c => c.id === columnId)
    if (customCol) return customCol.label
    return columnLabels[columnId] || DEFAULT_COLUMN_LABELS[columnId] || columnId
  },

  getVisibleStatuses: () => {
    const { statusBadges } = get()
    return statusBadges.filter(b => !b.hidden).sort((a, b) => a.order - b.order)
  },

  getVisibleCategories: () => {
    const { categoryBadges } = get()
    return categoryBadges.filter(b => !b.hidden).sort((a, b) => a.order - b.order)
  },

  getAllStatuses: () => {
    const { statusBadges } = get()
    return [...statusBadges].sort((a, b) => a.order - b.order)
  },

  getAllCategories: () => {
    const { categoryBadges } = get()
    return [...categoryBadges].sort((a, b) => a.order - b.order)
  },

  getVisibleCustomColumns: () => {
    const { customColumns } = get()
    return customColumns.filter(c => !c.hidden).sort((a, b) => a.order - b.order)
  },

  getAllCustomColumns: () => {
    const { customColumns } = get()
    return [...customColumns].sort((a, b) => a.order - b.order)
  },

  toggleCustomColumnVisibility: (columnId: string) => {
    set((state) => ({
      customColumns: state.customColumns.map((col) =>
        col.id === columnId ? { ...col, hidden: !col.hidden } : col
      ),
    }))
  },

  getCustomColumn: (columnId: string) => {
    const { customColumns } = get()
    return customColumns.find((col) => col.id === columnId)
  },
}))

// Legacy exports for backward compatibility
export const ALL_STATUSES = DEFAULT_STATUS_BADGES.map(b => b.id)
export const ALL_CATEGORIES = DEFAULT_CATEGORY_BADGES.map(b => b.id)
