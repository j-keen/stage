'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, RotateCcw, EyeOff, Plus, Trash2 } from 'lucide-react'
import { BadgeEditModal } from '@/components/settings/badge-edit-modal'
import { BadgeAddModal } from '@/components/settings/badge-add-modal'
import { ColumnEditModal } from '@/components/settings/column-edit-modal'
import { ColumnAddModal } from '@/components/settings/column-add-modal'
import { useTableStore, type ColumnConfig } from '@/stores/table-store'
import {
  useSettingsStore,
  DEFAULT_STATUS_BADGES,
  DEFAULT_CATEGORY_BADGES,
  type BadgeConfig,
} from '@/stores/settings-store'
import { cn } from '@/lib/utils'
import type { CustomColumnConfig, CustomColumnType } from '@/types/database'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

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

export default function DisplaySettingsPage() {
  const [columnLabels, setColumnLabels] = useState<Record<string, string>>(DEFAULT_COLUMN_LABELS)
  const [statusBadges, setStatusBadges] = useState<BadgeConfig[]>(DEFAULT_STATUS_BADGES)
  const [categoryBadges, setCategoryBadges] = useState<BadgeConfig[]>(DEFAULT_CATEGORY_BADGES)
  const [customColumns, setCustomColumns] = useState<CustomColumnConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Column Modals
  const [selectedColumn, setSelectedColumn] = useState<ColumnConfig | null>(null)
  const [columnModalOpen, setColumnModalOpen] = useState(false)
  const [columnAddModalOpen, setColumnAddModalOpen] = useState(false)

  // Status Badge Modals
  const [selectedStatusBadge, setSelectedStatusBadge] = useState<BadgeConfig | null>(null)
  const [statusBadgeModalOpen, setStatusBadgeModalOpen] = useState(false)
  const [statusBadgeAddModalOpen, setStatusBadgeAddModalOpen] = useState(false)

  // Category Badge Modals
  const [selectedCategoryBadge, setSelectedCategoryBadge] = useState<BadgeConfig | null>(null)
  const [categoryBadgeModalOpen, setCategoryBadgeModalOpen] = useState(false)
  const [categoryBadgeAddModalOpen, setCategoryBadgeAddModalOpen] = useState(false)

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'status' | 'category' | 'column'; id: string } | null>(null)

  // Router
  const router = useRouter()

  // Table store
  const { columns, updateColumnVisibility, resetColumns } = useTableStore()
  const { refreshSettings } = useSettingsStore()

  useEffect(() => {
    const fetchSettings = async () => {
      const supabase = createClient()

      const [columnRes, statusRes, categoryRes, customColumnRes] = await Promise.all([
        supabase.from('settings').select('value').eq('key', 'columnLabels').single(),
        supabase.from('settings').select('value').eq('key', 'statusBadges').single(),
        supabase.from('settings').select('value').eq('key', 'categoryBadges').single(),
        supabase.from('settings').select('value').eq('key', 'customColumns').single(),
      ])

      if (!columnRes.error && columnRes.data) {
        setColumnLabels({ ...DEFAULT_COLUMN_LABELS, ...(columnRes.data.value as Record<string, string>) })
      }

      if (!statusRes.error && statusRes.data) {
        const loaded = statusRes.data.value as BadgeConfig[]
        if (Array.isArray(loaded)) {
          const loadedIds = new Set(loaded.map(b => b.id))
          const defaults = DEFAULT_STATUS_BADGES.filter(d => !loadedIds.has(d.id))
          setStatusBadges([...loaded, ...defaults].sort((a, b) => a.order - b.order))
        }
      }

      if (!categoryRes.error && categoryRes.data) {
        const loaded = categoryRes.data.value as BadgeConfig[]
        if (Array.isArray(loaded)) {
          const loadedIds = new Set(loaded.map(b => b.id))
          const defaults = DEFAULT_CATEGORY_BADGES.filter(d => !loadedIds.has(d.id))
          setCategoryBadges([...loaded, ...defaults].sort((a, b) => a.order - b.order))
        }
      }

      if (!customColumnRes.error && customColumnRes.data) {
        const loaded = customColumnRes.data.value as CustomColumnConfig[]
        if (Array.isArray(loaded)) {
          setCustomColumns(loaded.sort((a, b) => a.order - b.order))
        }
      }

      setIsLoading(false)
    }

    fetchSettings()
  }, [])

  const handleReset = async () => {
    const supabase = createClient()

    setColumnLabels(DEFAULT_COLUMN_LABELS)
    setStatusBadges(DEFAULT_STATUS_BADGES)
    setCategoryBadges(DEFAULT_CATEGORY_BADGES)
    setCustomColumns([])
    resetColumns()

    await Promise.all([
      supabase.from('settings').upsert({ key: 'columnLabels', value: DEFAULT_COLUMN_LABELS }, { onConflict: 'key' }),
      supabase.from('settings').upsert({ key: 'statusBadges', value: DEFAULT_STATUS_BADGES }, { onConflict: 'key' }),
      supabase.from('settings').upsert({ key: 'categoryBadges', value: DEFAULT_CATEGORY_BADGES }, { onConflict: 'key' }),
      supabase.from('settings').upsert({ key: 'customColumns', value: [] }, { onConflict: 'key' }),
    ])

    await refreshSettings()
    router.refresh()
    toast.success('초기화되었습니다')
  }

  // Column handlers
  const handleColumnClick = (column: ColumnConfig) => {
    setSelectedColumn(column)
    setColumnModalOpen(true)
  }

  const handleColumnSave = async (label: string, visible: boolean) => {
    if (!selectedColumn) return

    const newLabels = { ...columnLabels, [selectedColumn.id]: label }
    setColumnLabels(newLabels)
    updateColumnVisibility(selectedColumn.id, visible)

    const supabase = createClient()
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'columnLabels', value: newLabels }, { onConflict: 'key' })

    if (error) {
      toast.error('저장 실패')
    } else {
      toast.success('적용되었습니다')
      await refreshSettings()
      router.refresh()
    }
  }

  const handleColumnAdd = async (column: { label: string; type: CustomColumnType; options?: string[] }) => {
    const id = `custom_${Date.now()}`
    const newColumn: CustomColumnConfig = {
      id,
      label: column.label,
      type: column.type,
      options: column.options,
      hidden: false,
      order: customColumns.length,
    }
    const newColumns = [...customColumns, newColumn]
    const newLabels = { ...columnLabels, [id]: column.label }
    setCustomColumns(newColumns)
    setColumnLabels(newLabels)

    const supabase = createClient()
    await Promise.all([
      supabase.from('settings').upsert({ key: 'customColumns', value: newColumns }, { onConflict: 'key' }),
      supabase.from('settings').upsert({ key: 'columnLabels', value: newLabels }, { onConflict: 'key' }),
    ])

    toast.success('커스텀 컬럼이 추가되었습니다')
    await refreshSettings()
    router.refresh()
  }

  const handleColumnDelete = (id: string) => {
    setDeleteTarget({ type: 'column', id })
    setDeleteConfirmOpen(true)
  }

  // Status badge handlers
  const handleStatusBadgeClick = (badge: BadgeConfig) => {
    setSelectedStatusBadge(badge)
    setStatusBadgeModalOpen(true)
  }

  const handleStatusBadgeSave = async (updatedBadge: BadgeConfig) => {
    const newBadges = statusBadges.map(b =>
      b.id === updatedBadge.id ? updatedBadge : b
    )
    setStatusBadges(newBadges)

    const supabase = createClient()
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'statusBadges', value: newBadges }, { onConflict: 'key' })

    if (error) {
      toast.error('저장 실패')
    } else {
      toast.success('적용되었습니다')
      await refreshSettings()
      router.refresh()
    }
  }

  const handleStatusBadgeAdd = async (badge: { id: string; label: string; color: string; bgColor: string; bold?: boolean }) => {
    const newBadge: BadgeConfig = {
      ...badge,
      hidden: false,
      order: statusBadges.length,
      isDefault: false,
    }
    const newBadges = [...statusBadges, newBadge]
    setStatusBadges(newBadges)

    const supabase = createClient()
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'statusBadges', value: newBadges }, { onConflict: 'key' })

    if (error) {
      toast.error('저장 실패')
    } else {
      toast.success('상태 뱃지가 추가되었습니다')
      await refreshSettings()
      router.refresh()
    }
  }

  const handleStatusBadgeDelete = (id: string) => {
    setDeleteTarget({ type: 'status', id })
    setDeleteConfirmOpen(true)
  }

  // Category badge handlers
  const handleCategoryBadgeClick = (badge: BadgeConfig) => {
    setSelectedCategoryBadge(badge)
    setCategoryBadgeModalOpen(true)
  }

  const handleCategoryBadgeSave = async (updatedBadge: BadgeConfig) => {
    const newBadges = categoryBadges.map(b =>
      b.id === updatedBadge.id ? updatedBadge : b
    )
    setCategoryBadges(newBadges)

    const supabase = createClient()
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'categoryBadges', value: newBadges }, { onConflict: 'key' })

    if (error) {
      toast.error('저장 실패')
    } else {
      toast.success('적용되었습니다')
      await refreshSettings()
      router.refresh()
    }
  }

  const handleCategoryBadgeAdd = async (badge: { id: string; label: string; color: string; bgColor: string; bold?: boolean }) => {
    const newBadge: BadgeConfig = {
      ...badge,
      hidden: false,
      order: categoryBadges.length,
      isDefault: false,
    }
    const newBadges = [...categoryBadges, newBadge]
    setCategoryBadges(newBadges)

    const supabase = createClient()
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'categoryBadges', value: newBadges }, { onConflict: 'key' })

    if (error) {
      toast.error('저장 실패')
    } else {
      toast.success('분류 뱃지가 추가되었습니다')
      await refreshSettings()
      router.refresh()
    }
  }

  const handleCategoryBadgeDelete = (id: string) => {
    setDeleteTarget({ type: 'category', id })
    setDeleteConfirmOpen(true)
  }

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    const supabase = createClient()

    if (deleteTarget.type === 'status') {
      const badge = statusBadges.find(b => b.id === deleteTarget.id)
      if (badge?.isDefault) {
        toast.error('기본 상태는 삭제할 수 없습니다')
        return
      }
      const newBadges = statusBadges.filter(b => b.id !== deleteTarget.id)
      setStatusBadges(newBadges)
      await supabase.from('settings').upsert({ key: 'statusBadges', value: newBadges }, { onConflict: 'key' })
      toast.success('상태 뱃지가 삭제되었습니다')
    } else if (deleteTarget.type === 'category') {
      const badge = categoryBadges.find(b => b.id === deleteTarget.id)
      if (badge?.isDefault) {
        toast.error('기본 분류는 삭제할 수 없습니다')
        return
      }
      const newBadges = categoryBadges.filter(b => b.id !== deleteTarget.id)
      setCategoryBadges(newBadges)
      await supabase.from('settings').upsert({ key: 'categoryBadges', value: newBadges }, { onConflict: 'key' })
      toast.success('분류 뱃지가 삭제되었습니다')
    } else if (deleteTarget.type === 'column') {
      const newColumns = customColumns.filter(c => c.id !== deleteTarget.id)
      setCustomColumns(newColumns)
      const { [deleteTarget.id]: _, ...rest } = columnLabels
      setColumnLabels(rest)
      await Promise.all([
        supabase.from('settings').upsert({ key: 'customColumns', value: newColumns }, { onConflict: 'key' }),
        supabase.from('settings').upsert({ key: 'columnLabels', value: rest }, { onConflict: 'key' }),
      ])
      toast.success('커스텀 컬럼이 삭제되었습니다')
    }

    await refreshSettings()
    router.refresh()
    setDeleteConfirmOpen(false)
    setDeleteTarget(null)
  }

  // Sort columns by order
  const sortedColumns = [...columns].sort((a, b) => a.order - b.order)

  // Split badges into active/inactive
  const activeStatusBadges = useMemo(() => statusBadges.filter(b => !b.hidden), [statusBadges])
  const inactiveStatusBadges = useMemo(() => statusBadges.filter(b => b.hidden), [statusBadges])
  const activeCategoryBadges = useMemo(() => categoryBadges.filter(b => !b.hidden), [categoryBadges])
  const inactiveCategoryBadges = useMemo(() => categoryBadges.filter(b => b.hidden), [categoryBadges])

  // Split custom columns into active/inactive
  const activeCustomColumns = useMemo(() => customColumns.filter(c => !c.hidden), [customColumns])
  const inactiveCustomColumns = useMemo(() => customColumns.filter(c => c.hidden), [customColumns])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">표시 설정</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            컬럼과 뱃지를 관리합니다. 클릭하여 편집하면 자동 저장됩니다.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="h-3 w-3 mr-1" />
          초기화
        </Button>
      </div>

      {/* Main Grid - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Badges */}
        <div className="space-y-4">
          {/* Status Badges */}
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">상태 뱃지</h3>
              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setStatusBadgeAddModalOpen(true)}>
                <Plus className="h-3 w-3 mr-1" />
                추가
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeStatusBadges.map((badge) => (
                <div key={badge.id} className="group relative">
                  <button
                    onClick={() => handleStatusBadgeClick(badge)}
                    className="transition-all hover:scale-105"
                  >
                    <span
                      className={cn(
                        "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs",
                        badge.bold ? "font-bold" : "font-medium"
                      )}
                      style={{ backgroundColor: badge.bgColor, color: badge.color }}
                    >
                      {badge.label}
                    </span>
                  </button>
                  {!badge.isDefault && (
                    <button
                      onClick={() => handleStatusBadgeDelete(badge.id)}
                      className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Trash2 className="h-2 w-2" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {inactiveStatusBadges.length > 0 && (
              <div className="mt-2 pt-2 border-t">
                <p className="text-[10px] text-muted-foreground mb-1">숨김</p>
                <div className="flex flex-wrap gap-1">
                  {inactiveStatusBadges.map((badge) => (
                    <button
                      key={badge.id}
                      onClick={() => handleStatusBadgeClick(badge)}
                      className="opacity-40 hover:opacity-60 transition-opacity"
                    >
                      <span
                        className={cn(
                          "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs",
                          badge.bold ? "font-bold" : "font-medium"
                        )}
                        style={{ backgroundColor: badge.bgColor, color: badge.color }}
                      >
                        <EyeOff className="h-2 w-2 mr-0.5" />
                        {badge.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Category Badges */}
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">분류 뱃지</h3>
              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setCategoryBadgeAddModalOpen(true)}>
                <Plus className="h-3 w-3 mr-1" />
                추가
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeCategoryBadges.map((badge) => (
                <div key={badge.id} className="group relative">
                  <button
                    onClick={() => handleCategoryBadgeClick(badge)}
                    className="transition-all hover:scale-105"
                  >
                    <span
                      className={cn(
                        "inline-flex items-center whitespace-nowrap rounded border-l-[3px] px-1.5 py-0.5 text-xs",
                        badge.bold ? "font-bold" : "font-medium"
                      )}
                      style={{ borderLeftColor: badge.color, backgroundColor: badge.bgColor, color: badge.color }}
                    >
                      {badge.label}
                    </span>
                  </button>
                  {!badge.isDefault && (
                    <button
                      onClick={() => handleCategoryBadgeDelete(badge.id)}
                      className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Trash2 className="h-2 w-2" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {inactiveCategoryBadges.length > 0 && (
              <div className="mt-2 pt-2 border-t">
                <p className="text-[10px] text-muted-foreground mb-1">숨김</p>
                <div className="flex flex-wrap gap-1">
                  {inactiveCategoryBadges.map((badge) => (
                    <button
                      key={badge.id}
                      onClick={() => handleCategoryBadgeClick(badge)}
                      className="opacity-40 hover:opacity-60 transition-opacity"
                    >
                      <span
                        className={cn(
                          "inline-flex items-center whitespace-nowrap rounded border-l-[3px] px-1.5 py-0.5 text-xs",
                          badge.bold ? "font-bold" : "font-medium"
                        )}
                        style={{ borderLeftColor: badge.color, backgroundColor: badge.bgColor, color: badge.color }}
                      >
                        <EyeOff className="h-2 w-2 mr-0.5" />
                        {badge.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Custom Columns */}
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">커스텀 컬럼</h3>
              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setColumnAddModalOpen(true)}>
                <Plus className="h-3 w-3 mr-1" />
                추가
              </Button>
            </div>
            {customColumns.length === 0 ? (
              <p className="text-xs text-muted-foreground">커스텀 컬럼이 없습니다</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-1.5">
                  {activeCustomColumns.map((column) => (
                    <div key={column.id} className="group relative">
                      <button
                        onClick={() => {
                          setSelectedColumn({ id: column.id, label: column.label, visible: !column.hidden, order: column.order, width: 100 })
                          setColumnModalOpen(true)
                        }}
                        className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded border border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 transition-all"
                      >
                        {column.label}
                        <span className="text-[10px] text-muted-foreground">({column.type})</span>
                      </button>
                      <button
                        onClick={() => handleColumnDelete(column.id)}
                        className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <Trash2 className="h-2 w-2" />
                      </button>
                    </div>
                  ))}
                </div>
                {inactiveCustomColumns.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-[10px] text-muted-foreground mb-1">숨김</p>
                    <div className="flex flex-wrap gap-1">
                      {inactiveCustomColumns.map((column) => (
                        <button
                          key={column.id}
                          onClick={() => {
                            setSelectedColumn({ id: column.id, label: column.label, visible: !column.hidden, order: column.order, width: 100 })
                            setColumnModalOpen(true)
                          }}
                          className="flex items-center gap-1 px-2 py-0.5 text-xs rounded border border-dashed bg-muted/50 text-muted-foreground opacity-50"
                        >
                          <EyeOff className="h-2 w-2" />
                          {column.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Column: System Columns */}
        <div className="border rounded-lg p-3">
          <h3 className="text-sm font-medium mb-2">기본 컬럼</h3>
          <p className="text-[10px] text-muted-foreground mb-2">클릭하여 이름 변경 및 표시/숨김 설정</p>
          <div className="flex flex-wrap gap-1">
            {sortedColumns.map((column) => {
              const label = columnLabels[column.id] || column.label
              return (
                <button
                  key={column.id}
                  onClick={() => handleColumnClick(column)}
                  className={cn(
                    'flex items-center gap-0.5 px-2 py-0.5 text-xs font-medium rounded border transition-all',
                    'hover:bg-accent hover:border-primary/50',
                    column.visible
                      ? 'bg-background text-foreground border-border'
                      : 'bg-muted/50 text-muted-foreground border-transparent opacity-50'
                  )}
                >
                  {!column.visible && <EyeOff className="h-2 w-2" />}
                  <span>{label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Column Edit Modal */}
      {selectedColumn && (
        <ColumnEditModal
          open={columnModalOpen}
          onOpenChange={setColumnModalOpen}
          columnId={selectedColumn.id}
          label={columnLabels[selectedColumn.id] || selectedColumn.label}
          visible={selectedColumn.visible}
          onSave={handleColumnSave}
        />
      )}

      {/* Column Add Modal */}
      <ColumnAddModal
        open={columnAddModalOpen}
        onOpenChange={setColumnAddModalOpen}
        onAdd={handleColumnAdd}
      />

      {/* Status Badge Edit Modal */}
      {selectedStatusBadge && (
        <BadgeEditModal
          open={statusBadgeModalOpen}
          onOpenChange={setStatusBadgeModalOpen}
          title={`상태 뱃지 편집 - ${selectedStatusBadge.label}`}
          badge={selectedStatusBadge}
          onSave={handleStatusBadgeSave}
        />
      )}

      {/* Status Badge Add Modal */}
      <BadgeAddModal
        open={statusBadgeAddModalOpen}
        onOpenChange={setStatusBadgeAddModalOpen}
        type="status"
        existingIds={statusBadges.map(b => b.id)}
        onAdd={handleStatusBadgeAdd}
      />

      {/* Category Badge Edit Modal */}
      {selectedCategoryBadge && (
        <BadgeEditModal
          open={categoryBadgeModalOpen}
          onOpenChange={setCategoryBadgeModalOpen}
          title={`분류 뱃지 편집 - ${selectedCategoryBadge.label}`}
          badge={selectedCategoryBadge}
          onSave={handleCategoryBadgeSave}
        />
      )}

      {/* Category Badge Add Modal */}
      <BadgeAddModal
        open={categoryBadgeAddModalOpen}
        onOpenChange={setCategoryBadgeAddModalOpen}
        type="category"
        existingIds={categoryBadges.map(b => b.id)}
        onAdd={handleCategoryBadgeAdd}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>삭제 확인</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === 'status' && '이 상태 뱃지를 삭제하시겠습니까?'}
              {deleteTarget?.type === 'category' && '이 분류 뱃지를 삭제하시겠습니까?'}
              {deleteTarget?.type === 'column' && '이 커스텀 컬럼을 삭제하시겠습니까?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
