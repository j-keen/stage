import { create } from 'zustand'
import type { Team, Role, Permissions } from '@/types/database'

// Extended user type with role and team info
export interface UserWithDetails {
  id: string
  auth_id: string
  username: string
  name: string
  email: string
  role_id: string
  team_id: string | null
  is_active: boolean
  permissions: Permissions | null
  permission_mode: 'role_only' | 'custom_only'
  memo: string | null
  last_activity_at: string | null
  created_at: string
  updated_at: string
  role: Role | null
  team: Team | null
}

// Tree node for organization hierarchy
export interface OrganizationTreeNode {
  id: string
  type: 'team' | 'user'
  name: string
  parentId: string | null
  children: OrganizationTreeNode[]
  data: Team | UserWithDetails
}

interface SelectedNode {
  type: 'team' | 'user'
  id: string
}

interface OrganizationState {
  // Data
  teams: Team[]
  users: UserWithDetails[]
  roles: Role[]

  // UI State
  selectedNode: SelectedNode | null
  expandedTeams: Set<string>
  isLoading: boolean

  // Actions
  setTeams: (teams: Team[]) => void
  setUsers: (users: UserWithDetails[]) => void
  setRoles: (roles: Role[]) => void
  setIsLoading: (isLoading: boolean) => void

  // Selection
  selectNode: (node: SelectedNode | null) => void
  getSelectedTeam: () => Team | null
  getSelectedUser: () => UserWithDetails | null

  // Tree expansion
  toggleTeamExpand: (teamId: string) => void
  expandAll: () => void
  collapseAll: () => void
  isTeamExpanded: (teamId: string) => boolean

  // Utilities
  getTeamMembers: (teamId: string) => UserWithDetails[]
  getUnassignedUsers: () => UserWithDetails[]
  getTeamById: (teamId: string) => Team | undefined
  getUserById: (userId: string) => UserWithDetails | undefined
  getRoleById: (roleId: string) => Role | undefined
  getChildTeams: (parentId: string | null) => Team[]

  // Build tree structure
  buildTree: () => OrganizationTreeNode[]
}

export const useOrganizationStore = create<OrganizationState>((set, get) => ({
  // Initial state
  teams: [],
  users: [],
  roles: [],
  selectedNode: null,
  expandedTeams: new Set<string>(),
  isLoading: true,

  // Setters
  setTeams: (teams) => set({ teams }),
  setUsers: (users) => set({ users }),
  setRoles: (roles) => set({ roles }),
  setIsLoading: (isLoading) => set({ isLoading }),

  // Selection
  selectNode: (node) => set({ selectedNode: node }),

  getSelectedTeam: () => {
    const { selectedNode, teams } = get()
    if (!selectedNode || selectedNode.type !== 'team') return null
    return teams.find((t) => t.id === selectedNode.id) || null
  },

  getSelectedUser: () => {
    const { selectedNode, users } = get()
    if (!selectedNode || selectedNode.type !== 'user') return null
    return users.find((u) => u.id === selectedNode.id) || null
  },

  // Tree expansion
  toggleTeamExpand: (teamId) =>
    set((state) => {
      const newExpanded = new Set(state.expandedTeams)
      if (newExpanded.has(teamId)) {
        newExpanded.delete(teamId)
      } else {
        newExpanded.add(teamId)
      }
      return { expandedTeams: newExpanded }
    }),

  expandAll: () =>
    set((state) => ({
      expandedTeams: new Set(state.teams.map((t) => t.id)),
    })),

  collapseAll: () => set({ expandedTeams: new Set() }),

  isTeamExpanded: (teamId) => get().expandedTeams.has(teamId),

  // Utilities
  getTeamMembers: (teamId) => get().users.filter((u) => u.team_id === teamId),

  getUnassignedUsers: () => get().users.filter((u) => !u.team_id),

  getTeamById: (teamId) => get().teams.find((t) => t.id === teamId),

  getUserById: (userId) => get().users.find((u) => u.id === userId),

  getRoleById: (roleId) => get().roles.find((r) => r.id === roleId),

  getChildTeams: (parentId) =>
    get().teams.filter((t) => t.parent_id === parentId),

  // Build tree structure
  buildTree: () => {
    const { teams, users, getChildTeams, getTeamMembers } = get()

    const buildTeamNode = (team: Team): OrganizationTreeNode => {
      const childTeams = getChildTeams(team.id)
      const members = getTeamMembers(team.id)

      const children: OrganizationTreeNode[] = [
        // Child teams first
        ...childTeams.map((childTeam) => buildTeamNode(childTeam)),
        // Then members
        ...members.map(
          (user): OrganizationTreeNode => ({
            id: user.id,
            type: 'user',
            name: user.name,
            parentId: team.id,
            children: [],
            data: user,
          })
        ),
      ]

      return {
        id: team.id,
        type: 'team',
        name: team.name,
        parentId: team.parent_id,
        children,
        data: team,
      }
    }

    // Get root teams (teams without parent)
    const rootTeams = teams.filter((t) => !t.parent_id)

    return rootTeams.map((team) => buildTeamNode(team))
  },
}))
