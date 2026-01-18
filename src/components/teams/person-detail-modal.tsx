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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Shield, Users } from 'lucide-react'
import type { PersonData } from './draggable-person-card'
import type { TeamData } from './team-drop-zone'

interface Role {
  id: string
  name: string
  description: string | null
  permissions: Record<string, boolean>
}

interface PersonDetailModalProps {
  person: PersonData | null
  teams: TeamData[]
  open: boolean
  onClose: () => void
  onSave: () => void
}

export function PersonDetailModal({
  person,
  teams,
  open,
  onClose,
  onSave,
}: PersonDetailModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    team_id: '',
    role_id: '',
  })
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchRoles = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('roles')
        .select('id, name, description, permissions')
        .order('name')

      if (data) {
        setRoles(data)
      }
    }

    if (open) {
      fetchRoles()
    }
  }, [open])

  useEffect(() => {
    if (person) {
      setFormData({
        name: person.name,
        team_id: person.team_id || '',
        role_id: '',
      })
      // Fetch current role
      const fetchUserRole = async () => {
        const supabase = createClient()
        const { data } = await supabase
          .from('users')
          .select('role_id')
          .eq('id', person.id)
          .single()

        if (data?.role_id) {
          setFormData((prev) => ({ ...prev, role_id: data.role_id }))
        }
      }
      fetchUserRole()
    }
  }, [person])

  useEffect(() => {
    if (formData.role_id) {
      const role = roles.find((r) => r.id === formData.role_id)
      setSelectedRole(role || null)
    } else {
      setSelectedRole(null)
    }
  }, [formData.role_id, roles])

  const handleSubmit = async () => {
    if (!person) return
    if (!formData.name.trim()) {
      toast.error('이름을 입력해주세요')
      return
    }

    setIsSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('users')
      .update({
        name: formData.name,
        team_id: formData.team_id || null,
        role_id: formData.role_id || null,
      })
      .eq('id', person.id)

    setIsSaving(false)

    if (error) {
      toast.error('저장 실패')
    } else {
      toast.success('수정되었습니다')
      onSave()
    }
  }

  const getPermissionLabel = (key: string): string => {
    const labels: Record<string, string> = {
      customers_view: '고객 조회',
      customers_edit: '고객 수정',
      customers_delete: '고객 삭제',
      dashboard_view: '대시보드 조회',
      settings_view: '설정 조회',
      settings_edit: '설정 수정',
      users_manage: '사용자 관리',
      teams_manage: '팀 관리',
      branches_manage: '지점 관리',
    }
    return labels[key] || key
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>팀원 정보 수정</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>이름</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="이름"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              소속 팀
            </Label>
            <Select
              value={formData.team_id || 'none'}
              onValueChange={(value) =>
                setFormData({ ...formData, team_id: value === 'none' ? '' : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="팀 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">미배정</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              역할
            </Label>
            <Select
              value={formData.role_id || 'none'}
              onValueChange={(value) =>
                setFormData({ ...formData, role_id: value === 'none' ? '' : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="역할 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">역할 없음</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Role permissions summary */}
          {selectedRole && (
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {selectedRole.name} 권한
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {selectedRole.description && (
                  <p className="text-xs text-muted-foreground mb-2">
                    {selectedRole.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-1">
                  {Object.entries(selectedRole.permissions || {}).map(([key, value]) => (
                    <Badge
                      key={key}
                      variant={value ? 'default' : 'secondary'}
                      className="text-[10px]"
                    >
                      {getPermissionLabel(key)}: {value ? 'O' : 'X'}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              저장
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
