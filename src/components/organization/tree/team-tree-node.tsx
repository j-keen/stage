'use client'

import { useDroppable } from '@dnd-kit/core'
import { Building2, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { Team } from '@/types/database'

interface TeamTreeNodeProps {
  team: Team
  memberCount: number
  depth: number
  isSelected: boolean
  onClick: () => void
  children?: React.ReactNode
}

export function TeamTreeNode({
  team,
  memberCount,
  depth,
  isSelected,
  onClick,
  children,
}: TeamTreeNodeProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `team-${team.id}`,
    data: { type: 'team', team },
  })

  return (
    <div ref={setNodeRef}>
      <div
        className={cn(
          'flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer select-none',
          'hover:bg-accent/50 transition-colors',
          isSelected && 'bg-accent',
          isOver && 'ring-2 ring-primary bg-primary/5'
        )}
        onClick={onClick}
      >
        {/* Indent based on depth */}
        <div style={{ width: `${depth * 16}px` }} />

        {/* Team icon */}
        <Building2 className="h-4 w-4 text-primary flex-shrink-0" />

        {/* Team name */}
        <span className="font-medium text-sm truncate flex-1">{team.name}</span>

        {/* Member count badge */}
        {memberCount > 0 && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 gap-1">
            <Users className="h-3 w-3" />
            {memberCount}
          </Badge>
        )}
      </div>

      {/* Children (users) - always shown */}
      {children}
    </div>
  )
}
