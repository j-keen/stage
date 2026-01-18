'use client'

import { useState, useMemo } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { BADGE_COLOR_PRESETS, findMatchingPreset } from '@/lib/badge-presets'
import { cn } from '@/lib/utils'
import { Check, AlertCircle } from 'lucide-react'

interface BadgeAddModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'status' | 'category'
  existingIds: string[]
  onAdd: (badge: {
    id: string
    label: string
    color: string
    bgColor: string
    bold?: boolean
  }) => void
}

export function BadgeAddModal({
  open,
  onOpenChange,
  type,
  existingIds,
  onAdd,
}: BadgeAddModalProps) {
  const [label, setLabel] = useState('')
  const [id, setId] = useState('')
  const [color, setColor] = useState('#1E40AF')
  const [bgColor, setBgColor] = useState('#DBEAFE')
  const [bold, setBold] = useState(false)

  const resetForm = () => {
    setLabel('')
    setId('')
    setColor('#1E40AF')
    setBgColor('#DBEAFE')
    setBold(false)
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const generateId = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[가-힣]/g, (char) => {
        // Simple Korean to romanization mapping (basic)
        return `_${char.charCodeAt(0).toString(16)}_`
      })
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .substring(0, 30) || 'custom'
  }

  const handleLabelChange = (newLabel: string) => {
    setLabel(newLabel)
    // Auto-generate ID if user hasn't manually edited it
    if (!id || id === generateId(label)) {
      setId(generateId(newLabel))
    }
  }

  const matchingPreset = findMatchingPreset(color, bgColor)

  const handlePresetSelect = (fg: string, bg: string) => {
    setColor(fg)
    setBgColor(bg)
  }

  const idError = useMemo(() => {
    if (!id) return null
    if (!/^[a-z][a-z0-9_]*$/.test(id)) {
      return '영문 소문자, 숫자, 언더스코어만 사용 가능 (영문으로 시작)'
    }
    if (existingIds.includes(id)) {
      return '이미 사용 중인 ID입니다'
    }
    return null
  }, [id, existingIds])

  const handleAdd = () => {
    if (!label.trim() || !id.trim() || idError) return

    onAdd({
      id: id.trim(),
      label: label.trim(),
      color,
      bgColor,
      bold,
    })
    handleClose()
  }

  const isValid = label.trim() !== '' && id.trim() !== '' && !idError

  const title = type === 'status' ? '상태 뱃지 추가' : '분류 뱃지 추가'
  const description = type === 'status'
    ? '새로운 상태 뱃지를 추가합니다'
    : '새로운 분류 뱃지를 추가합니다'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Live Preview */}
          <div className="flex items-center justify-center py-4 bg-muted/50 rounded-lg">
            {type === 'status' ? (
              <span
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-1.5 text-base",
                  bold ? "font-bold" : "font-medium"
                )}
                style={{
                  backgroundColor: bgColor,
                  color: color,
                }}
              >
                {label || '새 상태'}
              </span>
            ) : (
              <span
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded border-l-4 px-3 py-1.5 text-base",
                  bold ? "font-bold" : "font-medium"
                )}
                style={{
                  borderLeftColor: color,
                  backgroundColor: bgColor,
                  color: color,
                }}
              >
                {label || '새 분류'}
              </span>
            )}
          </div>

          {/* Label Input */}
          <div className="space-y-2">
            <Label htmlFor="badge-label">표시 텍스트</Label>
            <Input
              id="badge-label"
              value={label}
              onChange={(e) => handleLabelChange(e.target.value)}
              placeholder="뱃지에 표시될 텍스트"
              autoFocus
            />
          </div>

          {/* ID Input */}
          <div className="space-y-2">
            <Label htmlFor="badge-id">
              ID <span className="text-xs text-muted-foreground">(영문)</span>
            </Label>
            <Input
              id="badge-id"
              value={id}
              onChange={(e) => setId(e.target.value.toLowerCase())}
              placeholder="고유 식별자 (예: new_status)"
              className={cn(idError && 'border-destructive')}
            />
            {idError ? (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {idError}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                고객 데이터 저장 시 사용되는 값입니다
              </p>
            )}
          </div>

          {/* Color Presets */}
          <div className="space-y-2">
            <Label>색상 프리셋</Label>
            <div className="grid grid-cols-6 gap-1.5 max-h-32 overflow-y-auto p-1">
              {BADGE_COLOR_PRESETS.map((preset) => {
                const isSelected = matchingPreset?.name === preset.name
                return (
                  <button
                    key={preset.name}
                    type="button"
                    title={preset.name}
                    onClick={() => handlePresetSelect(preset.fg, preset.bg)}
                    className={cn(
                      'relative h-8 rounded-md border transition-all hover:scale-105',
                      isSelected && 'ring-2 ring-primary ring-offset-1'
                    )}
                    style={{ backgroundColor: preset.bg }}
                  >
                    <span
                      className="absolute inset-0 flex items-center justify-center text-xs font-medium"
                      style={{ color: preset.fg }}
                    >
                      {isSelected ? <Check className="h-4 w-4" /> : 'Aa'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="space-y-3">
            <Label>커스텀 색상</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">글자색</Label>
                <div className="flex gap-1">
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-9 p-1 cursor-pointer"
                  />
                  <Input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 font-mono text-sm"
                    placeholder="#000000"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">배경색</Label>
                <div className="flex gap-1">
                  <Input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-9 p-1 cursor-pointer"
                  />
                  <Input
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 font-mono text-sm"
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bold Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="badge-bold"
              checked={bold}
              onCheckedChange={(checked) => setBold(checked === true)}
            />
            <Label htmlFor="badge-bold" className="text-sm cursor-pointer">
              글자 굵게 표시
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            취소
          </Button>
          <Button onClick={handleAdd} disabled={!isValid}>
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
