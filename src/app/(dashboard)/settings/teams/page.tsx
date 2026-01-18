'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Plus, FolderTree, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Team } from '@/types/database'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TeamDropZone, type TeamData } from '@/components/teams/team-drop-zone'
import { DraggablePersonCard, type PersonData } from '@/components/teams/draggable-person-card'
import { TeamDetailModal } from '@/components/teams/team-detail-modal'
import { PersonDetailModal } from '@/components/teams/person-detail-modal'

export default function TeamsSettingsPage() {
  const [teams, setTeams] = useState<TeamData[]>([])
  const [people, setPeople] = useState<PersonData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activePerson, setActivePerson] = useState<PersonData | null>(null)

  // Modal states
  const [teamModalOpen, setTeamModalOpen] = useState(false)
  const [personModalOpen, setPersonModalOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<PersonData | null>(null)

  const fetchData = useCallback(async () => {
    const supabase = createClient()

    const [teamsRes, usersRes] = await Promise.all([
      supabase.from('teams').select('id, name, description, parent_id').order('name'),
      supabase
        .from('users')
        .select('id, name, email, team_id, role:roles(name, description)')
        .eq('is_active', true)
        .order('name'),
    ])

    if (teamsRes.data) {
      setTeams(teamsRes.data)
    }
    if (usersRes.data) {
      setPeople(
        usersRes.data.map((u: { id: string; name: string; email: string | null; team_id: string | null; role: { name: string; description: string | null } | null }) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          team_id: u.team_id,
          role: u.role,
        }))
      )
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
    const person = people.find((p) => p.id === active.id)
    setActivePerson(person || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setActivePerson(null)

    if (!over) return

    const personId = active.id as string
    const targetTeamId = over.id as string

    // Find the person
    const person = people.find((p) => p.id === personId)
    if (!person) return

    // Check if dropping on a team
    const targetTeam = teams.find((t) => t.id === targetTeamId)
    if (!targetTeam && targetTeamId !== 'unassigned') return

    // Update the database
    const supabase = createClient()
    const newTeamId = targetTeamId === 'unassigned' ? null : targetTeamId

    const { error } = await supabase
      .from('users')
      .update({ team_id: newTeamId })
      .eq('id', personId)

    if (error) {
      toast.error('이동 실패')
      return
    }

    // Update local state
    setPeople(
      people.map((p) =>
        p.id === personId ? { ...p, team_id: newTeamId } : p
      )
    )

    toast.success(
      newTeamId
        ? `${person.name}님을 ${targetTeam?.name}팀으로 이동했습니다`
        : `${person.name}님을 미배정으로 이동했습니다`
    )
  }

  const handleTeamClick = (team: TeamData) => {
    setSelectedTeam(team)
    setTeamModalOpen(true)
  }

  const handlePersonClick = (person: PersonData) => {
    setSelectedPerson(person)
    setPersonModalOpen(true)
  }

  const handleAddTeam = () => {
    setSelectedTeam(null)
    setTeamModalOpen(true)
  }

  const handleModalSave = () => {
    setTeamModalOpen(false)
    setPersonModalOpen(false)
    fetchData()
  }

  // Group people by team
  const getMembersForTeam = (teamId: string) =>
    people.filter((p) => p.team_id === teamId)

  const unassignedPeople = people.filter((p) => !p.team_id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">조직 관리</h1>
          <Button onClick={handleAddTeam}>
            <Plus className="h-4 w-4 mr-2" />
            팀 추가
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          팀원을 드래그하여 다른 팀으로 이동할 수 있습니다. 팀이나 팀원을 클릭하면 상세 정보를 수정할 수 있습니다.
        </p>

        {teams.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FolderTree className="h-12 w-12 mb-4" />
              <p>등록된 팀이 없습니다</p>
              <Button variant="link" onClick={handleAddTeam} className="mt-2">
                첫 번째 팀 추가하기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <TeamDropZone
                key={team.id}
                team={team}
                members={getMembersForTeam(team.id)}
                onTeamClick={() => handleTeamClick(team)}
                onPersonClick={handlePersonClick}
              />
            ))}
          </div>
        )}

        {/* Unassigned Section */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                미배정 인원
              </span>
              <Badge variant="secondary">{unassignedPeople.length}명</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SortableContext
              items={unassignedPeople.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
              id="unassigned"
            >
              {unassignedPeople.length === 0 ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  미배정 인원이 없습니다
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {unassignedPeople.map((person) => (
                    <DraggablePersonCard
                      key={person.id}
                      person={person}
                      onClick={() => handlePersonClick(person)}
                    />
                  ))}
                </div>
              )}
            </SortableContext>
          </CardContent>
        </Card>
      </div>

      <DragOverlay>
        {activePerson && (
          <div className="bg-card border rounded-lg p-3 shadow-lg flex items-center gap-3">
            <span className="font-medium text-sm">{activePerson.name}</span>
            {activePerson.role && (
              <Badge variant="outline" className="text-[10px]">
                {activePerson.role.name}
              </Badge>
            )}
          </div>
        )}
      </DragOverlay>

      {/* Team Detail Modal */}
      <TeamDetailModal
        team={selectedTeam}
        teams={teams}
        open={teamModalOpen}
        onClose={() => setTeamModalOpen(false)}
        onSave={handleModalSave}
      />

      {/* Person Detail Modal */}
      <PersonDetailModal
        person={selectedPerson}
        teams={teams}
        open={personModalOpen}
        onClose={() => setPersonModalOpen(false)}
        onSave={handleModalSave}
      />
    </DndContext>
  )
}
