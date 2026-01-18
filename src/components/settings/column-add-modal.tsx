'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CustomColumnType } from '@/types/database'

interface ColumnAddModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (column: {
    label: string
    type: CustomColumnType
    options?: string[]
  }) => void
}

const COLUMN_TYPES: { value: CustomColumnType; label: string }[] = [
  { value: 'text', label: '텍스트' },
  { value: 'number', label: '숫자' },
  { value: 'date', label: '날짜' },
  { value: 'select', label: '선택목록' },
  { value: 'boolean', label: '예/아니오' },
]

export function ColumnAddModal({
  open,
  onOpenChange,
  onAdd,
}: ColumnAddModalProps) {
  const [label, setLabel] = useState('')
  const [type, setType] = useState<CustomColumnType>('text')
  const [options, setOptions] = useState<string[]>([''])

  // Reset options when type changes away from select
  useEffect(() => {
    if (type !== 'select') {
      setOptions([''])
    }
  }, [type])

  const resetForm = () => {
    setLabel('')
    setType('text')
    setOptions([''])
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const handleAddOption = () => {
    setOptions([...options, ''])
  }

  const handleRemoveOption = (index: number) => {
    if (options.length > 1) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleAdd = () => {
    if (!label.trim()) return

    const column: {
      label: string
      type: CustomColumnType
      options?: string[]
    } = {
      label: label.trim(),
      type,
    }

    if (type === 'select') {
      const validOptions = options.filter(o => o.trim() !== '')
      if (validOptions.length > 0) {
        column.options = validOptions
      }
    }

    onAdd(column)
    handleClose()
  }

  const isValid = label.trim() !== '' && (type !== 'select' || options.some(o => o.trim() !== ''))

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>컬럼 추가</DialogTitle>
          <DialogDescription>
            새로운 커스텀 컬럼을 추가합니다
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Column Name */}
          <div className="space-y-1.5">
            <Label htmlFor="column-label" className="text-xs">컬럼 이름</Label>
            <Input
              id="column-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="새 컬럼 이름"
              autoFocus
              className="h-8"
            />
          </div>

          {/* Data Type - Inline buttons */}
          <div className="space-y-1.5">
            <Label className="text-xs">데이터 타입</Label>
            <div className="flex flex-wrap gap-1">
              {COLUMN_TYPES.map((columnType) => (
                <button
                  key={columnType.value}
                  type="button"
                  onClick={() => setType(columnType.value)}
                  className={cn(
                    'px-2.5 py-1 text-xs rounded-md border transition-colors',
                    type === columnType.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:bg-muted'
                  )}
                >
                  {columnType.label}
                </button>
              ))}
            </div>
          </div>

          {/* Options for Select Type */}
          {type === 'select' && (
            <div className="space-y-2 p-3 bg-muted/50 rounded-lg border">
              <div className="flex items-center justify-between">
                <Label className="text-xs">선택 옵션</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddOption}
                  className="h-6 px-2 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  추가
                </Button>
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-1">
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`옵션 ${index + 1}`}
                      className="h-7 text-xs flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(index)}
                      disabled={options.length <= 1}
                      className="h-7 w-7 shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={handleClose}>
            취소
          </Button>
          <Button size="sm" onClick={handleAdd} disabled={!isValid}>
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
