'use client'

import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
}

interface CompactSelectProps {
  value: string | null
  onChange: (value: string | null) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  disabled?: boolean
  isSaving?: boolean
  allowClear?: boolean
}

export function CompactSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
  disabled,
  isSaving = false,
  allowClear = false,
}: CompactSelectProps) {
  const [recentlySaved, setRecentlySaved] = useState(false)

  useEffect(() => {
    if (!isSaving && recentlySaved) {
      const timer = setTimeout(() => setRecentlySaved(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [isSaving, recentlySaved])

  const handleChange = (val: string) => {
    const newValue = val === '__clear__' ? null : val
    if (newValue !== value) {
      setRecentlySaved(true)
      onChange(newValue)
    }
  }

  return (
    <div className="relative">
      <Select
        value={value || ''}
        onValueChange={handleChange}
        disabled={disabled}
      >
        <SelectTrigger className={cn('h-8 text-sm min-w-[100px]', className)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {allowClear && (
            <SelectItem value="__clear__" className="text-muted-foreground">
              선택 안함
            </SelectItem>
          )}
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {(isSaving || recentlySaved) && (
        <div className="absolute right-8 top-1/2 -translate-y-1/2">
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
