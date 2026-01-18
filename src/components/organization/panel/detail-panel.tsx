'use client'

import { Building2, UserCircle } from 'lucide-react'
import { TeamPanel } from './team-panel'
import { UserPanel } from './user-panel'
import { useOrganizationStore } from '@/stores/organization-store'

interface DetailPanelProps {
  onUpdate: () => void
}

export function DetailPanel({ onUpdate }: DetailPanelProps) {
  const { selectedNode, getSelectedTeam, getSelectedUser, selectNode } = useOrganizationStore()

  if (!selectedNode) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
        <div className="flex items-center gap-4 mb-4">
          <Building2 className="h-12 w-12 opacity-30" />
          <UserCircle className="h-12 w-12 opacity-30" />
        </div>
        <p className="text-sm">팀 또는 사용자를 선택하세요</p>
        <p className="text-xs mt-1">좌측 트리에서 항목을 클릭하면 상세 정보가 표시됩니다</p>
      </div>
    )
  }

  if (selectedNode.type === 'team') {
    const team = getSelectedTeam()
    if (!team) {
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          <p className="text-sm">팀을 찾을 수 없습니다</p>
        </div>
      )
    }

    return (
      <TeamPanel
        team={team}
        onUpdate={onUpdate}
        onDelete={() => {
          selectNode(null)
          onUpdate()
        }}
      />
    )
  }

  if (selectedNode.type === 'user') {
    const user = getSelectedUser()
    if (!user) {
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          <p className="text-sm">사용자를 찾을 수 없습니다</p>
        </div>
      )
    }

    return (
      <UserPanel
        user={user}
        onUpdate={onUpdate}
        onDelete={() => {
          selectNode(null)
        }}
      />
    )
  }

  return null
}
