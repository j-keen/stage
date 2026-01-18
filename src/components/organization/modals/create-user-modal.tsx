'use client'

import { useState } from 'react'
import { UserCircle, Loader2, Building2, Shield, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { useOrganizationStore } from '@/stores/organization-store'

interface CreateUserModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateUserModal({ open, onClose, onSuccess }: CreateUserModalProps) {
  const { teams, roles } = useOrganizationStore()

  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [roleId, setRoleId] = useState('')
  const [teamId, setTeamId] = useState('none')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      toast.error('아이디를 입력해주세요')
      return
    }

    if (username.length < 3 || username.length > 20) {
      toast.error('아이디는 3~20자여야 합니다')
      return
    }

    if (!name.trim()) {
      toast.error('이름을 입력해주세요')
      return
    }

    if (!password || !/^\d{4}$/.test(password)) {
      toast.error('비밀번호는 4자리 숫자여야 합니다')
      return
    }

    if (!roleId) {
      toast.error('역할을 선택해주세요')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          name: name.trim(),
          password,
          roleId,
          teamId: teamId === 'none' ? null : teamId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '사용자 생성 실패')
      }

      toast.success('계정이 생성되었습니다')
      resetForm()
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '사용자 생성 실패')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setUsername('')
    setName('')
    setPassword('')
    setRoleId('')
    setTeamId('none')
    setShowPassword(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            새 계정 추가
          </DialogTitle>
          <DialogDescription>
            새로운 사용자 계정을 생성합니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user-username">아이디 *</Label>
              <Input
                id="user-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="3~20자"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-name">이름 *</Label>
              <Input
                id="user-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-password">비밀번호 *</Label>
            <div className="relative">
              <Input
                id="user-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="4자리 숫자"
                maxLength={4}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-role">역할 *</Label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger id="user-role">
                <SelectValue placeholder="역할 선택" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    <span className="flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5" />
                      {role.name}
                      {role.description && (
                        <span className="text-xs text-muted-foreground">
                          - {role.description}
                        </span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-team">소속 팀</Label>
            <Select value={teamId} onValueChange={setTeamId}>
              <SelectTrigger id="user-team">
                <SelectValue placeholder="팀 선택 (선택사항)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">미배정</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    <span className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5" />
                      {team.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              생성
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
