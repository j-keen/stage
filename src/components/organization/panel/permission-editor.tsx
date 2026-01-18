'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { Permissions } from '@/types/database'

const PERMISSION_CONFIG: Record<keyof Permissions, {
  label: string
  actions: Record<string, string>
}> = {
  customers: {
    label: '고객',
    actions: {
      view: '조회',
      create: '생성',
      edit: '수정',
      assign: '배정',
    },
  },
  teams: {
    label: '조직',
    actions: {
      view: '조회',
      create: '생성',
      edit: '수정',
      delete: '삭제',
    },
  },
  users: {
    label: '계정',
    actions: {
      view: '조회',
      create: '생성',
      edit: '수정',
      delete: '삭제',
    },
  },
  settings: {
    label: '설정',
    actions: {
      view: '조회',
      edit: '수정',
    },
  },
  dashboard: {
    label: '대시보드',
    actions: {
      view: '조회',
      viewAll: '전체통계',
    },
  },
  branches: {
    label: '접수처',
    actions: {
      view: '조회',
      create: '생성',
      edit: '수정',
      delete: '삭제',
    },
  },
}

// Permission descriptions for tooltips
const PERMISSION_DESCRIPTIONS: Record<string, Record<string, string>> = {
  customers: {
    view: '고객 정보를 조회할 수 있습니다',
    create: '새 고객을 등록할 수 있습니다',
    edit: '고객 정보를 수정할 수 있습니다',
    assign: '고객을 다른 담당자에게 배정할 수 있습니다',
  },
  teams: {
    view: '팀 목록을 조회할 수 있습니다',
    create: '새 팀을 생성할 수 있습니다',
    edit: '팀 정보를 수정할 수 있습니다',
    delete: '팀을 삭제할 수 있습니다',
  },
  users: {
    view: '계정 목록을 조회할 수 있습니다',
    create: '새 계정을 생성할 수 있습니다',
    edit: '계정 정보를 수정할 수 있습니다',
    delete: '계정을 삭제할 수 있습니다',
  },
  settings: {
    view: '설정을 조회할 수 있습니다',
    edit: '설정을 수정할 수 있습니다',
  },
  dashboard: {
    view: '대시보드를 조회할 수 있습니다',
    viewAll: '전체 통계를 조회할 수 있습니다',
  },
  branches: {
    view: '접수처 목록을 조회할 수 있습니다',
    create: '새 접수처를 생성할 수 있습니다',
    edit: '접수처 정보를 수정할 수 있습니다',
    delete: '접수처를 삭제할 수 있습니다',
  },
}

type PermissionMode = 'role_only' | 'custom_only'

interface PermissionEditorProps {
  rolePermissions: Permissions | null
  customPermissions: Permissions | null
  permissionMode: PermissionMode
  roleName: string
  onChange: (permissions: Permissions | null, mode: PermissionMode) => void
  disabled?: boolean
}

// Default empty permissions
const createEmptyPermissions = (): Permissions => ({
  customers: { view: false, create: false, edit: false, delete: false, assign: false, export: false },
  teams: { view: false, create: false, edit: false, delete: false },
  users: { view: false, create: false, edit: false, delete: false },
  settings: { view: false, edit: false },
  dashboard: { view: false, viewAll: false },
  branches: { view: false, create: false, edit: false, delete: false },
})
// Note: customers still has delete/export in the permissions object for DB compatibility,
// but they are hidden from UI in PERMISSION_CONFIG

export function PermissionEditor({
  rolePermissions,
  customPermissions,
  permissionMode,
  roleName,
  onChange,
  disabled = false,
}: PermissionEditorProps) {
  const [mode, setMode] = useState<PermissionMode>(permissionMode)
  const [permissions, setPermissions] = useState<Permissions>(
    customPermissions || createEmptyPermissions()
  )

  // Sync with props
  useEffect(() => {
    setMode(permissionMode)
  }, [permissionMode])

  useEffect(() => {
    setPermissions(customPermissions || createEmptyPermissions())
  }, [customPermissions])

  const handleModeChange = (newMode: PermissionMode) => {
    setMode(newMode)
    if (newMode === 'custom_only') {
      // Initialize from role permissions if switching to custom
      const initialPermissions = customPermissions || rolePermissions || createEmptyPermissions()
      setPermissions(initialPermissions)
      onChange(initialPermissions, newMode)
    } else {
      onChange(null, newMode)
    }
  }

  const togglePermission = (resource: keyof Permissions, action: string) => {
    if (disabled || mode === 'role_only') return

    const currentValue = (permissions[resource] as Record<string, boolean>)[action] || false
    const newPermissions = {
      ...permissions,
      [resource]: {
        ...(permissions[resource] || {}),
        [action]: !currentValue,
      },
    } as Permissions

    setPermissions(newPermissions)
    onChange(newPermissions, mode)
  }

  const getPermissionValue = (resource: keyof Permissions, action: string): boolean => {
    if (mode === 'role_only') {
      return (rolePermissions?.[resource] as Record<string, boolean>)?.[action] || false
    }
    return (permissions[resource] as Record<string, boolean>)?.[action] || false
  }

  const isLocked = mode === 'role_only'

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-3">
        {/* Permission Mode Selection - Toggle Buttons */}
        <div className="flex rounded-lg border p-1 bg-muted/30">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => handleModeChange('role_only')}
            className={cn(
              'flex-1 h-8 text-xs font-medium transition-all',
              mode === 'role_only'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            역할 권한
            <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">
              {roleName}
            </Badge>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => handleModeChange('custom_only')}
            className={cn(
              'flex-1 h-8 text-xs font-medium transition-all',
              mode === 'custom_only'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            커스텀 권한
          </Button>
        </div>

        {/* Permission Grid - Compact */}
        <div className={cn('space-y-2', isLocked && 'opacity-50')}>
          {(Object.keys(PERMISSION_CONFIG) as Array<keyof Permissions>).map((resource) => (
            <div key={resource} className="flex items-center gap-2 py-1 border-b border-border/50 last:border-0">
              <span className="text-xs font-medium w-14 shrink-0">
                {PERMISSION_CONFIG[resource].label}
              </span>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {Object.entries(PERMISSION_CONFIG[resource].actions).map(([action, label]) => {
                  const isChecked = getPermissionValue(resource, action)
                  const description = PERMISSION_DESCRIPTIONS[resource]?.[action]

                  return (
                    <Tooltip key={action}>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1">
                          <Switch
                            id={`${resource}-${action}`}
                            checked={isChecked}
                            onCheckedChange={() => togglePermission(resource, action)}
                            disabled={disabled || isLocked}
                            className="h-4 w-7 data-[state=checked]:bg-primary"
                          />
                          <Label
                            htmlFor={`${resource}-${action}`}
                            className="text-[11px] text-muted-foreground cursor-pointer"
                          >
                            {label}
                          </Label>
                        </div>
                      </TooltipTrigger>
                      {description && (
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-xs">{description}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}
