'use client'

import { useState, useCallback, ReactNode, useRef } from 'react'
import { cn } from '@/lib/utils'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ExcelGridLayout,
  ExcelGridRow,
  ExcelGridCell,
  ExcelGridContainerProps,
  GRID_CONSTANTS,
  SpecialCellType,
  generateCellId,
  generateRowId,
} from './types'
import { CategoryCell } from './category-cell'
import { LabelCell } from './label-cell'
import { InputCell } from './input-cell'
import { GridCell } from './excel-grid-cell'
import { Button } from '@/components/ui/button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Plus, Trash2, GripVertical, Copy } from 'lucide-react'

// Sortable Cell 컴포넌트
function SortableCell({
  cell,
  rowId,
  isEditMode,
  isSelected,
  onSelect,
  onResize,
  onDelete,
  onDuplicate,
  onAddCell,
  onChangeType,
  children,
}: {
  cell: ExcelGridCell
  rowId: string
  isEditMode: boolean
  isSelected: boolean
  onSelect: () => void
  onResize: (delta: number) => void
  onDelete: () => void
  onDuplicate: () => void
  onAddCell: (type: 'category' | 'label' | 'input') => void
  onChangeType: (type: 'category' | 'label' | 'input') => void
  children: ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cell.id, disabled: !isEditMode })

  const resizeRef = useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = useState(false)
  const startXRef = useRef(0)
  const startSpanRef = useRef(cell.colSpan)

  const handleResizeStart = (e: React.MouseEvent) => {
    if (!isEditMode) return
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    startXRef.current = e.clientX
    startSpanRef.current = cell.colSpan

    const handleMouseMove = (e: MouseEvent) => {
      const cellWidth = (resizeRef.current?.parentElement?.offsetWidth || 100) / cell.colSpan
      const deltaX = e.clientX - startXRef.current
      const deltaSpan = Math.round(deltaX / cellWidth)
      if (deltaSpan !== 0) {
        onResize(deltaSpan)
        startXRef.current = e.clientX
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${cell.colSpan}`,
    opacity: isDragging ? 0.5 : 1,
  }

  if (!isEditMode) {
    return (
      <div style={{ gridColumn: `span ${cell.colSpan}` }}>
        {children}
      </div>
    )
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          style={style}
          className={cn(
            'relative group',
            isSelected && 'ring-2 ring-blue-500 ring-inset z-10',
            isDragging && 'z-50'
          )}
          onClick={onSelect}
        >
          {/* 드래그 핸들 */}
          <div
            {...attributes}
            {...listeners}
            className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center cursor-grab active:cursor-grabbing bg-blue-500/10 opacity-0 group-hover:opacity-100 z-20"
          >
            <GripVertical className="h-3 w-3 text-blue-500" />
          </div>

          {/* 셀 내용 */}
          <div ref={resizeRef}>
            {children}
          </div>

          {/* 리사이즈 핸들 */}
          <div
            className={cn(
              'absolute right-0 top-0 bottom-0 w-2 cursor-col-resize z-20',
              'hover:bg-blue-500/30',
              isResizing && 'bg-blue-500/50'
            )}
            onMouseDown={handleResizeStart}
          />

          {/* 선택 시 너비 표시 */}
          {isSelected && (
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
              {cell.colSpan}칸
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onChangeType('category')}>
          카테고리로 변경
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onChangeType('label')}>
          레이블로 변경
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onChangeType('input')}>
          입력필드로 변경
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onDuplicate}>
          <Copy className="h-3 w-3 mr-2" />
          셀 복사
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => onAddCell('label')}>
          <Plus className="h-3 w-3 mr-2" />
          레이블 추가
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onAddCell('input')}>
          <Plus className="h-3 w-3 mr-2" />
          입력필드 추가
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onDelete} className="text-red-600">
          <Trash2 className="h-3 w-3 mr-2" />
          삭제
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

// Sortable Row 컴포넌트
function SortableRow({
  row,
  rowIndex,
  isEditMode,
  onAddRow,
  onDeleteRow,
  children,
}: {
  row: ExcelGridRow
  rowIndex: number
  isEditMode: boolean
  onAddRow: () => void
  onDeleteRow: () => void
  children: ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id, disabled: !isEditMode })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  if (!isEditMode) {
    return <>{children}</>
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'contents',
        isDragging && 'z-50'
      )}
    >
      {/* 행 컨트롤 (왼쪽 외부) */}
      <div
        className="absolute -left-8 flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity"
        style={{ top: `${rowIndex * 36}px`, height: '36px' }}
      >
        <button
          {...attributes}
          {...listeners}
          className="p-1 cursor-grab active:cursor-grabbing hover:bg-gray-100 rounded"
        >
          <GripVertical className="h-3 w-3 text-gray-400" />
        </button>
      </div>
      {children}
    </div>
  )
}

export function ExcelGridContainer({
  layout,
  isEditMode = false,
  onLayoutChange,
  data,
  onFieldChange,
  fieldOptions = {},
  savingFields = new Set(),
  renderSpecialCell,
}: ExcelGridContainerProps) {
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null)
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  const [draggedCell, setDraggedCell] = useState<ExcelGridCell | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // 셀 선택 핸들러
  const handleCellSelect = useCallback((rowId: string, cellId: string) => {
    if (isEditMode) {
      setSelectedRowId(rowId)
      setSelectedCellId(cellId)
    }
  }, [isEditMode])

  // 셀 내용 변경 핸들러 (category, label)
  const handleCellContentChange = useCallback((rowId: string, cellId: string, content: string) => {
    if (!onLayoutChange) return

    const newLayout: ExcelGridLayout = {
      ...layout,
      rows: layout.rows.map(row =>
        row.id === rowId
          ? {
              ...row,
              cells: row.cells.map(cell =>
                cell.id === cellId ? { ...cell, content } : cell
              )
            }
          : row
      )
    }
    onLayoutChange(newLayout)
  }, [layout, onLayoutChange])

  // 셀 리사이즈 핸들러
  const handleCellResize = useCallback((rowId: string, cellId: string, delta: number) => {
    if (!onLayoutChange) return

    const row = layout.rows.find(r => r.id === rowId)
    const cell = row?.cells.find(c => c.id === cellId)
    if (!cell) return

    const newSpan = Math.max(1, Math.min(12, cell.colSpan + delta))
    if (newSpan === cell.colSpan) return

    const newLayout: ExcelGridLayout = {
      ...layout,
      rows: layout.rows.map(r =>
        r.id === rowId
          ? {
              ...r,
              cells: r.cells.map(c =>
                c.id === cellId ? { ...c, colSpan: newSpan } : c
              )
            }
          : r
      )
    }
    onLayoutChange(newLayout)
  }, [layout, onLayoutChange])

  // 셀 삭제 핸들러
  const handleDeleteCell = useCallback((rowId: string, cellId: string) => {
    if (!onLayoutChange) return

    const newLayout: ExcelGridLayout = {
      ...layout,
      rows: layout.rows.map(r =>
        r.id === rowId
          ? { ...r, cells: r.cells.filter(c => c.id !== cellId) }
          : r
      ).filter(r => r.cells.length > 0) // 빈 행 제거
    }
    onLayoutChange(newLayout)
    setSelectedCellId(null)
  }, [layout, onLayoutChange])

  // 셀 복사 핸들러
  const handleDuplicateCell = useCallback((rowId: string, cellId: string) => {
    if (!onLayoutChange) return

    const row = layout.rows.find(r => r.id === rowId)
    const cell = row?.cells.find(c => c.id === cellId)
    if (!cell) return

    const newCell: ExcelGridCell = {
      ...cell,
      id: generateCellId(),
    }

    const newLayout: ExcelGridLayout = {
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
      })
    }
    onLayoutChange(newLayout)
  }, [layout, onLayoutChange])

  // 셀 추가 핸들러
  const handleAddCell = useCallback((rowId: string, cellId: string, type: 'category' | 'label' | 'input') => {
    if (!onLayoutChange) return

    const newCell: ExcelGridCell = {
      id: generateCellId(),
      type,
      colSpan: 2,
      content: type === 'category' ? '카테고리' : type === 'label' ? '레이블' : undefined,
      inputType: type === 'input' ? 'text' : undefined,
      textAlign: type === 'label' ? 'right' : undefined,
    }

    const newLayout: ExcelGridLayout = {
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
      })
    }
    onLayoutChange(newLayout)
  }, [layout, onLayoutChange])

  // 셀 타입 변경 핸들러
  const handleChangeType = useCallback((rowId: string, cellId: string, type: 'category' | 'label' | 'input') => {
    if (!onLayoutChange) return

    const newLayout: ExcelGridLayout = {
      ...layout,
      rows: layout.rows.map(r =>
        r.id === rowId
          ? {
              ...r,
              cells: r.cells.map(c =>
                c.id === cellId
                  ? {
                      ...c,
                      type,
                      content: type === 'category' ? '카테고리' : type === 'label' ? '레이블' : c.content,
                      inputType: type === 'input' ? 'text' : undefined,
                      textAlign: type === 'label' ? 'right' : undefined,
                    }
                  : c
              )
            }
          : r
      )
    }
    onLayoutChange(newLayout)
  }, [layout, onLayoutChange])

  // 행 추가 핸들러
  const handleAddRow = useCallback((afterRowId?: string) => {
    if (!onLayoutChange) return

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
      onLayoutChange({
        ...layout,
        rows: [
          ...layout.rows.slice(0, index + 1),
          newRow,
          ...layout.rows.slice(index + 1),
        ],
      })
    } else {
      onLayoutChange({
        ...layout,
        rows: [...layout.rows, newRow],
      })
    }
  }, [layout, onLayoutChange])

  // 행 삭제 핸들러
  const handleDeleteRow = useCallback((rowId: string) => {
    if (!onLayoutChange) return

    onLayoutChange({
      ...layout,
      rows: layout.rows.filter(r => r.id !== rowId),
    })
  }, [layout, onLayoutChange])

  // 드래그 앤 드롭 핸들러
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    // 셀 찾기
    for (const row of layout.rows) {
      const cell = row.cells.find(c => c.id === active.id)
      if (cell) {
        setDraggedCell(cell)
        return
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setDraggedCell(null)

    if (!over || active.id === over.id || !onLayoutChange) return

    // 같은 행 내에서 셀 이동
    const newLayout: ExcelGridLayout = {
      ...layout,
      rows: layout.rows.map(row => {
        const activeIndex = row.cells.findIndex(c => c.id === active.id)
        const overIndex = row.cells.findIndex(c => c.id === over.id)

        if (activeIndex === -1 || overIndex === -1) return row

        const newCells = [...row.cells]
        const [removed] = newCells.splice(activeIndex, 1)
        newCells.splice(overIndex, 0, removed)

        return { ...row, cells: newCells }
      })
    }
    onLayoutChange(newLayout)
  }

  // 필드 값 변경 핸들러
  const handleFieldChange = useCallback((fieldId: string, value: unknown) => {
    onFieldChange(fieldId, value)
  }, [onFieldChange])

  // 셀 렌더링
  const renderCell = (
    row: ExcelGridRow,
    cell: ExcelGridCell,
    cellIndex: number,
    rowIndex: number
  ): ReactNode => {
    const isSelected = selectedCellId === cell.id

    const cellContent = (() => {
      switch (cell.type) {
        case 'category':
          return (
            <CategoryCell
              cell={cell}
              isEditMode={isEditMode}
              isSelected={isSelected}
              onClick={() => handleCellSelect(row.id, cell.id)}
              onContentChange={(content) => handleCellContentChange(row.id, cell.id, content)}
            />
          )

        case 'label':
          return (
            <LabelCell
              cell={cell}
              isEditMode={isEditMode}
              isSelected={isSelected}
              onClick={() => handleCellSelect(row.id, cell.id)}
              onContentChange={(content) => handleCellContentChange(row.id, cell.id, content)}
            />
          )

        case 'input':
          return (
            <InputCell
              cell={cell}
              value={cell.fieldId ? data[cell.fieldId] : undefined}
              onChange={(value) => cell.fieldId && handleFieldChange(cell.fieldId, value)}
              options={cell.fieldId ? fieldOptions[cell.fieldId] : cell.options}
              isSaving={cell.fieldId ? savingFields.has(cell.fieldId) : false}
              isEditMode={isEditMode}
              isSelected={isSelected}
              onClick={() => handleCellSelect(row.id, cell.id)}
            />
          )

        case 'special':
          if (isEditMode) {
            return (
              <GridCell
                cell={cell}
                isEditMode={isEditMode}
                isSelected={isSelected}
                onClick={() => handleCellSelect(row.id, cell.id)}
              >
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-300 rounded min-h-[60px]">
                  {cell.specialType === 'history' ? '변경 이력' : '중복 고객'}
                </div>
              </GridCell>
            )
          }
          if (renderSpecialCell && cell.specialType) {
            return (
              <div style={{ gridColumn: `span ${cell.colSpan}` }}>
                {renderSpecialCell(cell.specialType, cell)}
              </div>
            )
          }
          return null

        default:
          return null
      }
    })()

    if (isEditMode) {
      return (
        <SortableCell
          key={cell.id}
          cell={cell}
          rowId={row.id}
          isEditMode={isEditMode}
          isSelected={isSelected}
          onSelect={() => handleCellSelect(row.id, cell.id)}
          onResize={(delta) => handleCellResize(row.id, cell.id, delta)}
          onDelete={() => handleDeleteCell(row.id, cell.id)}
          onDuplicate={() => handleDuplicateCell(row.id, cell.id)}
          onAddCell={(type) => handleAddCell(row.id, cell.id, type)}
          onChangeType={(type) => handleChangeType(row.id, cell.id, type)}
        >
          {cellContent}
        </SortableCell>
      )
    }

    return cellContent
  }

  // 행 렌더링
  const renderRow = (row: ExcelGridRow, rowIndex: number) => {
    if (!row.visible) return null

    const cells = row.cells.map((cell, cellIndex) =>
      renderCell(row, cell, cellIndex, rowIndex)
    )

    if (isEditMode) {
      return (
        <SortableContext
          key={row.id}
          items={row.cells.map(c => c.id)}
          strategy={horizontalListSortingStrategy}
        >
          {cells}
        </SortableContext>
      )
    }

    return cells
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full">
        {/* 편집 모드 안내 */}
        {isEditMode && (
          <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-700 flex items-center justify-between">
            <span>
              <strong>편집 모드:</strong> 셀을 드래그하여 이동, 오른쪽 가장자리를 드래그하여 너비 조정, 우클릭으로 메뉴
            </span>
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-xs"
              onClick={() => handleAddRow()}
            >
              <Plus className="h-3 w-3 mr-1" />
              행 추가
            </Button>
          </div>
        )}

        {/* 그리드 컨테이너 */}
        <div
          className={cn(
            'border border-gray-300 rounded-md overflow-hidden',
            isEditMode && 'ring-2 ring-blue-200'
          )}
        >
          <div
            className="grid relative"
            style={{
              gridTemplateColumns: `repeat(${GRID_CONSTANTS.columns}, 1fr)`,
              gap: 0,
            }}
          >
            {layout.rows
              .filter(row => row.visible)
              .map((row, rowIndex) => renderRow(row, rowIndex))}
          </div>
        </div>
      </div>

      {/* 드래그 오버레이 */}
      <DragOverlay>
        {draggedCell && (
          <div
            className="bg-white border-2 border-blue-500 rounded shadow-lg p-2 text-sm opacity-80"
            style={{ width: `${draggedCell.colSpan * 60}px` }}
          >
            {draggedCell.type === 'category' && draggedCell.content}
            {draggedCell.type === 'label' && draggedCell.content}
            {draggedCell.type === 'input' && (draggedCell.fieldId || draggedCell.inputType)}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
