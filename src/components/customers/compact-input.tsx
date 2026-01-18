'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CompactInputProps {
  value: string | number | null
  onChange: (value: string | number | null) => void
  type?: 'text' | 'number'
  placeholder?: string
  className?: string
  disabled?: boolean
  isSaving?: boolean
  displayFormat?: (value: string | number | null) => string
}

export function CompactInput({
  value,
  onChange,
  type = 'text',
  placeholder,
  className,
  disabled,
  isSaving = false,
  displayFormat,
}: CompactInputProps) {
  const [localValue, setLocalValue] = useState(value?.toString() || '')
  const [recentlySaved, setRecentlySaved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLocalValue(value?.toString() || '')
  }, [value])

  useEffect(() => {
    if (!isSaving && recentlySaved) {
      const timer = setTimeout(() => setRecentlySaved(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [isSaving, recentlySaved])

  const handleBlur = () => {
    const newValue = type === 'number'
      ? (localValue ? Number(localValue) : null)
      : (localValue || null)

    if (newValue !== value) {
      setRecentlySaved(true)
      onChange(newValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      inputRef.current?.blur()
    }
  }

  const displayValue = displayFormat && value != null
    ? displayFormat(value)
    : value?.toString() || ''

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type={type === 'number' ? 'number' : 'text'}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'h-8 text-sm pr-7 min-w-[100px]',
          disabled && 'bg-muted',
          className
        )}
      />
      {(isSaving || recentlySaved) && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          {isSaving ? (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          ) : (
            <Check className="h-3 w-3 text-green-500" />
          )}
        </div>
      )}
    </div>
  )
}
