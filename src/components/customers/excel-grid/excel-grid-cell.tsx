'use client'

import { ReactNode, useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import {
  ExcelGridCell,
  ExcelGridCellProps,
  GRID_CONSTANTS,
} from './types'

export function GridCell({
  cell,
  isFirstInRow = false,
  isFirstRow = false,
  isEditMode = false,
  isSelected = false,
  onClick,
  onResize,
  children,
}: ExcelGridCellProps) {
  const cellRef = useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeStartX, setResizeStartX] = useState(0)
  const [resizeStartSpan, setResizeStartSpan] = useState(cell.colSpan)

  // 셀 타입에 따른 배경색
  const getBgColor = () => {
    if (cell.backgroundColor) return cell.backgroundColor
    switch (cell.type) {
      case 'category':
        return GRID_CONSTANTS.bgCategory
      case 'label':
        return GRID_CONSTANTS.bgLabel
      default:
        return GRID_CONSTANTS.bgInput
    }
  }

  // 셀 높이 결정
  const getCellHeight = () => {
    if (cell.type === 'category') return GRID_CONSTANTS.categoryHeight
    if (cell.inputType === 'textarea') return 'auto'
    return GRID_CONSTANTS.cellHeight
  }

  // 리사이즈 핸들러
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    if (!isEditMode || !onResize) return
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setResizeStartX(e.clientX)
    setResizeStartSpan(cell.colSpan)
  }, [isEditMode, onResize, cell.colSpan])

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !cellRef.current || !onResize) return

    const cellWidth = cellRef.current.offsetWidth / cell.colSpan
    const deltaX = e.clientX - resizeStartX
    const deltaSpan = Math.round(deltaX / cellWidth)
    const newSpan = Math.max(1, Math.min(12, resizeStartSpan + deltaSpan))

    if (newSpan !== cell.colSpan) {
      onResize(newSpan)
    }
  }, [isResizing, resizeStartX, resizeStartSpan, cell.colSpan, onResize])

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false)
  }, [])

  // 리사이즈 이벤트 리스너 등록
  useState(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove)
      window.addEventListener('mouseup', handleResizeEnd)
      return () => {
        window.removeEventListener('mousemove', handleResizeMove)
        window.removeEventListener('mouseup', handleResizeEnd)
      }
    }
  })

  return (
    <div
      ref={cellRef}
      className={cn(
        'relative',
        'border-gray-200',
        'border-r border-b',
        isFirstInRow && 'border-l',
        isFirstRow && 'border-t',
        cell.type === 'category' && 'border-b-2 border-b-gray-300',
        isEditMode && 'cursor-pointer',
        isSelected && 'ring-2 ring-blue-500 ring-inset z-10',
        isEditMode && !isSelected && 'hover:bg-gray-50/50'
      )}
      style={{
        gridColumn: `span ${cell.colSpan}`,
        gridRow: cell.rowSpan ? `span ${cell.rowSpan}` : undefined,
        minHeight: getCellHeight(),
        backgroundColor: getBgColor(),
        marginTop: cell.marginTop,
        marginBottom: cell.marginBottom,
        marginLeft: cell.marginLeft,
        marginRight: cell.marginRight,
      }}
      onClick={onClick}
    >
      <div
        className={cn(
          'h-full flex items-center',
          cell.type === 'category' && 'font-medium text-sm text-gray-700',
          cell.type === 'label' && 'text-xs text-gray-500',
        )}
        style={{
          padding: `${cell.paddingY ?? GRID_CONSTANTS.defaultPaddingY}px ${cell.paddingX ?? GRID_CONSTANTS.defaultPaddingX}px`,
          justifyContent:
            cell.textAlign === 'right' ? 'flex-end' :
            cell.textAlign === 'center' ? 'center' :
            'flex-start',
        }}
      >
        {children}
      </div>

      {/* 리사이즈 핸들 (편집 모드에서만) */}
      {isEditMode && onResize && (
        <div
          className="absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-blue-500/20 z-20"
          onMouseDown={handleResizeStart}
        />
      )}

      {/* 편집 모드 셀 정보 오버레이 */}
      {isEditMode && isSelected && (
        <div className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-1 rounded-br">
          {cell.colSpan}칸
        </div>
      )}
    </div>
  )
}
