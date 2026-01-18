'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCustomer } from '@/hooks/use-customers'
import { useAutoSave } from '@/hooks/use-auto-save'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { InlineEdit } from './inline-edit'
import { HistoryTimeline } from './history-timeline'
import { FieldItem } from './field-row'
import { CompactInput } from './compact-input'
import { CompactSelect } from './compact-select'
import { ModalLayoutEditor } from './modal-layout-editor'
import { useModalLayoutStore } from '@/stores/modal-layout-store'
import { useExcelGridStore } from '@/stores/excel-grid-store'
import { ExcelGridContainer, ExcelGridEditor, SpecialCellType, ExcelGridCell, SelectOption as GridSelectOption } from './excel-grid'
import { Checkbox } from '@/components/ui/checkbox'
import { type Customer, type CustomColumnConfig, type Json } from '@/types/database'
import { useSettingsStore } from '@/stores/settings-store'
import {
  Phone,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  History,
  Loader2,
  Settings2,
  Plus,
  X,
  Pencil,
  Check,
  RotateCcw,
} from 'lucide-react'

interface CustomerModalProps {
  customerId: string | null
  open: boolean
  onClose: () => void
  onNavigateToCustomer?: (customerId: string) => void
}

interface SelectOption {
  value: string
  label: string
}

interface BranchOption extends SelectOption {
  slug?: string | null
}

interface DuplicateCustomer {
  id: string
  phone: string
  name: string | null
  created_at: string
}

export function CustomerModal({ customerId, open, onClose, onNavigateToCustomer }: CustomerModalProps) {
  const { data: customer, isLoading, refetch } = useCustomer(customerId || '')
  const [users, setUsers] = useState<SelectOption[]>([])
  const [branches, setBranches] = useState<BranchOption[]>([])
  const [duplicates, setDuplicates] = useState<DuplicateCustomer[]>([])
  const [notesValue, setNotesValue] = useState('')
  const [showLayoutEditor, setShowLayoutEditor] = useState(false)
  const [showExcelGridEditor, setShowExcelGridEditor] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false) // 그리드 편집 모드
  const [additionalCallbacks, setAdditionalCallbacks] = useState<string[]>([])
  const {
    loadLayout,
    isLoaded: layoutLoaded,
    layout,
  } = useModalLayoutStore()

  // Excel Grid Store
  const {
    layout: excelGridLayout,
    isLoaded: excelGridLoaded,
    loadLayout: loadExcelGridLayout,
    saveLayout: saveExcelGridLayout,
    resetLayout: resetExcelGridLayout,
    setLayout: setExcelGridLayout,
  } = useExcelGridStore()

  const { queueChange, isSaving } = useAutoSave({
    customerId: customerId || '',
    onError: (error) => console.error('Auto-save error:', error),
    onSaveEnd: () => refetch(),
  })

  // Sync notes value
  useEffect(() => {
    if (customer?.notes !== undefined) {
      setNotesValue(customer.notes || '')
    }
  }, [customer?.notes])

  // Sync additional callbacks from custom_fields
  useEffect(() => {
    if (customer?.custom_fields) {
      const customFields = customer.custom_fields as Record<string, unknown>
      const callbacks = customFields.additional_callbacks as string[] | undefined
      if (callbacks && Array.isArray(callbacks)) {
        setAdditionalCallbacks(callbacks)
      } else {
        setAdditionalCallbacks([])
      }
    } else {
      setAdditionalCallbacks([])
    }
  }, [customer?.custom_fields])

  // Fetch duplicate customers when modal opens
  const fetchDuplicates = useCallback(async () => {
    if (!customer?.phone || !customer?.is_duplicate) return

    const supabase = createClient()
    const { data } = await supabase
      .from('customers')
      .select('id, phone, name, created_at')
      .eq('phone', customer.phone)
      .neq('id', customer.id)
      .order('created_at', { ascending: true })

    if (data) {
      setDuplicates(data)
    }
  }, [customer?.phone, customer?.is_duplicate, customer?.id])

  useEffect(() => {
    const fetchSelectData = async () => {
      const supabase = createClient()

      const [usersRes, branchesRes] = await Promise.all([
        supabase.from('users').select('id, name').eq('is_active', true),
        supabase.from('branches').select('id, name, slug').eq('is_active', true),
      ])

      if (usersRes.data) {
        setUsers(usersRes.data.map((u: { id: string; name: string }) => ({ value: u.id, label: u.name })))
      }
      if (branchesRes.data) {
        setBranches(branchesRes.data.map((b: { id: string; name: string; slug?: string | null }) => ({
          value: b.id,
          label: b.name,
          slug: b.slug
        })))
      }
    }

    if (open) {
      fetchSelectData()
    }
  }, [open])

  useEffect(() => {
    if (open && customer) {
      fetchDuplicates()
    }
  }, [open, customer, fetchDuplicates])

  const handleFieldChange = (field: keyof Customer, value: Customer[keyof Customer]) => {
    queueChange(field, value)
  }

  const handleCustomFieldChange = (columnId: string, value: string | number | boolean | null) => {
    const currentCustomFields = (customer?.custom_fields || {}) as Record<string, Json | undefined>
    const updatedCustomFields: Record<string, Json | undefined> = {
      ...currentCustomFields,
      [columnId]: value,
    }
    queueChange('custom_fields', updatedCustomFields as Json)
  }

  const getCustomFieldValue = (columnId: string): string | number | boolean | null => {
    const customFields = customer?.custom_fields as Record<string, unknown> || {}
    const value = customFields[columnId]
    if (value === undefined || value === null) return null
    return value as string | number | boolean
  }

  // Callback management functions
  const addCallback = () => {
    const newCallbacks = [...additionalCallbacks, '']
    setAdditionalCallbacks(newCallbacks)
    const currentCustomFields = (customer?.custom_fields || {}) as Record<string, Json | undefined>
    queueChange('custom_fields', {
      ...currentCustomFields,
      additional_callbacks: newCallbacks,
    } as Json)
  }

  const updateCallback = (index: number, value: string) => {
    const newCallbacks = [...additionalCallbacks]
    newCallbacks[index] = value
    setAdditionalCallbacks(newCallbacks)
    const currentCustomFields = (customer?.custom_fields || {}) as Record<string, Json | undefined>
    queueChange('custom_fields', {
      ...currentCustomFields,
      additional_callbacks: newCallbacks.filter(cb => cb), // Filter empty values
    } as Json)
  }

  const removeCallback = (index: number) => {
    const newCallbacks = additionalCallbacks.filter((_, i) => i !== index)
    setAdditionalCallbacks(newCallbacks)
    const currentCustomFields = (customer?.custom_fields || {}) as Record<string, Json | undefined>
    queueChange('custom_fields', {
      ...currentCustomFields,
      additional_callbacks: newCallbacks,
    } as Json)
  }

  const renderCustomField = (column: CustomColumnConfig) => {
    const value = getCustomFieldValue(column.id)

    switch (column.type) {
      case 'text':
        return (
          <CompactInput
            value={value as string | null}
            onChange={(val) => handleCustomFieldChange(column.id, val as string)}
            placeholder={column.label}
            isSaving={isSaving}
          />
        )
      case 'number':
        return (
          <CompactInput
            value={value as number | null}
            onChange={(val) => handleCustomFieldChange(column.id, val as number)}
            type="number"
            placeholder={column.label}
            isSaving={isSaving}
          />
        )
      case 'date':
        return (
          <InlineEdit
            value={value as string | null}
            onSave={(val) => handleCustomFieldChange(column.id, val as string)}
            type="date"
            placeholder={column.label}
            isSaving={isSaving}
          />
        )
      case 'select':
        return (
          <CompactSelect
            value={value as string | null}
            onChange={(val) => handleCustomFieldChange(column.id, val as string)}
            options={(column.options || []).map(opt => ({ value: opt, label: opt }))}
            placeholder="선택"
            allowClear
            isSaving={isSaving}
          />
        )
      case 'boolean':
        return (
          <div className="flex items-center h-8">
            <Checkbox
              checked={!!value}
              onCheckedChange={(checked: boolean) => handleCustomFieldChange(column.id, checked)}
              className="h-4 w-4"
            />
          </div>
        )
      default:
        return null
    }
  }

  const handleNavigateToDuplicate = (duplicateId: string) => {
    if (onNavigateToCustomer) {
      onNavigateToCustomer(duplicateId)
    }
  }

  const formatPhone = (phone: string) => {
    if (phone.length === 11) {
      return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`
    }
    return phone
  }

  const formatCurrency = (amount: string | number | null) => {
    if (amount === null || amount === '') return '-'
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(num)) return '-'
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(num)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const { getVisibleStatuses, getVisibleCategories, getStatusBadge, getCategoryBadge, getVisibleCustomColumns, loadSettings, isLoaded } = useSettingsStore()

  // Filter options to only show visible statuses/categories
  const visibleStatuses = getVisibleStatuses()
  const visibleCategories = getVisibleCategories()
  const visibleCustomColumns = getVisibleCustomColumns()

  // Load settings on mount
  useEffect(() => {
    if (!isLoaded) {
      loadSettings()
    }
    if (!layoutLoaded) {
      loadLayout()
    }
    if (!excelGridLoaded) {
      loadExcelGridLayout()
    }
  }, [isLoaded, loadSettings, layoutLoaded, loadLayout, excelGridLoaded, loadExcelGridLayout])

  // Excel Grid 필드 옵션 (select 필드용)
  const fieldOptions = useMemo<Record<string, GridSelectOption[]>>(() => ({
    category: visibleCategories.map((badge) => ({ value: badge.id, label: badge.label })),
    status: visibleStatuses.map((badge) => ({ value: badge.id, label: badge.label })),
    gender: [{ value: 'male', label: '남성' }, { value: 'female', label: '여성' }],
    assigned_to: users.map(u => ({ value: u.value, label: u.label })),
    branch_id: branches.map(b => ({ value: b.value, label: b.label })),
  }), [visibleCategories, visibleStatuses, users, branches])

  // Excel Grid 데이터 (고객 정보)
  const excelGridData = useMemo<Record<string, unknown>>(() => {
    if (!customer) return {}
    return {
      name: customer.name,
      category: customer.category,
      status: customer.status,
      birth_date: customer.birth_date,
      gender: customer.gender,
      phone: customer.phone,
      address: customer.address,
      existing_loans: customer.existing_loans,
      credit_score: customer.credit_score,
      required_amount: customer.required_amount,
      loan_amount: customer.loan_amount,
      fund_purpose: customer.fund_purpose,
      assigned_to: customer.assigned_to,
      branch_id: customer.branch_id,
      callback_date: customer.callback_date,
      occupation: customer.occupation,
      income: customer.income,
      employment_period: customer.employment_period,
      loan_purpose: customer.loan_purpose,
      has_overdue: customer.has_overdue,
      has_license: customer.has_license,
      has_insurance: customer.has_insurance,
      has_credit_card: customer.has_credit_card,
      notes: customer.notes,
    }
  }, [customer])

  // Excel Grid 필드 변경 핸들러
  const handleExcelGridFieldChange = useCallback((fieldId: string, value: unknown) => {
    handleFieldChange(fieldId as keyof Customer, value as Customer[keyof Customer])
  }, [handleFieldChange])

  // Excel Grid 특수 셀 렌더링 (history, duplicates)
  const renderSpecialCell = useCallback((cellType: SpecialCellType, cell: ExcelGridCell) => {
    if (cellType === 'history') {
      return (
        <Accordion type="multiple" defaultValue={['history']} className="space-y-1">
          <AccordionItem value="history" className="border rounded-lg px-3">
            <AccordionTrigger className="py-2 text-sm">
              <div className="flex items-center gap-2">
                <History className="h-3 w-3 text-muted-foreground" />
                <span>변경 이력</span>
                {customer && (
                  <span className="text-xs text-muted-foreground font-normal">
                    (등록: {formatDate(customer.created_at)} / 수정: {formatDate(customer.updated_at)})
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-3">
              <HistoryTimeline customerId={customerId || ''} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )
    }

    if (cellType === 'duplicates' && customer?.is_duplicate && duplicates.length > 0) {
      return (
        <Accordion type="single" collapsible className="bg-orange-50 border border-orange-200 rounded-lg">
          <AccordionItem value="duplicates" className="border-none">
            <AccordionTrigger className="px-3 py-2 hover:no-underline">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3 w-3 text-orange-600" />
                <span className="font-medium text-sm text-orange-800">
                  중복 고객 히스토리 ({duplicates.length}건)
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-2">
              <div className="space-y-1">
                {duplicates.map((dup, idx) => (
                  <div key={dup.id} className="flex items-center justify-between text-sm">
                    <span className="text-orange-700">
                      {idx === 0 ? '원본: ' : `중복 ${idx}: `}
                      {dup.name || '이름 없음'} ({formatDate(dup.created_at)})
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-orange-600 hover:text-orange-800 px-2"
                      onClick={() => handleNavigateToDuplicate(dup.id)}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      이동
                    </Button>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )
    }

    return null
  }, [customer, customerId, duplicates, handleNavigateToDuplicate])

  const statusOptions: SelectOption[] = visibleStatuses.map((badge) => ({
    value: badge.id,
    label: badge.label,
  }))

  const categoryOptions: SelectOption[] = visibleCategories.map((badge) => ({
    value: badge.id,
    label: badge.label,
  }))

  if (!customerId) return null

  // 편집 모드 저장 핸들러
  const handleSaveLayout = async () => {
    try {
      await saveExcelGridLayout()
      setIsEditMode(false)
    } catch (error) {
      console.error('Failed to save layout:', error)
    }
  }

  // 편집 모드 취소 핸들러
  const handleCancelEdit = () => {
    loadExcelGridLayout() // 원래 레이아웃으로 복원
    setIsEditMode(false)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="w-[98vw] max-w-[1400px] sm:max-w-[1400px] max-h-[95vh] p-0 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-4 py-3 border-b bg-muted/30">
          <DialogTitle className="flex flex-col gap-1">
            {isLoading ? (
              <Skeleton className="h-6 w-48" />
            ) : customer ? (
              <>
                {/* 상단 라인: 이름 + 전화번호 + 버튼들 */}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{customer.name || '이름 없음'}</span>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{formatPhone(customer.phone)}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    {isSaving && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mr-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        저장 중...
                      </div>
                    )}

                    {/* 편집 모드 토글 버튼 */}
                    {isEditMode ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-3 w-3 mr-1" />
                          취소
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={resetExcelGridLayout}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          초기화
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-blue-500 hover:bg-blue-600"
                          onClick={handleSaveLayout}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          저장
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setIsEditMode(true)}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        수정
                      </Button>
                    )}

                    <DialogPrimitive.Close asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        title="닫기"
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DialogPrimitive.Close>
                  </div>
                </div>

                {/* 하단 라인: 분류 + 상태 + 중복 */}
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: getCategoryBadge(customer.category).bgColor,
                      color: getCategoryBadge(customer.category).color,
                      border: `1px solid ${getCategoryBadge(customer.category).color}40`,
                    }}
                  >
                    {getCategoryBadge(customer.category).label}
                  </span>
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: getStatusBadge(customer.status).bgColor,
                      color: getStatusBadge(customer.status).color,
                    }}
                  >
                    {getStatusBadge(customer.status).label}
                  </span>
                  {customer.is_duplicate && (
                    <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      중복
                    </Badge>
                  )}
                </div>
              </>
            ) : (
              <span>고객 정보</span>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* 메인 콘텐츠: 좌측 그리드 + 우측 메모/이력 */}
        <div className="flex h-[calc(95vh-80px)]">
          {/* 좌측: Excel 그리드 (70%) */}
          <div className="flex-1 border-r overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4">
                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="grid grid-cols-12 gap-0">
                        {Array.from({ length: 12 }).map((_, j) => (
                          <Skeleton key={j} className="h-9 w-full border" />
                        ))}
                      </div>
                    ))}
                  </div>
                ) : customer ? (
                  <ExcelGridContainer
                    layout={excelGridLayout}
                    isEditMode={isEditMode}
                    onLayoutChange={setExcelGridLayout}
                    data={excelGridData}
                    onFieldChange={handleExcelGridFieldChange}
                    fieldOptions={fieldOptions}
                    savingFields={isSaving ? new Set(Object.keys(excelGridData)) : new Set()}
                  />
                ) : null}
              </div>
            </ScrollArea>
          </div>

          {/* 우측: 메모 + 변경이력 (30%) */}
          <div className="w-[350px] flex flex-col bg-gray-50/50">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {/* 중복 고객 알림 */}
                {customer?.is_duplicate && duplicates.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-sm text-orange-800">
                        중복 고객 ({duplicates.length}건)
                      </span>
                    </div>
                    <div className="space-y-1">
                      {duplicates.map((dup, idx) => (
                        <div key={dup.id} className="flex items-center justify-between text-xs">
                          <span className="text-orange-700">
                            {idx === 0 ? '원본' : `중복${idx}`}: {dup.name || '이름없음'}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 text-xs text-orange-600 hover:text-orange-800 px-1"
                            onClick={() => handleNavigateToDuplicate(dup.id)}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 메모 섹션 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Settings2 className="h-4 w-4" />
                    메모
                  </Label>
                  <Textarea
                    value={notesValue}
                    onChange={(e) => setNotesValue(e.target.value)}
                    onBlur={() => {
                      if (notesValue !== customer?.notes) {
                        handleFieldChange('notes', notesValue)
                      }
                    }}
                    placeholder="메모를 입력하세요..."
                    className="min-h-[150px] text-sm resize-none bg-white"
                  />
                </div>

                {/* 변경 이력 섹션 */}
                {customer && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <History className="h-4 w-4" />
                        변경 이력
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        등록: {formatDate(customer.created_at)}
                      </span>
                    </div>
                    <div className="bg-white border rounded-lg p-3 max-h-[300px] overflow-y-auto">
                      <HistoryTimeline customerId={customerId || ''} />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
