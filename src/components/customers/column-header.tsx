'use client'

import { useState, useRef } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, ArrowUp, ArrowDown, GripVertical } from 'lucide-react'
import type { ColumnConfig, TableDensity } from '@/stores/table-store'
import { SORTABLE_COLUMNS } from '@/stores/table-store'

interface ColumnHeaderProps {
  column: ColumnConfig
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onSort: (columnId: string) => void
  onResize: (columnId: string, width: number) => void
  isDragging?: boolean
  isEditMode?: boolean
  density?: TableDensity
}

export function ColumnHeader({
  column,
  sortBy,
  sortOrder,
  onSort,
  onResize,
  isDragging,
  isEditMode = false,
  density = 'compact',
}: ColumnHeaderProps) {
  const [isResizing, setIsResizing] = useState(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: column.id })

  const style: React.CSSProperties = {
    ...(transform ? { transform: CSS.Transform.toString(transform) } : {}),
    transition,
    width: column.width,
    minWidth: column.width,
    maxWidth: column.width,
    flexShrink: 0,
    position: 'relative',
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    startX.current = e.clientX
    startWidth.current = column.width

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const diff = moveEvent.clientX - startX.current
      const newWidth = Math.max(60, startWidth.current + diff)
      onResize(column.id, newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const isSorted = sortBy === column.id
  const isSortable = (SORTABLE_COLUMNS as readonly string[]).includes(column.id)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative flex items-center justify-center font-medium text-muted-foreground border-r border-b bg-muted/50',
        density === 'compact' && 'px-1.5 py-1 text-xs',
        density === 'normal' && 'px-2 py-1.5 text-xs',
        density === 'comfortable' && 'px-3 py-2 text-sm',
        isDragging && 'opacity-50',
        isResizing && 'select-none',
        isEditMode && !isDragging && 'column-edit-mode'
      )}
    >
      {isEditMode && (
        <button
          {...attributes}
          {...listeners}
          className="mr-1 cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground/50" />
        </button>
      )}

      {isSortable ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 font-medium hover:bg-transparent"
          onClick={() => onSort(column.id)}
        >
          <span className="truncate">{column.label}</span>
          {isSorted ? (
            sortOrder === 'asc' ? (
              <ArrowUp className="ml-1 h-3 w-3" />
            ) : (
              <ArrowDown className="ml-1 h-3 w-3" />
            )
          ) : (
            <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
          )}
        </Button>
      ) : (
        <span className="truncate">{column.label}</span>
      )}

      {/* Resize handle */}
      <div
        className={cn(
          'absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/50',
          isResizing && 'bg-primary'
        )}
        onMouseDown={handleMouseDown}
      />
    </div>
  )
}
