'use client'

import { useState, useRef, useEffect } from 'react'
import { GridCell } from './excel-grid-cell'
import { CategoryCellProps } from './types'

export function CategoryCell({
  cell,
  isEditMode = false,
  isSelected = false,
  onClick,
  onContentChange,
}: CategoryCellProps) {
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
      cell={{ ...cell, textAlign: 'left' }}
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
          className="w-full bg-transparent border-none outline-none font-medium text-sm text-gray-700"
        />
      ) : (
        <span
          onDoubleClick={handleDoubleClick}
          className="font-medium text-sm text-gray-700"
        >
          {cell.content}
        </span>
      )}
    </GridCell>
  )
}
