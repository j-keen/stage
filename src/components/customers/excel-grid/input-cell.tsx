'use client'

import { useState, useRef, useEffect } from 'react'
import { GridCell } from './excel-grid-cell'
import { InputCellProps, GRID_CONSTANTS } from './types'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { Loader2, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export function InputCell({
  cell,
  value,
  onChange,
  options = [],
  isSaving = false,
  isEditMode = false,
  isSelected = false,
  onClick,
}: InputCellProps) {
  const [localValue, setLocalValue] = useState(value)
  const [isFocused, setIsFocused] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null)

  // 외부 값이 변경되면 로컬 값 동기화
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (newValue: unknown) => {
    setLocalValue(newValue)
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (localValue !== value) {
      onChange(localValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && cell.inputType !== 'textarea') {
      handleBlur()
      ;(e.target as HTMLElement).blur()
    }
  }

  // 날짜 포맷팅
  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return ''
    try {
      const d = typeof date === 'string' ? new Date(date) : date
      return format(d, 'yyyy-MM-dd')
    } catch {
      return ''
    }
  }

  // 날짜/시간 포맷팅
  const formatDateTime = (date: string | Date | null | undefined) => {
    if (!date) return ''
    try {
      const d = typeof date === 'string' ? new Date(date) : date
      return format(d, 'yyyy-MM-dd HH:mm')
    } catch {
      return ''
    }
  }

  // 입력 필드 렌더링
  const renderInput = () => {
    const baseInputClass = cn(
      'w-full h-full bg-transparent border-none outline-none text-sm',
      'focus:ring-0 px-2',
      isSaving && 'pr-6'
    )

    switch (cell.inputType) {
      case 'text':
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={(localValue as string) || ''}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={cell.placeholder}
            className={baseInputClass}
            disabled={isEditMode}
          />
        )

      case 'number':
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="number"
            value={(localValue as number) ?? ''}
            onChange={(e) => handleChange(e.target.value ? Number(e.target.value) : null)}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={cell.placeholder}
            className={cn(baseInputClass, 'text-right')}
            disabled={isEditMode}
          />
        )

      case 'select':
        return (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={(localValue as string) || ''}
            onChange={(e) => {
              handleChange(e.target.value)
              onChange(e.target.value)
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(baseInputClass, 'cursor-pointer')}
            disabled={isEditMode}
          >
            <option value="">선택</option>
            {(cell.options || options).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )

      case 'date':
        return (
          <Popover open={calendarOpen && !isEditMode} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild disabled={isEditMode}>
              <button
                className={cn(
                  'w-full h-full flex items-center justify-between px-2 text-sm',
                  !localValue && 'text-gray-400'
                )}
              >
                <span>{localValue ? formatDate(localValue as string) : '날짜 선택'}</span>
                <Calendar className="h-3 w-3 text-gray-400" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={localValue ? new Date(localValue as string) : undefined}
                onSelect={(date) => {
                  if (date) {
                    const isoDate = date.toISOString().split('T')[0]
                    handleChange(isoDate)
                    onChange(isoDate)
                  }
                  setCalendarOpen(false)
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )

      case 'datetime':
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="datetime-local"
            value={localValue ? formatDateTime(localValue as string).replace(' ', 'T') : ''}
            onChange={(e) => {
              const newValue = e.target.value ? new Date(e.target.value).toISOString() : null
              handleChange(newValue)
              onChange(newValue)
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={baseInputClass}
            disabled={isEditMode}
          />
        )

      case 'checkbox':
        return (
          <div className="flex items-center justify-center w-full h-full">
            <Checkbox
              checked={!!localValue}
              onCheckedChange={(checked) => {
                handleChange(checked)
                onChange(checked)
              }}
              disabled={isEditMode}
            />
          </div>
        )

      case 'textarea':
        return (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={(localValue as string) || ''}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            placeholder={cell.placeholder}
            className={cn(baseInputClass, 'min-h-[72px] resize-none py-2')}
            disabled={isEditMode}
          />
        )

      default:
        return (
          <input
            type="text"
            value={(localValue as string) || ''}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={baseInputClass}
            disabled={isEditMode}
          />
        )
    }
  }

  return (
    <GridCell
      cell={cell}
      isEditMode={isEditMode}
      isSelected={isSelected}
      onClick={onClick}
    >
      <div
        className={cn(
          'w-full h-full relative',
          isFocused && 'ring-2 ring-blue-500 ring-inset'
        )}
        style={{
          backgroundColor: GRID_CONSTANTS.bgInput,
        }}
      >
        {renderInput()}

        {/* 저장 중 인디케이터 */}
        {isSaving && (
          <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin text-gray-400" />
        )}
      </div>
    </GridCell>
  )
}
