import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

export interface FieldConfig {
  id: string
  label: string
  visible: boolean
  order: number
}

export interface SectionConfig {
  id: string
  title: string
  icon?: string
  fields: FieldConfig[]
  visible: boolean
  order: number
}

export interface ModalLayoutConfig {
  sections: SectionConfig[]
  gridLayout: GridLayoutItem[]
  version: number
}

// react-grid-layout용 타입
export interface GridLayoutItem {
  i: string      // 섹션 ID
  x: number      // 그리드 X 위치 (0-11)
  y: number      // 그리드 Y 위치
  w: number      // 너비 (그리드 단위)
  h: number      // 높이 (그리드 단위)
  minW?: number  // 최소 너비
  minH?: number  // 최소 높이
  maxW?: number  // 최대 너비
  maxH?: number  // 최대 높이
}

// 기본 그리드 레이아웃 (12컬럼 기준)
const DEFAULT_GRID_LAYOUT: GridLayoutItem[] = [
  { i: 'basic-info', x: 0, y: 0, w: 4, h: 4, minW: 3, minH: 2 },
  { i: 'loan-info', x: 4, y: 0, w: 4, h: 4, minW: 3, minH: 2 },
  { i: 'assignment-info', x: 8, y: 0, w: 4, h: 4, minW: 3, minH: 2 },
  { i: 'employment-info', x: 0, y: 4, w: 4, h: 3, minW: 3, minH: 2 },
  { i: 'status-info', x: 4, y: 4, w: 4, h: 3, minW: 3, minH: 2 },
  { i: 'notes', x: 8, y: 4, w: 4, h: 3, minW: 3, minH: 2 },
  { i: 'custom-fields', x: 0, y: 7, w: 12, h: 3, minW: 4, minH: 2 },
]

// Default layout configuration
const DEFAULT_LAYOUT: ModalLayoutConfig = {
  sections: [
    {
      id: 'basic-info',
      title: '기본 정보',
      icon: 'user',
      visible: true,
      order: 0,
      fields: [
        { id: 'name', label: '이름', visible: true, order: 0 },
        { id: 'category', label: '분류', visible: true, order: 1 },
        { id: 'status', label: '상태', visible: true, order: 2 },
        { id: 'birth_date', label: '생년월일', visible: true, order: 3 },
        { id: 'gender', label: '성별', visible: true, order: 4 },
        { id: 'address', label: '주소', visible: true, order: 5 },
      ],
    },
    {
      id: 'loan-info',
      title: '대출 정보',
      icon: 'wallet',
      visible: true,
      order: 1,
      fields: [
        { id: 'existing_loans', label: '보유대출 (만원)', visible: true, order: 0 },
        { id: 'credit_score', label: '신용점수', visible: true, order: 1 },
        { id: 'required_amount', label: '필요자금 (만원)', visible: true, order: 2 },
        { id: 'loan_amount', label: '희망금액', visible: true, order: 3 },
        { id: 'fund_purpose', label: '자금용도', visible: true, order: 4 },
      ],
    },
    {
      id: 'assignment-info',
      title: '배정 정보',
      icon: 'building',
      visible: true,
      order: 2,
      fields: [
        { id: 'assigned_to', label: '담당자', visible: true, order: 0 },
        { id: 'branch_id', label: '접수처', visible: true, order: 1 },
        { id: 'callback_date', label: '콜백 일시', visible: true, order: 2 },
      ],
    },
    {
      id: 'employment-info',
      title: '직장 정보',
      icon: 'briefcase',
      visible: true,
      order: 3,
      fields: [
        { id: 'occupation', label: '직업', visible: true, order: 0 },
        { id: 'income', label: '급여 (만원)', visible: true, order: 1 },
        { id: 'employment_period', label: '재직기간', visible: true, order: 2 },
        { id: 'loan_purpose', label: '대출 목적', visible: true, order: 3 },
      ],
    },
    {
      id: 'status-info',
      title: '보유 현황',
      icon: 'shield',
      visible: true,
      order: 4,
      fields: [
        { id: 'has_overdue', label: '연체', visible: true, order: 0 },
        { id: 'has_license', label: '면허증', visible: true, order: 1 },
        { id: 'has_insurance', label: '4대보험', visible: true, order: 2 },
        { id: 'has_credit_card', label: '신용카드', visible: true, order: 3 },
      ],
    },
    {
      id: 'notes',
      title: '메모',
      icon: 'file-text',
      visible: true,
      order: 5,
      fields: [
        { id: 'notes', label: '메모', visible: true, order: 0 },
      ],
    },
    {
      id: 'custom-fields',
      title: '커스텀 필드',
      icon: 'plus-square',
      visible: true,
      order: 6,
      fields: [],
    },
  ],
  gridLayout: DEFAULT_GRID_LAYOUT,
  version: 1,
}

interface ModalLayoutState {
  layout: ModalLayoutConfig
  isLoading: boolean
  isLoaded: boolean
  isEditMode: boolean

  // Actions
  loadLayout: () => Promise<void>
  saveLayout: () => Promise<void>
  resetLayout: () => void
  setEditMode: (enabled: boolean) => void

  // Field operations
  updateFieldLabel: (sectionId: string, fieldId: string, label: string) => void
  updateFieldVisibility: (sectionId: string, fieldId: string, visible: boolean) => void
  reorderFields: (sectionId: string, fieldIds: string[]) => void

  // Section operations
  updateSectionTitle: (sectionId: string, title: string) => void
  updateSectionVisibility: (sectionId: string, visible: boolean) => void
  reorderSections: (sectionIds: string[]) => void

  // Grid layout operations
  updateGridLayout: (newLayout: GridLayoutItem[]) => void
  resetGridLayout: () => void

  // Getters
  getFieldLabel: (sectionId: string, fieldId: string) => string
  getSection: (sectionId: string) => SectionConfig | undefined
  getVisibleFields: (sectionId: string) => FieldConfig[]
  getGridLayout: () => GridLayoutItem[]
}

export const useModalLayoutStore = create<ModalLayoutState>((set, get) => ({
  layout: DEFAULT_LAYOUT,
  isLoading: false,
  isLoaded: false,
  isEditMode: false,

  loadLayout: async () => {
    if (get().isLoaded) return

    set({ isLoading: true })
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'modal_layout')
        .single()

      if (!error && data?.value) {
        const savedLayout = data.value as ModalLayoutConfig
        // Merge with defaults to handle new fields
        const mergedLayout = mergeLayoutWithDefaults(savedLayout, DEFAULT_LAYOUT)
        set({ layout: mergedLayout, isLoading: false, isLoaded: true })
      } else {
        set({ layout: DEFAULT_LAYOUT, isLoading: false, isLoaded: true })
      }
    } catch (error) {
      console.error('Failed to load modal layout:', error)
      set({ layout: DEFAULT_LAYOUT, isLoading: false, isLoaded: true })
    }
  },

  saveLayout: async () => {
    const { layout } = get()
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'modal_layout',
          value: layout,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'key',
        })

      if (error) {
        console.error('Failed to save modal layout:', error)
      }
    } catch (error) {
      console.error('Failed to save modal layout:', error)
    }
  },

  resetLayout: () => {
    set({ layout: DEFAULT_LAYOUT })
  },

  setEditMode: (enabled) => {
    set({ isEditMode: enabled })
  },

  updateFieldLabel: (sectionId, fieldId, label) => {
    set((state) => ({
      layout: {
        ...state.layout,
        sections: state.layout.sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                fields: section.fields.map((field) =>
                  field.id === fieldId ? { ...field, label } : field
                ),
              }
            : section
        ),
      },
    }))
  },

  updateFieldVisibility: (sectionId, fieldId, visible) => {
    set((state) => ({
      layout: {
        ...state.layout,
        sections: state.layout.sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                fields: section.fields.map((field) =>
                  field.id === fieldId ? { ...field, visible } : field
                ),
              }
            : section
        ),
      },
    }))
  },

  reorderFields: (sectionId, fieldIds) => {
    set((state) => ({
      layout: {
        ...state.layout,
        sections: state.layout.sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                fields: fieldIds.map((id, index) => {
                  const field = section.fields.find((f) => f.id === id)
                  return field ? { ...field, order: index } : null
                }).filter(Boolean) as FieldConfig[],
              }
            : section
        ),
      },
    }))
  },

  updateSectionTitle: (sectionId, title) => {
    set((state) => ({
      layout: {
        ...state.layout,
        sections: state.layout.sections.map((section) =>
          section.id === sectionId ? { ...section, title } : section
        ),
      },
    }))
  },

  updateSectionVisibility: (sectionId, visible) => {
    set((state) => ({
      layout: {
        ...state.layout,
        sections: state.layout.sections.map((section) =>
          section.id === sectionId ? { ...section, visible } : section
        ),
      },
    }))
  },

  reorderSections: (sectionIds) => {
    set((state) => ({
      layout: {
        ...state.layout,
        sections: sectionIds.map((id, index) => {
          const section = state.layout.sections.find((s) => s.id === id)
          return section ? { ...section, order: index } : null
        }).filter(Boolean) as SectionConfig[],
      },
    }))
  },

  getFieldLabel: (sectionId, fieldId) => {
    const section = get().layout.sections.find((s) => s.id === sectionId)
    const field = section?.fields.find((f) => f.id === fieldId)
    return field?.label || fieldId
  },

  getSection: (sectionId) => {
    return get().layout.sections.find((s) => s.id === sectionId)
  },

  getVisibleFields: (sectionId) => {
    const section = get().layout.sections.find((s) => s.id === sectionId)
    return section?.fields.filter((f) => f.visible).sort((a, b) => a.order - b.order) || []
  },

  updateGridLayout: (newLayout) => {
    set((state) => ({
      layout: {
        ...state.layout,
        gridLayout: newLayout,
      },
    }))
  },

  resetGridLayout: () => {
    set((state) => ({
      layout: {
        ...state.layout,
        gridLayout: DEFAULT_GRID_LAYOUT,
      },
    }))
  },

  getGridLayout: () => {
    return get().layout.gridLayout || DEFAULT_GRID_LAYOUT
  },
}))

// Helper to merge saved layout with defaults (handles new fields)
function mergeLayoutWithDefaults(
  saved: ModalLayoutConfig,
  defaults: ModalLayoutConfig
): ModalLayoutConfig {
  const mergedSections = defaults.sections.map((defaultSection) => {
    const savedSection = saved.sections.find((s) => s.id === defaultSection.id)
    if (!savedSection) return defaultSection

    // Merge fields
    const mergedFields = defaultSection.fields.map((defaultField) => {
      const savedField = savedSection.fields.find((f) => f.id === defaultField.id)
      return savedField || defaultField
    })

    return {
      ...defaultSection,
      ...savedSection,
      fields: mergedFields,
    }
  })

  // Merge grid layout - use saved if exists, otherwise default
  const mergedGridLayout = saved.gridLayout && saved.gridLayout.length > 0
    ? saved.gridLayout
    : defaults.gridLayout

  return {
    sections: mergedSections,
    gridLayout: mergedGridLayout,
    version: saved.version || defaults.version,
  }
}
