'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { GripVertical } from 'lucide-react'

export interface PersonData {
  id: string
  name: string
  email?: string | null
  team_id: string | null
  role?: {
    name: string
    description: string | null
  } | null
}

interface DraggablePersonCardProps {
  person: PersonData
  onClick?: () => void
}

export function DraggablePersonCard({ person, onClick }: DraggablePersonCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: person.id,
    data: {
      type: 'person',
      person,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'p-3 cursor-pointer hover:shadow-md transition-all flex items-center gap-3',
        isDragging && 'opacity-50 shadow-lg ring-2 ring-primary'
      )}
      onClick={onClick}
      {...attributes}
    >
      <div {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs bg-primary/10 text-primary">
          {person.name.slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{person.name}</p>
        {person.role && (
          <p className="text-xs text-muted-foreground truncate">{person.role.name}</p>
        )}
      </div>
      {person.role && (
        <Badge variant="outline" className="text-[10px] shrink-0">
          {person.role.name}
        </Badge>
      )}
    </Card>
  )
}
