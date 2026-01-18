'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { useTableStore, type ColumnConfig } from '@/stores/table-store'
import { useSettingsStore } from '@/stores/settings-store'
import { ColumnHeader } from './column-header'
import { CustomerRow } from './customer-row'
import { Skeleton } from '@/components/ui/skeleton'
import type { Customer } from '@/types/database'

interface CustomerTableProps {
  customers: (Customer & {
    branch?: { id: string; name: string } | null
    assigned_user?: { id: string; name: string } | null
  })[]
  isLoading: boolean
  selectedCustomerId: string | null
  onSelectCustomer: (customer: Customer) => void
  onToggleOverdue?: (customerId: string, newValue: boolean) => void
}

export function CustomerTable({
  customers,
  isLoading,
  selectedCustomerId,
  onSelectCustomer,
  onToggleOverdue,
}: CustomerTableProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const {
    columns,
    sortBy,
    sortOrder,
    isColumnEditMode,
    updateColumnWidth,
    updateColumnOrder,
    setSorting,
    density,
  } = useTableStore()

  const { getAllCustomColumns } = useSettingsStore()

  const [activeId, setActiveId] = useState<string | null>(null)

  // Merge custom columns with regular columns
  const customColumns = getAllCustomColumns()
  const customColumnConfigs: ColumnConfig[] = customColumns.map((col, index) => ({
    id: col.id,
    label: col.label,
    width: 100,
    visible: !col.hidden,
    order: columns.length + index,
    type: col.type,
    options: col.options,
  }))

  const allColumns = [...columns, ...customColumnConfigs]
  const visibleColumns = allColumns
    .filter((col) => col.visible)
    .sort((a, b) => a.order - b.order)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  // Row height based on density
  const rowHeight = density === 'compact' ? 32 : density === 'normal' ? 36 : 44

  const rowVirtualizer = useVirtualizer({
    count: customers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
  })

  const handleSort = useCallback(
    (columnId: string) => {
      if (sortBy === columnId) {
        setSorting(columnId, sortOrder === 'asc' ? 'desc' : 'asc')
      } else {
        setSorting(columnId, 'asc')
      }
    },
    [sortBy, sortOrder, setSorting]
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)

      if (over && active.id !== over.id) {
        const oldIndex = visibleColumns.findIndex((col) => col.id === active.id)
        const newIndex = visibleColumns.findIndex((col) => col.id === over.id)

        const reordered = arrayMove(visibleColumns, oldIndex, newIndex).map(
          (col, index) => ({
            ...col,
            order: index,
          })
        )

        // Update only regular columns (not custom columns) in table-store
        const updatedColumns = columns.map((col) => {
          const reorderedCol = reordered.find((r) => r.id === col.id)
          return reorderedCol || col
        })

        updateColumnOrder(updatedColumns)
      }
    },
    [visibleColumns, columns, updateColumnOrder]
  )

  const totalWidth = visibleColumns.reduce((sum, col) => sum + col.width, 0)

  if (!mounted) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="h-[600px] flex items-center justify-center">
          <div className="text-muted-foreground">로딩 중...</div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted/50 border-b">
          <div className="flex">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="px-3 py-2 border-r">
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-0">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex border-b">
              {Array.from({ length: 7 }).map((_, j) => (
                <div key={j} className="px-3 py-2 border-r">
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (customers.length === 0) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted/50 border-b">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragStart={({ active }) => setActiveId(active.id as string)}
          >
            <SortableContext
              items={visibleColumns.map((col) => col.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex" style={{ width: totalWidth, minWidth: totalWidth }}>
                {visibleColumns.map((column) => (
                  <ColumnHeader
                    key={column.id}
                    column={column}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                    onResize={updateColumnWidth}
                    isDragging={activeId === column.id}
                    isEditMode={isColumnEditMode}
                    density={density}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          검색 결과가 없습니다
        </div>
      </div>
    )
  }

  return (
    <div className="border border-white/60 rounded-2xl overflow-hidden h-full flex flex-col bg-white/60 backdrop-blur-xl shadow-xl shadow-black/5">
      {/* Unified scroll container */}
      <div
        ref={parentRef}
        className="overflow-auto flex-1"
      >
        {/* Sticky Header */}
        <div className="bg-muted/50 border-b sticky top-0 z-10" style={{ width: totalWidth }}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragStart={({ active }) => setActiveId(active.id as string)}
          >
            <SortableContext
              items={visibleColumns.map((col) => col.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex" style={{ minWidth: totalWidth }}>
                {visibleColumns.map((column) => (
                  <ColumnHeader
                    key={column.id}
                    column={column}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                    onResize={updateColumnWidth}
                    isDragging={activeId === column.id}
                    isEditMode={isColumnEditMode}
                    density={density}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Virtualized rows */}
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: totalWidth,
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const customer = customers[virtualRow.index]
            return (
              <CustomerRow
                key={customer.id}
                customer={customer}
                columns={visibleColumns}
                isSelected={selectedCustomerId === customer.id}
                onClick={() => onSelectCustomer(customer)}
                onToggleOverdue={onToggleOverdue}
                density={density}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
