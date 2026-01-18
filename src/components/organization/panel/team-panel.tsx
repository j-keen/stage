'use client'

import { useState, useEffect, useCallback } from 'react'
import { Building2, Users, Save, Loader2, Trash2, UserCircle, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { useOrganizationStore, type UserWithDetails } from '@/stores/organization-store'
import type { Team } from '@/types/database'

interface TeamPanelProps {
  team: Team
  onUpdate: () => void
  onDelete: () => void
}

export function TeamPanel({ team, onUpdate, onDelete }: TeamPanelProps) {
  const { getTeamMembers, selectNode } = useOrganizationStore()

  // Form state
  const [name, setName] = useState(team.name)
  const [description, setDescription] = useState(team.description || '')
  const [memo, setMemo] = useState(team.memo || '')

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSavingMemo, setIsSavingMemo] = useState(false)

  const members = getTeamMembers(team.id)

  // Reset form when team changes
  useEffect(() => {
    setName(team.name)
    setDescription(team.description || '')
    setMemo(team.memo || '')
  }, [team])

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('팀 이름을 입력해주세요')
      return
    }

    setIsSaving(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('teams')
        .update({
          name: name.trim(),
          description: description.trim() || null,
        })
        .eq('id', team.id)

      if (error) throw error

      toast.success('저장되었습니다')
      onUpdate()
    } catch (error) {
      toast.error('저장 실패')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const supabase = createClient()

      // First, unassign all members
      if (members.length > 0) {
        const { error: unassignError } = await supabase
          .from('users')
          .update({ team_id: null })
          .eq('team_id', team.id)

        if (unassignError) throw unassignError
      }

      // Then delete the team
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', team.id)

      if (error) throw error

      toast.success('팀이 삭제되었습니다')
      onDelete()
    } catch (error) {
      toast.error('삭제 실패')
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleMemberClick = (user: UserWithDetails) => {
    selectNode({ type: 'user', id: user.id })
  }

  const handleMemoSave = useCallback(async () => {
    setIsSavingMemo(true)
    try {
      const response = await fetch(`/api/teams/${team.id}/memo`, {
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
  }, [team.id, memo])

  // Debounced memo save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (memo !== (team.memo || '')) {
        handleMemoSave()
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [memo, team.memo, handleMemoSave])

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">{team.name}</h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />
                {members.length}명의 팀원
              </p>
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
                  <AlertDialogTitle>팀 삭제</AlertDialogTitle>
                  <AlertDialogDescription>
                    정말 &quot;{team.name}&quot; 팀을 삭제하시겠습니까?
                    {members.length > 0 && (
                      <>
                        <br />
                        <strong>{members.length}명</strong>의 팀원이 미배정 상태가 됩니다.
                      </>
                    )}
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

        {/* Form */}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-xs">팀 이름</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="description" className="text-xs">설명</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="팀에 대한 설명 (선택사항)"
              rows={2}
              className="text-sm resize-none"
            />
          </div>
        </div>

        {/* Team Members */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">팀원 목록</span>
            <Badge variant="secondary" className="text-[10px]">{members.length}명</Badge>
          </div>
          {members.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <Users className="h-5 w-5 mx-auto mb-1 opacity-50" />
              <p className="text-xs">팀원이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => handleMemberClick(member)}
                >
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{member.name}</span>
                  </div>
                  {member.role && (
                    <Badge variant="outline" className="text-[10px]">
                      {member.role.name}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Memo Card */}
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" />
              메모
              {isSavingMemo && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <Textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="팀에 대한 메모를 입력하세요..."
              rows={3}
              className="text-sm resize-none"
            />
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}
