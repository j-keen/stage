'use client'

import { Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TeamTreeNode } from './team-tree-node'
import { UserTreeNode } from './user-tree-node'
import { useOrganizationStore, type OrganizationTreeNode, type UserWithDetails } from '@/stores/organization-store'
import type { Team } from '@/types/database'

export function OrganizationTree() {
  const {
    selectedNode,
    selectNode,
    buildTree,
    getUnassignedUsers,
    getTeamMembers,
  } = useOrganizationStore()

  const treeNodes = buildTree()
  const unassignedUsers = getUnassignedUsers()

  const renderNode = (node: OrganizationTreeNode, depth: number = 0): React.ReactNode => {
    if (node.type === 'team') {
      const teamId = node.id
      const members = getTeamMembers(teamId)
      const isSelected = selectedNode?.type === 'team' && selectedNode?.id === teamId

      return (
        <TeamTreeNode
          key={`team-${teamId}`}
          team={node.data as Team}
          memberCount={members.length}
          depth={depth}
          isSelected={isSelected}
          onClick={() => selectNode({ type: 'team', id: teamId })}
        >
          {node.children.map((child) => renderNode(child, depth + 1))}
        </TeamTreeNode>
      )
    }

    // User node
    const userId = node.id
    const isSelected = selectedNode?.type === 'user' && selectedNode?.id === userId

    return (
      <UserTreeNode
        key={`user-${userId}`}
        user={node.data as UserWithDetails}
        depth={depth}
        isSelected={isSelected}
        onClick={() => selectNode({ type: 'user', id: userId })}
      />
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-1">
        {/* Tree nodes */}
        {treeNodes.map((node) => renderNode(node))}

        {/* Unassigned users section */}
        {unassignedUsers.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 px-2 py-1.5 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">미배정</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                {unassignedUsers.length}
              </Badge>
            </div>
            <div className="mt-1 space-y-0.5">
              {unassignedUsers.map((user) => (
                <UserTreeNode
                  key={`unassigned-${user.id}`}
                  user={user}
                  depth={1}
                  isSelected={selectedNode?.type === 'user' && selectedNode?.id === user.id}
                  onClick={() => selectNode({ type: 'user', id: user.id })}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {treeNodes.length === 0 && unassignedUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">조직 데이터가 없습니다</p>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
