'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DraggablePersonCard, type PersonData } from './draggable-person-card'
import { cn } from '@/lib/utils'
import { Building2, Users, Settings } from 'lucide-react'

export interface TeamData {
  id: string
  name: string
  description: string | null
  parent_id: string | null
}

interface TeamDropZoneProps {
  team: TeamData
  members: PersonData[]
  onTeamClick?: () => void
  onPersonClick?: (person: PersonData) => void
}

export function TeamDropZone({
  team,
  members,
  onTeamClick,
  onPersonClick,
}: TeamDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: team.id,
    data: {
      type: 'team',
      team,
    },
  })

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        'transition-all',
        isOver && 'ring-2 ring-primary bg-primary/5'
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            {team.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              {members.length}명
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation()
                onTeamClick?.()
              }}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {team.description && (
          <p className="text-xs text-muted-foreground">{team.description}</p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <SortableContext
          items={members.map(m => m.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 min-h-[60px]">
            {members.length === 0 ? (
              <div className="flex items-center justify-center h-[60px] border-2 border-dashed rounded-lg text-sm text-muted-foreground">
                팀원을 드래그하여 추가
              </div>
            ) : (
              members.map((person) => (
                <DraggablePersonCard
                  key={person.id}
                  person={person}
                  onClick={() => onPersonClick?.(person)}
                />
              ))
            )}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  )
}
