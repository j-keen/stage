import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ColumnConfig {
  id: string
  label: string
  width: number
  visible: boolean
  order: number
  // For custom columns
  type?: 'text' | 'number' | 'date' | 'select' | 'boolean'
  options?: string[]
}

// 정렬 가능한 컬럼 (날짜/숫자 타입만)
export const SORTABLE_COLUMNS = [
  'created_at',
  'updated_at',
  'callback_date',
  'income',
  'credit_score',
  'loan_amount',
  'required_amount',
  'existing_loans',
] as const

export type SortableColumn = typeof SORTABLE_COLUMNS[number]

export type TableDensity = 'compact' | 'normal' | 'comfortable'

interface TableState {
  columns: ColumnConfig[]
  sortBy: string
  sortOrder: 'asc' | 'desc'
  isColumnEditMode: boolean
  density: TableDensity
  setColumns: (columns: ColumnConfig[]) => void
  updateColumnWidth: (id: string, width: number) => void
  updateColumnVisibility: (id: string, visible: boolean) => void
  updateColumnOrder: (columns: ColumnConfig[]) => void
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  setColumnEditMode: (mode: boolean) => void
  setDensity: (density: TableDensity) => void
  resetColumns: () => void
}

const defaultColumns: ColumnConfig[] = [
  { id: 'category', label: '분류', width: 100, visible: true, order: 0 },
  { id: 'status', label: '상태', width: 90, visible: true, order: 1 },
  { id: 'name', label: '이름', width: 100, visible: true, order: 2 },
  { id: 'phone', label: '전화번호', width: 130, visible: true, order: 3 },
  { id: 'existing_loans', label: '보유대출', width: 110, visible: true, order: 4 },
  { id: 'income', label: '급여', width: 100, visible: true, order: 5 },
  { id: 'employment_period', label: '재직기간', width: 90, visible: true, order: 6 },
  { id: 'required_amount', label: '필요자금', width: 110, visible: true, order: 7 },
  { id: 'has_license', label: '면허증', width: 70, visible: true, order: 8 },
  { id: 'has_insurance', label: '4대보험', width: 80, visible: true, order: 9 },
  { id: 'has_credit_card', label: '신용카드', width: 80, visible: true, order: 10 },
  { id: 'assigned_to', label: '담당자', width: 90, visible: true, order: 11 },
  { id: 'updated_at', label: '최종수정일', width: 100, visible: true, order: 12 },
  { id: 'address', label: '주소', width: 150, visible: true, order: 13 },
  { id: 'branch_id', label: '접수처', width: 100, visible: false, order: 14 },
  { id: 'callback_date', label: '콜백일시', width: 140, visible: false, order: 15 },
  { id: 'created_at', label: '등록일', width: 100, visible: false, order: 16 },
  { id: 'loan_amount', label: '대출희망금액', width: 120, visible: false, order: 17 },
  { id: 'credit_score', label: '신용점수', width: 90, visible: false, order: 18 },
  { id: 'occupation', label: '직업', width: 100, visible: false, order: 19 },
  { id: 'notes', label: '메모', width: 200, visible: false, order: 20 },
  { id: 'birth_date', label: '생년월일', width: 100, visible: false, order: 21 },
  { id: 'gender', label: '성별', width: 70, visible: false, order: 22 },
  { id: 'fund_purpose', label: '자금용도', width: 120, visible: false, order: 23 },
  { id: 'has_overdue', label: '연체유무', width: 80, visible: false, order: 24 },
  // 예비 컬럼
  { id: 'custom1', label: '예비1', width: 100, visible: false, order: 25 },
  { id: 'custom2', label: '예비2', width: 100, visible: false, order: 26 },
  { id: 'custom3', label: '예비3', width: 100, visible: false, order: 27 },
  { id: 'custom4', label: '예비4', width: 100, visible: false, order: 28 },
  { id: 'custom5', label: '예비5', width: 100, visible: false, order: 29 },
]

export const useTableStore = create<TableState>()(
  persist(
    (set) => ({
      columns: defaultColumns,
      sortBy: 'created_at',
      sortOrder: 'desc',
      isColumnEditMode: false,
      density: 'compact' as TableDensity,

      setColumns: (columns) => set({ columns }),

      updateColumnWidth: (id, width) =>
        set((state) => ({
          columns: state.columns.map((col) =>
            col.id === id ? { ...col, width } : col
          ),
        })),

      updateColumnVisibility: (id, visible) =>
        set((state) => ({
          columns: state.columns.map((col) =>
            col.id === id ? { ...col, visible } : col
          ),
        })),

      updateColumnOrder: (columns) => set({ columns }),

      setSorting: (sortBy, sortOrder) => set({ sortBy, sortOrder }),

      setColumnEditMode: (mode) => set({ isColumnEditMode: mode }),

      setDensity: (density) => set({ density }),

      resetColumns: () => set({ columns: defaultColumns }),
    }),
    {
      name: 'table-store',
    }
  )
)
