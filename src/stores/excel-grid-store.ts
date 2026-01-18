import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import {
  ExcelGridLayout,
  ExcelGridRow,
  ExcelGridCell,
  createDefaultLayout,
  generateCellId,
  generateRowId,
} from '@/components/customers/excel-grid/types'

interface ExcelGridState {
  // State
  layout: ExcelGridLayout
  isLoading: boolean
  isLoaded: boolean
  isEditMode: boolean

  // Layout Actions
  loadLayout: () => Promise<void>
  saveLayout: (layout?: ExcelGridLayout) => Promise<void>
  resetLayout: () => void
  setLayout: (layout: ExcelGridLayout) => void
  setEditMode: (enabled: boolean) => void

  // Row Actions
  addRow: (afterRowId?: string) => void
  deleteRow: (rowId: string) => void
  moveRow: (rowId: string, direction: 'up' | 'down') => void
  toggleRowVisibility: (rowId: string) => void
  updateRow: (rowId: string, updates: Partial<ExcelGridRow>) => void

  // Cell Actions
  addCell: (rowId: string, afterCellId?: string, cell?: Partial<ExcelGridCell>) => void
  deleteCell: (rowId: string, cellId: string) => void
  updateCell: (rowId: string, cellId: string, updates: Partial<ExcelGridCell>) => void
  duplicateCell: (rowId: string, cellId: string) => void

  // Getters
  getRow: (rowId: string) => ExcelGridRow | undefined
  getCell: (rowId: string, cellId: string) => ExcelGridCell | undefined
  getVisibleRows: () => ExcelGridRow[]
}

const STORAGE_KEY = 'excel_grid_layout'

export const useExcelGridStore = create<ExcelGridState>((set, get) => ({
  layout: createDefaultLayout(),
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
        .eq('key', STORAGE_KEY)
        .single()

      if (!error && data?.value) {
        const savedLayout = data.value as ExcelGridLayout
        // Merge with defaults to handle new fields
        set({ layout: mergeLayoutWithDefaults(savedLayout), isLoading: false, isLoaded: true })
      } else {
        set({ layout: createDefaultLayout(), isLoading: false, isLoaded: true })
      }
    } catch (error) {
      console.error('Failed to load Excel grid layout:', error)
      set({ layout: createDefaultLayout(), isLoading: false, isLoaded: true })
    }
  },

  saveLayout: async (layoutToSave?: ExcelGridLayout) => {
    const layout = layoutToSave || get().layout
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: STORAGE_KEY,
          value: layout,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'key',
        })

      if (error) {
        console.error('Failed to save Excel grid layout:', error)
        throw error
      }

      // Update local state if a new layout was provided
      if (layoutToSave) {
        set({ layout: layoutToSave })
      }
    } catch (error) {
      console.error('Failed to save Excel grid layout:', error)
      throw error
    }
  },

  resetLayout: () => {
    set({ layout: createDefaultLayout() })
  },

  setLayout: (layout) => {
    set({ layout })
  },

  setEditMode: (enabled) => {
    set({ isEditMode: enabled })
  },

  // Row Actions
  addRow: (afterRowId) => {
    set((state) => {
      const newRow: ExcelGridRow = {
        id: generateRowId(),
        cells: [
          { id: generateCellId(), type: 'label', colSpan: 2, content: '레이블', textAlign: 'right' },
          { id: generateCellId(), type: 'input', colSpan: 10, inputType: 'text' },
        ],
        visible: true,
      }

      if (afterRowId) {
        const index = state.layout.rows.findIndex(r => r.id === afterRowId)
        return {
          layout: {
            ...state.layout,
            rows: [
              ...state.layout.rows.slice(0, index + 1),
              newRow,
              ...state.layout.rows.slice(index + 1),
            ],
          },
        }
      }

      return {
        layout: {
          ...state.layout,
          rows: [...state.layout.rows, newRow],
        },
      }
    })
  },

  deleteRow: (rowId) => {
    set((state) => ({
      layout: {
        ...state.layout,
        rows: state.layout.rows.filter(r => r.id !== rowId),
      },
    }))
  },

  moveRow: (rowId, direction) => {
    set((state) => {
      const index = state.layout.rows.findIndex(r => r.id === rowId)
      if (
        (direction === 'up' && index === 0) ||
        (direction === 'down' && index === state.layout.rows.length - 1)
      ) {
        return state
      }

      const newRows = [...state.layout.rows]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      ;[newRows[index], newRows[targetIndex]] = [newRows[targetIndex], newRows[index]]

      return {
        layout: {
          ...state.layout,
          rows: newRows,
        },
      }
    })
  },

  toggleRowVisibility: (rowId) => {
    set((state) => ({
      layout: {
        ...state.layout,
        rows: state.layout.rows.map(r =>
          r.id === rowId ? { ...r, visible: !r.visible } : r
        ),
      },
    }))
  },

  updateRow: (rowId, updates) => {
    set((state) => ({
      layout: {
        ...state.layout,
        rows: state.layout.rows.map(r =>
          r.id === rowId ? { ...r, ...updates } : r
        ),
      },
    }))
  },

  // Cell Actions
  addCell: (rowId, afterCellId, cell) => {
    set((state) => {
      const newCell: ExcelGridCell = {
        id: generateCellId(),
        type: 'input',
        colSpan: 2,
        inputType: 'text',
        ...cell,
      }

      return {
        layout: {
          ...state.layout,
          rows: state.layout.rows.map(r => {
            if (r.id !== rowId) return r

            if (afterCellId) {
              const index = r.cells.findIndex(c => c.id === afterCellId)
              return {
                ...r,
                cells: [
                  ...r.cells.slice(0, index + 1),
                  newCell,
                  ...r.cells.slice(index + 1),
                ],
              }
            }

            return { ...r, cells: [...r.cells, newCell] }
          }),
        },
      }
    })
  },

  deleteCell: (rowId, cellId) => {
    set((state) => ({
      layout: {
        ...state.layout,
        rows: state.layout.rows.map(r =>
          r.id === rowId
            ? { ...r, cells: r.cells.filter(c => c.id !== cellId) }
            : r
        ),
      },
    }))
  },

  updateCell: (rowId, cellId, updates) => {
    set((state) => ({
      layout: {
        ...state.layout,
        rows: state.layout.rows.map(r =>
          r.id === rowId
            ? {
                ...r,
                cells: r.cells.map(c =>
                  c.id === cellId ? { ...c, ...updates } : c
                ),
              }
            : r
        ),
      },
    }))
  },

  duplicateCell: (rowId, cellId) => {
    set((state) => {
      const row = state.layout.rows.find(r => r.id === rowId)
      const cell = row?.cells.find(c => c.id === cellId)
      if (!row || !cell) return state

      const newCell: ExcelGridCell = {
        ...cell,
        id: generateCellId(),
      }

      return {
        layout: {
          ...state.layout,
          rows: state.layout.rows.map(r => {
            if (r.id !== rowId) return r
            const index = r.cells.findIndex(c => c.id === cellId)
            return {
              ...r,
              cells: [
                ...r.cells.slice(0, index + 1),
                newCell,
                ...r.cells.slice(index + 1),
              ],
            }
          }),
        },
      }
    })
  },

  // Getters
  getRow: (rowId) => {
    return get().layout.rows.find(r => r.id === rowId)
  },

  getCell: (rowId, cellId) => {
    const row = get().layout.rows.find(r => r.id === rowId)
    return row?.cells.find(c => c.id === cellId)
  },

  getVisibleRows: () => {
    return get().layout.rows.filter(r => r.visible)
  },
}))

// Helper to merge saved layout with defaults
function mergeLayoutWithDefaults(saved: ExcelGridLayout): ExcelGridLayout {
  const defaults = createDefaultLayout()

  // Keep saved rows if they exist, otherwise use defaults
  if (saved.rows && saved.rows.length > 0) {
    return {
      ...defaults,
      ...saved,
      version: saved.version || defaults.version,
    }
  }

  return defaults
}
