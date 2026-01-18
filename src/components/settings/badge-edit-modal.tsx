'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { BADGE_COLOR_PRESETS, findMatchingPreset } from '@/lib/badge-presets'
import { cn } from '@/lib/utils'
import { Check, Loader2 } from 'lucide-react'
import type { BadgeConfig } from '@/stores/settings-store'

interface BadgeEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  badge: BadgeConfig
  onSave: (badge: BadgeConfig) => Promise<void>
}

export function BadgeEditModal({
  open,
  onOpenChange,
  title,
  badge,
  onSave,
}: BadgeEditModalProps) {
  const [label, setLabel] = useState(badge.label)
  const [color, setColor] = useState(badge.color)
  const [bgColor, setBgColor] = useState(badge.bgColor)
  const [hidden, setHidden] = useState(badge.hidden || false)
  const [bold, setBold] = useState(badge.bold || false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setLabel(badge.label)
      setColor(badge.color)
      setBgColor(badge.bgColor)
      setHidden(badge.hidden || false)
      setBold(badge.bold || false)
    }
  }, [open, badge])

  const matchingPreset = findMatchingPreset(color, bgColor)

  const handlePresetSelect = (fg: string, bg: string) => {
    setColor(fg)
    setBgColor(bg)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave({
        id: badge.id,
        label,
        color,
        bgColor,
        hidden,
        bold,
        order: badge.order,
        isDefault: badge.isDefault,
      })
      onOpenChange(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Live Preview */}
          <div className="flex items-center justify-center py-4 bg-muted/50 rounded-lg">
            <Badge
              className={cn("text-base px-4 py-1.5", bold ? "font-bold" : "font-medium")}
              style={{
                backgroundColor: bgColor,
                color: color,
              }}
            >
              {label}
            </Badge>
          </div>

          {/* Label Input */}
          <div className="space-y-2">
            <Label htmlFor="badge-label">표시 텍스트</Label>
            <Input
              id="badge-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="뱃지 텍스트"
            />
          </div>

          {/* Color Presets */}
          <div className="space-y-2">
            <Label>색상 프리셋</Label>
            <div className="grid grid-cols-6 gap-1.5 max-h-40 overflow-y-auto p-1">
              {BADGE_COLOR_PRESETS.map((preset) => {
                const isSelected = matchingPreset?.name === preset.name
                return (
                  <button
                    key={preset.name}
                    type="button"
                    title={preset.name}
                    onClick={() => handlePresetSelect(preset.fg, preset.bg)}
                    className={cn(
                      'relative h-9 rounded-md border transition-all hover:scale-105',
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

          {/* Hidden Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="badge-hidden"
              checked={hidden}
              onCheckedChange={(checked) => setHidden(checked === true)}
            />
            <Label htmlFor="badge-hidden" className="text-sm cursor-pointer">
              선택 옵션에서 숨김 (기존 데이터는 그대로 표시됨)
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            적용
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
