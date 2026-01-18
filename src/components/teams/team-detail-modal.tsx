'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import type { TeamData } from './team-drop-zone'

interface TeamDetailModalProps {
  team: TeamData | null
  teams: TeamData[]
  open: boolean
  onClose: () => void
  onSave: () => void
}

export function TeamDetailModal({
  team,
  teams,
  open,
  onClose,
  onSave,
}: TeamDetailModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name,
        description: team.description || '',
        parent_id: team.parent_id || '',
      })
    }
  }, [team])

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('팀 이름을 입력해주세요')
      return
    }

    setIsSaving(true)
    const supabase = createClient()

    const data = {
      name: formData.name,
      description: formData.description || null,
      parent_id: formData.parent_id || null,
    }

    const { error } = team
      ? await supabase.from('teams').update(data).eq('id', team.id)
      : await supabase.from('teams').insert(data)

    setIsSaving(false)

    if (error) {
      toast.error('저장 실패')
    } else {
      toast.success(team ? '수정되었습니다' : '생성되었습니다')
      onSave()
    }
  }

  const handleDelete = async () => {
    if (!team) return
    if (!confirm(`"${team.name}" 팀을 삭제하시겠습니까?`)) return

    setIsSaving(true)
    const supabase = createClient()

    // First, remove team_id from users in this team
    await supabase
      .from('users')
      .update({ team_id: null })
      .eq('team_id', team.id)

    const { error } = await supabase.from('teams').delete().eq('id', team.id)

    setIsSaving(false)

    if (error) {
      toast.error('삭제 실패')
    } else {
      toast.success('삭제되었습니다')
      onSave()
    }
  }

  // Filter out the current team from parent options to prevent circular reference
  const parentOptions = teams.filter((t) => t.id !== team?.id)

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{team ? '팀 수정' : '팀 추가'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>팀 이름 *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="팀 이름"
            />
          </div>

          <div className="space-y-2">
            <Label>설명</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="팀 설명"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>상위 팀</Label>
            <Select
              value={formData.parent_id || 'none'}
              onValueChange={(value) =>
                setFormData({ ...formData, parent_id: value === 'none' ? '' : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="상위 팀 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">없음 (최상위)</SelectItem>
                {parentOptions.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between pt-4">
            {team && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isSaving}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                삭제
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button onClick={handleSubmit} disabled={isSaving}>
                {team ? '수정' : '생성'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
