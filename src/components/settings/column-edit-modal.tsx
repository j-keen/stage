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
import { Switch } from '@/components/ui/switch'
import { Info } from 'lucide-react'

interface ColumnEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  columnId: string
  label: string
  visible: boolean
  onSave: (label: string, visible: boolean) => void
}

const CUSTOM_COLUMN_IDS = ['custom1', 'custom2', 'custom3', 'custom4', 'custom5']

export function ColumnEditModal({
  open,
  onOpenChange,
  columnId,
  label,
  visible,
  onSave,
}: ColumnEditModalProps) {
  const [editLabel, setEditLabel] = useState(label)
  const [editVisible, setEditVisible] = useState(visible)

  useEffect(() => {
    if (open) {
      setEditLabel(label)
      setEditVisible(visible)
    }
  }, [open, label, visible])

  const isCustomColumn = CUSTOM_COLUMN_IDS.includes(columnId)

  const handleSave = () => {
    onSave(editLabel, editVisible)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>컬럼 설정</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {columnId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Custom Column Info */}
          {isCustomColumn && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg text-sm">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div className="text-blue-700 dark:text-blue-300">
                예비 컬럼입니다. 이름을 변경하여 필요한 용도로 사용할 수 있습니다.
              </div>
            </div>
          )}

          {/* Label Input */}
          <div className="space-y-2">
            <Label htmlFor="column-label">표시 이름</Label>
            <Input
              id="column-label"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              placeholder="컬럼 이름"
            />
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="column-visible">테이블에 표시</Label>
              <p className="text-xs text-muted-foreground">
                테이블에서 이 컬럼을 표시합니다
              </p>
            </div>
            <Switch
              id="column-visible"
              checked={editVisible}
              onCheckedChange={setEditVisible}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSave}>적용</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
