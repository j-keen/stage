'use client'

import { useState, useEffect } from 'react'
import { Shield, Loader2 } from 'lucide-react'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { PermissionEditor } from '../panel/permission-editor'
import type { Permissions } from '@/types/database'

interface PermissionModalProps {
  open: boolean
  onClose: () => void
  userId: string
  userName: string
  rolePermissions: Permissions | null
  customPermissions: Permissions | null
  permissionMode: 'role_only' | 'custom_only'
  roleName: string
  onSave: (permissions: Permissions | null, mode: 'role_only' | 'custom_only') => Promise<void>
}

export function PermissionModal({
  open,
  onClose,
  userId,
  userName,
  rolePermissions,
  customPermissions,
  permissionMode,
  roleName,
  onSave,
}: PermissionModalProps) {
  const [localPermissions, setLocalPermissions] = useState<Permissions | null>(customPermissions)
  const [localMode, setLocalMode] = useState<'role_only' | 'custom_only'>(permissionMode)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setLocalPermissions(customPermissions)
      setLocalMode(permissionMode)
    }
  }, [open, customPermissions, permissionMode])

  const handleChange = (permissions: Permissions | null, mode: 'role_only' | 'custom_only') => {
    setLocalPermissions(permissions)
    setLocalMode(mode)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(localPermissions, localMode)
      toast.success('권한이 저장되었습니다')
      onClose()
    } catch (error) {
      toast.error('권한 저장 실패')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            권한 설정 - {userName}
          </DialogTitle>
          <DialogDescription>
            사용자의 권한을 설정합니다. 역할 권한을 그대로 사용하거나 커스텀 권한을 설정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <PermissionEditor
            rolePermissions={rolePermissions}
            customPermissions={localPermissions}
            permissionMode={localMode}
            roleName={roleName}
            onChange={handleChange}
          />
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
