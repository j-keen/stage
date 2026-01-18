'use client'

import { useState, useRef, useEffect } from 'react'
import { GridCell } from './excel-grid-cell'
import { LabelCellProps } from './types'

export function LabelCell({
  cell,
  isEditMode = false,
  isSelected = false,
  onClick,
  onContentChange,
}: LabelCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(cell.content || '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleDoubleClick = () => {
    if (isEditMode && onContentChange) {
      setIsEditing(true)
      setEditValue(cell.content || '')
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (onContentChange && editValue !== cell.content) {
      onContentChange(editValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setEditValue(cell.content || '')
    }
  }

  return (
    <GridCell
      cell={{ ...cell, textAlign: cell.textAlign || 'right' }}
      isEditMode={isEditMode}
      isSelected={isSelected}
      onClick={onClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent border-none outline-none text-xs text-gray-500 text-right"
        />
      ) : (
        <span
          onDoubleClick={handleDoubleClick}
          className="text-xs text-gray-500"
        >
          {cell.content}
        </span>
      )}
    </GridCell>
  )
}
