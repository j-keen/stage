'use client'

import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Permissions } from '@/types/database'

const PERMISSION_LABELS: Record<keyof Permissions, string> = {
  customers: '고객',
  teams: '조직',
  users: '계정',
  settings: '설정',
  dashboard: '대시보드',
  branches: '접수처',
}

const ACTION_LABELS: Record<string, string> = {
  view: '조회',
  create: '생성',
  edit: '수정',
  delete: '삭제',
  assign: '배정',
  export: '내보내기',
  viewAll: '전체통계',
}

interface PermissionSummaryProps {
  permissions: Permissions | null
  permissionMode: 'role_only' | 'custom_only'
  rolePermissions: Permissions | null
  onEdit: () => void
}

export function PermissionSummary({
  permissions,
  permissionMode,
  rolePermissions,
  onEdit,
}: PermissionSummaryProps) {
  // Use custom permissions if in custom mode, otherwise use role permissions
  const activePermissions = permissionMode === 'custom_only' ? permissions : rolePermissions

  if (!activePermissions) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>권한 정보 없음</span>
        <Button variant="ghost" size="sm" className="h-6 px-2" onClick={onEdit}>
          <Settings className="h-3 w-3 mr-1" />
          편집
        </Button>
      </div>
    )
  }

  // Build summary string
  const summaryParts: string[] = []

  for (const [resource, actions] of Object.entries(activePermissions)) {
    const resourceLabel = PERMISSION_LABELS[resource as keyof Permissions]
    if (!resourceLabel || !actions) continue

    const enabledActions: string[] = []
    for (const [action, enabled] of Object.entries(actions as Record<string, boolean>)) {
      if (enabled) {
        const actionLabel = ACTION_LABELS[action]
        if (actionLabel) {
          enabledActions.push(actionLabel)
        }
      }
    }

    if (enabledActions.length > 0) {
      summaryParts.push(`${resourceLabel}(${enabledActions.join(',')})`)
    }
  }

  const summaryText = summaryParts.length > 0 ? summaryParts.join(' ') : '권한 없음'

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground">권한:</span>
      <span className="text-xs truncate max-w-md" title={summaryText}>
        {summaryText}
      </span>
      {permissionMode === 'custom_only' && (
        <Badge variant="secondary" className="text-[10px] px-1">커스텀</Badge>
      )}
      <Button variant="ghost" size="sm" className="h-6 px-2" onClick={onEdit}>
        <Settings className="h-3 w-3 mr-1" />
        편집
      </Button>
    </div>
  )
}
