'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CalendarIcon, Check, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InlineEditProps {
  value: string | number | null
  onSave: (value: string | number | null) => void
  type?: 'text' | 'number' | 'select' | 'textarea' | 'date' | 'datetime' | 'date-text'
  options?: { value: string; label: string }[]
  placeholder?: string
  className?: string
  disabled?: boolean
  displayFormat?: (value: string | number | null) => string
  isSaving?: boolean
}

// Parse birth date from various formats (YYMMDD, YYYYMMDD, etc.)
function parseBirthDate(input: string): string | null {
  const cleaned = input.replace(/[^0-9]/g, '')

  if (cleaned.length === 6) {
    // YYMMDD format
    const year = parseInt(cleaned.substring(0, 2))
    const month = cleaned.substring(2, 4)
    const day = cleaned.substring(4, 6)
    const fullYear = year > 30 ? 1900 + year : 2000 + year
    return `${fullYear}-${month}-${day}`
  } else if (cleaned.length === 8) {
    // YYYYMMDD format
    const year = cleaned.substring(0, 4)
    const month = cleaned.substring(4, 6)
    const day = cleaned.substring(6, 8)
    return `${year}-${month}-${day}`
  }

  // Try to parse as ISO date
  const date = new Date(input)
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0]
  }

  return null
}

export function InlineEdit({
  value,
  onSave,
  type = 'text',
  options,
  placeholder,
  className,
  disabled,
  displayFormat,
  isSaving = false,
}: InlineEditProps) {
  const [recentlySaved, setRecentlySaved] = useState(false)

  // Show checkmark briefly after save completes
  useEffect(() => {
    if (!isSaving && recentlySaved) {
      const timer = setTimeout(() => setRecentlySaved(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [isSaving, recentlySaved])

  const handleSaveWithIndicator = (val: string | number | null) => {
    if (val !== value) {
      setRecentlySaved(true)
      onSave(val)
    }
  }
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    setEditValue(value)
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select()
      }
    }
  }, [isEditing])

  const handleSave = () => {
    if (editValue !== value) {
      setRecentlySaved(true)
      onSave(editValue)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const displayValue = displayFormat
    ? displayFormat(value)
    : value?.toString() || placeholder || '-'

  if (disabled) {
    return (
      <span className={cn('text-muted-foreground', className)}>
        {displayValue}
      </span>
    )
  }

  if (type === 'select' && options) {
    return (
      <div className="relative">
        <Select
          value={value?.toString() || ''}
          onValueChange={(val) => {
            setRecentlySaved(true)
            onSave(val)
          }}
        >
          <SelectTrigger className={cn('w-full h-7 text-sm', className)}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(isSaving || recentlySaved) && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2">
            {isSaving && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
            {!isSaving && recentlySaved && <Check className="h-3 w-3 text-green-500" />}
          </div>
        )}
      </div>
    )
  }

  if (type === 'date' || type === 'datetime') {
    return (
      <div className="relative">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'justify-start text-left font-normal h-7 text-sm w-full',
                !value && 'text-muted-foreground',
                className
              )}
            >
              <CalendarIcon className="mr-2 h-3 w-3" />
              {value
                ? format(
                    new Date(value as string),
                    type === 'datetime' ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd',
                    { locale: ko }
                  )
                : placeholder || '날짜 선택'}
              {isSaving && <Loader2 className="ml-auto h-3 w-3 animate-spin text-muted-foreground" />}
              {!isSaving && recentlySaved && <Check className="ml-auto h-3 w-3 text-green-500" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value ? new Date(value as string) : undefined}
              onSelect={(date) => {
                setRecentlySaved(true)
                onSave(date ? date.toISOString() : null)
              }}
              locale={ko}
            />
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  // Date-text type: allows manual input like YYMMDD or YYYYMMDD
  if (type === 'date-text') {
    if (!isEditing) {
      return (
        <button
          onClick={() => setIsEditing(true)}
          className={cn(
            'flex items-center gap-1 text-left px-2 py-1 h-7 text-sm rounded border border-input bg-background hover:bg-accent transition-colors w-full',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <span className="truncate flex-1">
            {value
              ? format(new Date(value as string), 'yyyy-MM-dd', { locale: ko })
              : placeholder || '-'}
          </span>
          {isSaving && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground flex-shrink-0" />}
          {!isSaving && recentlySaved && <Check className="h-3 w-3 text-green-500 flex-shrink-0" />}
        </button>
      )
    }

    return (
      <div className="flex items-center gap-1">
        <Input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={editValue?.toString() || ''}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              const parsed = parseBirthDate(editValue?.toString() || '')
              if (parsed) {
                setRecentlySaved(true)
                onSave(parsed)
              }
              setIsEditing(false)
            } else if (e.key === 'Escape') {
              handleCancel()
            }
          }}
          onBlur={() => {
            const parsed = parseBirthDate(editValue?.toString() || '')
            if (parsed) {
              setRecentlySaved(true)
              onSave(parsed)
            }
            setIsEditing(false)
          }}
          placeholder="YYMMDD 또는 YYYY-MM-DD"
          className={cn('h-8', className)}
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            const parsed = parseBirthDate(editValue?.toString() || '')
            if (parsed) {
              setRecentlySaved(true)
              onSave(parsed)
            }
            setIsEditing(false)
          }}
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCancel}>
          <X className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className={cn(
          'flex items-center gap-1 text-left px-2 py-1 h-7 text-sm rounded border border-input bg-background hover:bg-accent transition-colors w-full',
          !value && 'text-muted-foreground',
          className
        )}
      >
        <span className="truncate flex-1">{displayValue}</span>
        {isSaving && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground flex-shrink-0" />}
        {!isSaving && recentlySaved && <Check className="h-3 w-3 text-green-500 flex-shrink-0" />}
      </button>
    )
  }

  if (type === 'textarea') {
    return (
      <div className="space-y-2">
        <Textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={editValue?.toString() || ''}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          placeholder={placeholder}
          className={className}
          rows={3}
        />
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={handleSave}>
            <Check className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={type === 'number' ? 'number' : 'text'}
        value={editValue?.toString() || ''}
        onChange={(e) =>
          setEditValue(type === 'number' ? Number(e.target.value) : e.target.value)
        }
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        placeholder={placeholder}
        className={cn('h-8', className)}
      />
      <Button size="sm" variant="ghost" onClick={handleSave}>
        <Check className="h-3 w-3" />
      </Button>
      <Button size="sm" variant="ghost" onClick={handleCancel}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}
