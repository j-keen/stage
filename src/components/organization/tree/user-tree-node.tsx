'use client'

import { useDraggable } from '@dnd-kit/core'
import { UserCircle, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { UserWithDetails } from '@/stores/organization-store'

interface UserTreeNodeProps {
  user: UserWithDetails
  depth: number
  isSelected: boolean
  onClick: () => void
}

export function UserTreeNode({
  user,
  depth,
  isSelected,
  onClick,
}: UserTreeNodeProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `user-${user.id}`,
    data: { type: 'user', user },
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer select-none',
        'hover:bg-accent/50 transition-colors',
        isSelected && 'bg-accent',
        isDragging && 'opacity-50 z-50',
        !user.is_active && 'opacity-50'
      )}
      onClick={onClick}
    >
      {/* Indent based on depth */}
      <div style={{ width: `${depth * 16}px` }} />

      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </div>

      {/* User icon */}
      <UserCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />

      {/* User name */}
      <span className="text-sm truncate flex-1">{user.name}</span>

      {/* Role badge */}
      {user.role && (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
          {user.role.name}
        </Badge>
      )}

      {/* Custom permission indicator */}
      {user.permission_mode === 'custom_only' && (
        <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
          커스텀
        </Badge>
      )}
    </div>
  )
}
