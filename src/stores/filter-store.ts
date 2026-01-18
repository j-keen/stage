import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface FilterConfig {
  id: string
  label: string
  type: 'select' | 'date-range' | 'text' | 'number-range' | 'checkbox-group'
  visible: boolean
  order: number
}

interface FilterValues {
  // Multi-select filters (checkbox style) - using string[] for dynamic badges
  statuses: string[]
  categories: string[]
  // Single select filters
  branchId: string | null
  assignedTo: string | null
  search: string
  dateFrom: string | null
  dateTo: string | null
  isDuplicate: boolean | null
  hasCallback: boolean | null
  // Checkbox field filters
  hasLicense: boolean | null
  hasInsurance: boolean | null
  hasCreditCard: boolean | null
  // Range filters
  loanAmountMin: number | null
  loanAmountMax: number | null
  incomeMin: number | null
  incomeMax: number | null
  creditScoreMin: number | null
  creditScoreMax: number | null
  requiredAmountMin: number | null
  requiredAmountMax: number | null
  employmentPeriod: string | null
  // Legacy single status for backward compatibility
  status: string | null
}

interface FilterState {
  filters: FilterConfig[]
  values: FilterValues
  isExpanded: boolean
  setFilters: (filters: FilterConfig[]) => void
  updateFilterVisibility: (id: string, visible: boolean) => void
  updateFilterOrder: (filters: FilterConfig[]) => void
  setValue: <K extends keyof FilterValues>(key: K, value: FilterValues[K]) => void
  setValues: (values: Partial<FilterValues>) => void
  clearFilters: () => void
  setExpanded: (expanded: boolean) => void
}

const defaultFilters: FilterConfig[] = [
  { id: 'search', label: '검색', type: 'text', visible: true, order: 0 },
  { id: 'category', label: '분류', type: 'checkbox-group', visible: true, order: 1 },
  { id: 'status', label: '상태', type: 'checkbox-group', visible: true, order: 2 },
  { id: 'branchId', label: '접수처', type: 'select', visible: true, order: 3 },
  { id: 'assignedTo', label: '담당자', type: 'select', visible: true, order: 4 },
  { id: 'dateRange', label: '등록일', type: 'date-range', visible: true, order: 5 },
  { id: 'hasLicense', label: '면허증유무', type: 'select', visible: true, order: 6 },
  { id: 'hasInsurance', label: '4대보험유무', type: 'select', visible: true, order: 7 },
  { id: 'hasCreditCard', label: '신용카드유무', type: 'select', visible: true, order: 8 },
  { id: 'isDuplicate', label: '중복여부', type: 'select', visible: false, order: 9 },
  { id: 'hasCallback', label: '콜백예정', type: 'select', visible: false, order: 10 },
  { id: 'income', label: '급여', type: 'number-range', visible: true, order: 11 },
  { id: 'requiredAmount', label: '필요자금', type: 'number-range', visible: true, order: 12 },
  { id: 'loanAmount', label: '보유대출', type: 'number-range', visible: true, order: 13 },
  { id: 'employmentPeriod', label: '재직기간', type: 'select', visible: true, order: 14 },
]

const defaultValues: FilterValues = {
  statuses: [],
  categories: [],
  status: null,
  branchId: null,
  assignedTo: null,
  search: '',
  dateFrom: null,
  dateTo: null,
  isDuplicate: null,
  hasCallback: null,
  hasLicense: null,
  hasInsurance: null,
  hasCreditCard: null,
  loanAmountMin: null,
  loanAmountMax: null,
  incomeMin: null,
  incomeMax: null,
  creditScoreMin: null,
  creditScoreMax: null,
  requiredAmountMin: null,
  requiredAmountMax: null,
  employmentPeriod: null,
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      filters: defaultFilters,
      values: defaultValues,
      isExpanded: true,

      setFilters: (filters) => set({ filters }),

      updateFilterVisibility: (id, visible) =>
        set((state) => ({
          filters: state.filters.map((filter) =>
            filter.id === id ? { ...filter, visible } : filter
          ),
        })),

      updateFilterOrder: (filters) => set({ filters }),

      setValue: (key, value) =>
        set((state) => ({
          values: { ...state.values, [key]: value },
        })),

      setValues: (values) =>
        set((state) => ({
          values: { ...state.values, ...values },
        })),

      clearFilters: () => set({ values: defaultValues }),

      setExpanded: (isExpanded) => set({ isExpanded }),
    }),
    {
      name: 'filter-store',
      partialize: (state) => ({
        filters: state.filters,
        isExpanded: state.isExpanded,
        // Don't persist filter values
      }),
    }
  )
)
