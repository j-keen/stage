'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import {
  ExcelGridLayout,
  ExcelGridRow,
  ExcelGridCell,
  GridCellType,
  InputFieldType,
  GRID_CONSTANTS,
  generateCellId,
  generateRowId,
  getRowTotalColSpan,
  canAddCellToRow,
} from './types'
import { ExcelGridContainer } from './excel-grid-container'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Save,
  X,
  RotateCcw,
  Settings2,
  GripVertical,
  Copy,
} from 'lucide-react'

interface ExcelGridEditorProps {
  open: boolean
  onClose: () => void
  layout: ExcelGridLayout
  onSave: (layout: ExcelGridLayout) => void
  onReset: () => void
}

export function ExcelGridEditor({
  open,
  onClose,
  layout: initialLayout,
  onSave,
  onReset,
}: ExcelGridEditorProps) {
  const [layout, setLayout] = useState<ExcelGridLayout>(initialLayout)
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // 현재 선택된 행과 셀 가져오기
  const selectedRow = layout.rows.find(r => r.id === selectedRowId)
  const selectedCell = selectedRow?.cells.find(c => c.id === selectedCellId)

  // 레이아웃 업데이트 헬퍼
  const updateLayout = useCallback((updater: (layout: ExcelGridLayout) => ExcelGridLayout) => {
    setLayout(prev => updater(prev))
  }, [])

  // 행 추가
  const addRow = useCallback((afterRowId?: string) => {
    updateLayout(layout => {
      const newRow: ExcelGridRow = {
        id: generateRowId(),
        cells: [
          { id: generateCellId(), type: 'label', colSpan: 2, content: '레이블', textAlign: 'right' },
          { id: generateCellId(), type: 'input', colSpan: 10, inputType: 'text' },
        ],
        visible: true,
      }

      if (afterRowId) {
        const index = layout.rows.findIndex(r => r.id === afterRowId)
        return {
          ...layout,
          rows: [
            ...layout.rows.slice(0, index + 1),
            newRow,
            ...layout.rows.slice(index + 1),
          ],
        }
      }

      return {
        ...layout,
        rows: [...layout.rows, newRow],
      }
    })
  }, [updateLayout])

  // 행 삭제
  const deleteRow = useCallback((rowId: string) => {
    updateLayout(layout => ({
      ...layout,
      rows: layout.rows.filter(r => r.id !== rowId),
    }))
    if (selectedRowId === rowId) {
      setSelectedRowId(null)
      setSelectedCellId(null)
    }
  }, [updateLayout, selectedRowId])

  // 행 이동
  const moveRow = useCallback((rowId: string, direction: 'up' | 'down') => {
    updateLayout(layout => {
      const index = layout.rows.findIndex(r => r.id === rowId)
      if (
        (direction === 'up' && index === 0) ||
        (direction === 'down' && index === layout.rows.length - 1)
      ) {
        return layout
      }

      const newRows = [...layout.rows]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      ;[newRows[index], newRows[targetIndex]] = [newRows[targetIndex], newRows[index]]

      return { ...layout, rows: newRows }
    })
  }, [updateLayout])

  // 행 표시/숨김
  const toggleRowVisibility = useCallback((rowId: string) => {
    updateLayout(layout => ({
      ...layout,
      rows: layout.rows.map(r =>
        r.id === rowId ? { ...r, visible: !r.visible } : r
      ),
    }))
  }, [updateLayout])

  // 셀 추가
  const addCell = useCallback((rowId: string, afterCellId?: string, cellType: GridCellType = 'input') => {
    updateLayout(layout => {
      const row = layout.rows.find(r => r.id === rowId)
      if (!row || !canAddCellToRow(row, 2)) return layout

      const newCell: ExcelGridCell = {
        id: generateCellId(),
        type: cellType,
        colSpan: 2,
        content: cellType === 'category' ? '카테고리' : cellType === 'label' ? '레이블' : undefined,
        inputType: cellType === 'input' ? 'text' : undefined,
        textAlign: cellType === 'label' ? 'right' : undefined,
      }

      return {
        ...layout,
        rows: layout.rows.map(r => {
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
      }
    })
  }, [updateLayout])

  // 셀 삭제
  const deleteCell = useCallback((rowId: string, cellId: string) => {
    updateLayout(layout => ({
      ...layout,
      rows: layout.rows.map(r =>
        r.id === rowId
          ? { ...r, cells: r.cells.filter(c => c.id !== cellId) }
          : r
      ),
    }))
    if (selectedCellId === cellId) {
      setSelectedCellId(null)
    }
  }, [updateLayout, selectedCellId])

  // 셀 업데이트
  const updateCell = useCallback((rowId: string, cellId: string, updates: Partial<ExcelGridCell>) => {
    updateLayout(layout => ({
      ...layout,
      rows: layout.rows.map(r =>
        r.id === rowId
          ? {
              ...r,
              cells: r.cells.map(c =>
                c.id === cellId ? { ...c, ...updates } : c
              ),
            }
          : r
      ),
    }))
  }, [updateLayout])

  // 셀 복사
  const duplicateCell = useCallback((rowId: string, cellId: string) => {
    updateLayout(layout => {
      const row = layout.rows.find(r => r.id === rowId)
      const cell = row?.cells.find(c => c.id === cellId)
      if (!row || !cell || !canAddCellToRow(row, cell.colSpan)) return layout

      const newCell: ExcelGridCell = {
        ...cell,
        id: generateCellId(),
      }

      return {
        ...layout,
        rows: layout.rows.map(r => {
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
      }
    })
  }, [updateLayout])

  // 저장
  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(layout)
      onClose()
    } catch (error) {
      console.error('Failed to save layout:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // 리셋
  const handleReset = () => {
    onReset()
    setLayout(initialLayout)
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            그리드 레이아웃 편집
          </SheetTitle>
          <SheetDescription>
            행과 셀을 추가/삭제/수정하여 고객 모달 레이아웃을 구성합니다.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* 행 목록 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">행 목록</Label>
              <Button variant="outline" size="sm" onClick={() => addRow()}>
                <Plus className="h-4 w-4 mr-1" />
                행 추가
              </Button>
            </div>

            <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
              {layout.rows.map((row, rowIndex) => (
                <div
                  key={row.id}
                  className={cn(
                    'p-3 hover:bg-gray-50 transition-colors',
                    selectedRowId === row.id && 'bg-blue-50',
                    !row.visible && 'opacity-50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />

                    <button
                      onClick={() => {
                        setSelectedRowId(row.id)
                        setSelectedCellId(null)
                      }}
                      className="flex-1 text-left text-sm"
                    >
                      <span className="font-medium">행 {rowIndex + 1}</span>
                      <span className="text-gray-500 ml-2">
                        ({row.cells.length}개 셀, {getRowTotalColSpan(row)}/12 칸)
                      </span>
                    </button>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => moveRow(row.id, 'up')}
                        disabled={rowIndex === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => moveRow(row.id, 'down')}
                        disabled={rowIndex === layout.rows.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => toggleRowVisibility(row.id)}
                      >
                        {row.visible ? '👁' : '🙈'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-600"
                        onClick={() => deleteRow(row.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* 선택된 행의 셀 목록 */}
                  {selectedRowId === row.id && (
                    <div className="mt-3 pl-6 space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium text-gray-600">셀 목록</Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-6 text-xs">
                              <Plus className="h-3 w-3 mr-1" />
                              셀 추가
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => addCell(row.id, undefined, 'category')}>
                              카테고리 추가
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => addCell(row.id, undefined, 'label')}>
                              레이블 추가
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => addCell(row.id, undefined, 'input')}>
                              입력 필드 추가
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {row.cells.map(cell => (
                          <button
                            key={cell.id}
                            onClick={() => setSelectedCellId(cell.id)}
                            className={cn(
                              'px-2 py-1 text-xs rounded border',
                              selectedCellId === cell.id
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300',
                              cell.type === 'category' && 'bg-gray-100',
                              cell.type === 'label' && 'bg-gray-50',
                            )}
                          >
                            {cell.type === 'category' && `📁 ${cell.content}`}
                            {cell.type === 'label' && `🏷️ ${cell.content}`}
                            {cell.type === 'input' && `📝 ${cell.fieldId || cell.inputType}`}
                            {cell.type === 'special' && `⭐ ${cell.specialType}`}
                            <span className="ml-1 text-gray-400">({cell.colSpan}칸)</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 선택된 셀 편집 */}
          {selectedCell && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-sm font-medium">셀 설정</Label>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => selectedRowId && duplicateCell(selectedRowId, selectedCell.id)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500 hover:text-red-600"
                    onClick={() => selectedRowId && deleteCell(selectedRowId, selectedCell.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 셀 타입 */}
                <div className="space-y-1">
                  <Label className="text-xs">셀 타입</Label>
                  <Select
                    value={selectedCell.type}
                    onValueChange={(value: GridCellType) =>
                      selectedRowId && updateCell(selectedRowId, selectedCell.id, { type: value })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="category">카테고리</SelectItem>
                      <SelectItem value="label">레이블</SelectItem>
                      <SelectItem value="input">입력 필드</SelectItem>
                      <SelectItem value="special">특수 섹션</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 너비 (colSpan) */}
                <div className="space-y-1">
                  <Label className="text-xs">너비 (칸)</Label>
                  <Select
                    value={String(selectedCell.colSpan)}
                    onValueChange={(value) =>
                      selectedRowId && updateCell(selectedRowId, selectedCell.id, { colSpan: Number(value) })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                        <SelectItem key={n} value={String(n)}>
                          {n}칸
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category/Label용 내용 */}
                {(selectedCell.type === 'category' || selectedCell.type === 'label') && (
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs">내용</Label>
                    <Input
                      value={selectedCell.content || ''}
                      onChange={(e) =>
                        selectedRowId && updateCell(selectedRowId, selectedCell.id, { content: e.target.value })
                      }
                      className="h-8"
                    />
                  </div>
                )}

                {/* Input용 설정 */}
                {selectedCell.type === 'input' && (
                  <>
                    <div className="space-y-1">
                      <Label className="text-xs">필드 ID</Label>
                      <Input
                        value={selectedCell.fieldId || ''}
                        onChange={(e) =>
                          selectedRowId && updateCell(selectedRowId, selectedCell.id, { fieldId: e.target.value })
                        }
                        placeholder="예: name, phone"
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">입력 타입</Label>
                      <Select
                        value={selectedCell.inputType || 'text'}
                        onValueChange={(value: InputFieldType) =>
                          selectedRowId && updateCell(selectedRowId, selectedCell.id, { inputType: value })
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">텍스트</SelectItem>
                          <SelectItem value="number">숫자</SelectItem>
                          <SelectItem value="select">선택</SelectItem>
                          <SelectItem value="date">날짜</SelectItem>
                          <SelectItem value="datetime">날짜/시간</SelectItem>
                          <SelectItem value="checkbox">체크박스</SelectItem>
                          <SelectItem value="textarea">텍스트영역</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* 여백 설정 */}
                <div className="col-span-2 grid grid-cols-4 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">상단 여백</Label>
                    <Input
                      type="number"
                      value={selectedCell.marginTop || 0}
                      onChange={(e) =>
                        selectedRowId && updateCell(selectedRowId, selectedCell.id, { marginTop: Number(e.target.value) })
                      }
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">하단 여백</Label>
                    <Input
                      type="number"
                      value={selectedCell.marginBottom || 0}
                      onChange={(e) =>
                        selectedRowId && updateCell(selectedRowId, selectedCell.id, { marginBottom: Number(e.target.value) })
                      }
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">좌측 여백</Label>
                    <Input
                      type="number"
                      value={selectedCell.marginLeft || 0}
                      onChange={(e) =>
                        selectedRowId && updateCell(selectedRowId, selectedCell.id, { marginLeft: Number(e.target.value) })
                      }
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">우측 여백</Label>
                    <Input
                      type="number"
                      value={selectedCell.marginRight || 0}
                      onChange={(e) =>
                        selectedRowId && updateCell(selectedRowId, selectedCell.id, { marginRight: Number(e.target.value) })
                      }
                      className="h-8"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 미리보기 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">미리보기</Label>
            <div className="border rounded-lg p-2 bg-white">
              <ExcelGridContainer
                layout={layout}
                isEditMode={false}
                data={{}}
                onFieldChange={() => {}}
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              기본값으로 초기화
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                취소
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? '저장 중...' : '저장'}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
