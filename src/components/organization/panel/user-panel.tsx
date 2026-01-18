'use client'

import { useState, useEffect, useCallback } from 'react'
import { UserCircle, Building2, Shield, Save, Loader2, Trash2, Calendar, Clock, History, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
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
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PermissionEditor } from './permission-editor'
import { ActivityLogModal } from '../modals/activity-log-modal'
import { useOrganizationStore, type UserWithDetails } from '@/stores/organization-store'
import type { Permissions } from '@/types/database'

interface UserPanelProps {
  user: UserWithDetails
  onUpdate: () => void
  onDelete?: () => void
}

export function UserPanel({ user, onUpdate, onDelete }: UserPanelProps) {
  const { teams, roles } = useOrganizationStore()

  // Form state
  const [name, setName] = useState(user.name)
  const [teamId, setTeamId] = useState(user.team_id || 'none')
  const [roleId, setRoleId] = useState(user.role_id)
  const [isActive, setIsActive] = useState(user.is_active)
  const [memo, setMemo] = useState(user.memo || '')

  // Permission state
  const [permissionMode, setPermissionMode] = useState<'role_only' | 'custom_only'>(
    user.permission_mode
  )
  const [customPermissions, setCustomPermissions] = useState<Permissions | null>(
    user.permissions
  )

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSavingMemo, setIsSavingMemo] = useState(false)
  const [activityLogModalOpen, setActivityLogModalOpen] = useState(false)

  const selectedRole = roles.find((r) => r.id === roleId)
  const rolePermissions = selectedRole?.permissions as Permissions | null

  // Reset form when user changes
  useEffect(() => {
    setName(user.name)
    setTeamId(user.team_id || 'none')
    setRoleId(user.role_id)
    setIsActive(user.is_active)
    setMemo(user.memo || '')
    setPermissionMode(user.permission_mode)
    setCustomPermissions(user.permissions)
  }, [user])

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const userResponse = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          name,
          teamId: teamId === 'none' ? null : teamId,
          roleId,
          isActive,
        }),
      })

      if (!userResponse.ok) {
        throw new Error('사용자 정보 업데이트 실패')
      }

      const permResponse = await fetch(`/api/users/${user.id}/permissions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          permissions: customPermissions,
          permissionMode,
        }),
      })

      if (!permResponse.ok) {
        throw new Error('권한 업데이트 실패')
      }

      toast.success('저장되었습니다')
      onUpdate()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '저장 실패')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id }),
      })

      if (!response.ok) {
        throw new Error('사용자 삭제 실패')
      }

      toast.success('사용자가 삭제되었습니다')
      onDelete?.()
      onUpdate()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '삭제 실패')
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePermissionChange = (permissions: Permissions | null, mode: 'role_only' | 'custom_only') => {
    setPermissionMode(mode)
    setCustomPermissions(permissions)
  }

  const handleMemoSave = useCallback(async () => {
    setIsSavingMemo(true)
    try {
      const response = await fetch(`/api/users/${user.id}/memo`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memo: memo || null }),
      })

      if (!response.ok) {
        throw new Error('메모 저장 실패')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '메모 저장 실패')
    } finally {
      setIsSavingMemo(false)
    }
  }, [user.id, memo])

  // Debounced memo save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (memo !== (user.memo || '')) {
        handleMemoSave()
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [memo, user.memo, handleMemoSave])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '방금 전'
    if (diffMins < 60) return `${diffMins}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 30) return `${diffDays}일 전`
    return formatDate(dateString)
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
              <UserCircle className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">{user.name}</h2>
                <span className="text-xs text-muted-foreground">@{user.username}</span>
                {!isActive && (
                  <Badge variant="secondary" className="text-[10px]">비활성</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>사용자 삭제</AlertDialogTitle>
                  <AlertDialogDescription>
                    정말 &quot;{user.name}&quot; 사용자를 삭제하시겠습니까?
                    이 작업은 되돌릴 수 없습니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      '삭제'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              저장
            </Button>
          </div>
        </div>

        {/* Form - Single Row */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <Label htmlFor="name" className="text-xs shrink-0">이름</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-7 w-24 text-xs"
            />
          </div>
          <div className="flex items-center gap-1">
            <Label htmlFor="team" className="text-xs shrink-0">팀</Label>
            <Select value={teamId} onValueChange={setTeamId}>
              <SelectTrigger id="team" className="h-7 w-28 text-xs">
                <SelectValue placeholder="팀 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">미배정</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {team.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <Label htmlFor="role" className="text-xs shrink-0">역할</Label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger id="role" className="h-7 w-24 text-xs">
                <SelectValue placeholder="역할" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {role.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <Switch
              id="active"
              checked={isActive}
              onCheckedChange={setIsActive}
              className="scale-75"
            />
            <Label htmlFor="active" className="text-xs cursor-pointer">
              활성
            </Label>
          </div>
        </div>

        {/* Activity Info - 3 Columns */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-muted/30">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">가입일</span>
              </div>
              <p className="text-sm font-medium">{formatDate(user.created_at)}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/30">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">최근 활동</span>
              </div>
              <p className="text-sm font-medium">
                {user.last_activity_at ? formatRelativeTime(user.last_activity_at) : '활동 없음'}
              </p>
            </CardContent>
          </Card>
          <Card
            className="bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setActivityLogModalOpen(true)}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <History className="h-4 w-4" />
                <span className="text-sm font-medium">활동 로그</span>
              </div>
              <p className="text-sm text-primary">전체 보기 →</p>
            </CardContent>
          </Card>
        </div>

        {/* Memo + Permission - 2 Columns */}
        <div className="grid grid-cols-2 gap-4" style={{ minHeight: '320px' }}>
          {/* Memo Card */}
          <Card className="flex flex-col">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                메모
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 flex-1 flex flex-col">
              <Textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="관리자 메모를 입력하세요..."
                className="text-sm resize-none flex-1 min-h-0"
              />
              <div className="flex items-center justify-end gap-2 mt-2">
                {isSavingMemo && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    저장 중...
                  </span>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMemoSave}
                  disabled={isSavingMemo || memo === (user.memo || '')}
                >
                  <Save className="h-3.5 w-3.5 mr-1" />
                  저장
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Permission Editor Card */}
          <Card className="flex flex-col">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                권한 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 flex-1">
              <PermissionEditor
                rolePermissions={rolePermissions}
                customPermissions={customPermissions}
                permissionMode={permissionMode}
                roleName={selectedRole?.name || '알 수 없음'}
                onChange={handlePermissionChange}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <ActivityLogModal
        open={activityLogModalOpen}
        onClose={() => setActivityLogModalOpen(false)}
        userId={user.id}
        userName={user.name}
      />
    </ScrollArea>
  )
}
