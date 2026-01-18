'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Plus, Pencil, Shield, UserCircle, Users, FolderTree } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { OrganizationTree } from '@/components/organization/tree/organization-tree'
import { DetailPanel } from '@/components/organization/panel/detail-panel'
import { CreateTeamModal } from '@/components/organization/modals/create-team-modal'
import { CreateUserModal } from '@/components/organization/modals/create-user-modal'
import { useOrganizationStore, type UserWithDetails } from '@/stores/organization-store'
import type { User, Role, Team, Permissions } from '@/types/database'

// Permission labels for roles
const PERMISSION_LABELS: Record<keyof Permissions, { label: string; actions: Record<string, string> }> = {
  customers: {
    label: '고객 관리',
    actions: { view: '조회', create: '생성', edit: '수정', assign: '배정' },
  },
  teams: {
    label: '조직 관리',
    actions: { view: '조회', create: '생성', edit: '수정', delete: '삭제' },
  },
  users: {
    label: '계정 관리',
    actions: { view: '조회', create: '생성', edit: '수정', delete: '삭제' },
  },
  settings: {
    label: '설정',
    actions: { view: '조회', edit: '수정' },
  },
  dashboard: {
    label: '대시보드',
    actions: { view: '조회', viewAll: '전체 통계' },
  },
  branches: {
    label: '접수처',
    actions: { view: '조회', create: '생성', edit: '수정', delete: '삭제' },
  },
}

const DEFAULT_PERMISSIONS: Permissions = {
  customers: { view: false, create: false, edit: false, delete: false, assign: false, export: false },
  teams: { view: false, create: false, edit: false, delete: false },
  users: { view: false, create: false, edit: false, delete: false },
  settings: { view: false, edit: false },
  dashboard: { view: false, viewAll: false },
  branches: { view: false, create: false, edit: false, delete: false },
}

export default function MembersSettingsPage() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'org'
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">인력 관리</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="org" className="gap-2">
            <FolderTree className="h-4 w-4" />
            조직도
          </TabsTrigger>
          <TabsTrigger value="accounts-roles" className="gap-2">
            <Users className="h-4 w-4" />
            계정 및 역할
          </TabsTrigger>
        </TabsList>

        <TabsContent value="org" className="mt-4">
          <OrganizationTab />
        </TabsContent>

        <TabsContent value="accounts-roles" className="mt-4">
          <AccountsAndRolesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ==================== ACCOUNTS TAB ====================
function AccountsTab() {
  const [users, setUsers] = useState<(User & { role: Role; team: Team | null })[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    roleId: '',
    teamId: '',
    isActive: true,
  })

  const fetchData = async () => {
    const supabase = createClient()
    const [usersRes, rolesRes, teamsRes] = await Promise.all([
      supabase.from('users').select('*, role:roles(*), team:teams(*)').order('created_at', { ascending: false }),
      supabase.from('roles').select('*'),
      supabase.from('teams').select('*'),
    ])
    if (usersRes.data) setUsers(usersRes.data as (User & { role: Role; team: Team | null })[])
    if (rolesRes.data) setRoles(rolesRes.data)
    if (teamsRes.data) setTeams(teamsRes.data)
    setIsLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        username: user.username,
        name: user.name,
        password: '',
        roleId: user.role_id,
        teamId: user.team_id || '',
        isActive: user.is_active,
      })
    } else {
      setEditingUser(null)
      setFormData({
        username: '',
        name: '',
        password: '',
        roleId: roles[0]?.id || '',
        teamId: '',
        isActive: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.username || !formData.name || !formData.roleId) {
      toast.error('필수 항목을 입력해주세요')
      return
    }
    if (!editingUser && !formData.password) {
      toast.error('비밀번호를 입력해주세요')
      return
    }

    try {
      const response = await fetch('/api/users', {
        method: editingUser ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingUser?.id, ...formData }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '저장 실패')
      }
      toast.success(editingUser ? '수정되었습니다' : '생성되었습니다')
      setIsDialogOpen(false)
      fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '저장 실패')
    }
  }

  const handleToggleActive = async (user: User) => {
    const supabase = createClient()
    const { error } = await supabase.from('users').update({ is_active: !user.is_active }).eq('id', user.id)
    if (error) {
      toast.error('상태 변경 실패')
    } else {
      toast.success('상태가 변경되었습니다')
      fetchData()
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          계정 추가
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>아이디</TableHead>
                <TableHead>이름</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>소속 팀</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="w-16">편집</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell><Badge variant="outline">{user.role?.description || user.role?.name}</Badge></TableCell>
                  <TableCell>{user.team?.name || '-'}</TableCell>
                  <TableCell><Switch checked={user.is_active} onCheckedChange={() => handleToggleActive(user)} /></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(user)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? '계정 수정' : '계정 추가'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>아이디 *</Label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="영문 아이디"
                  disabled={!!editingUser}
                />
              </div>
              <div className="space-y-2">
                <Label>이름 *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="사용자 이름"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{editingUser ? '새 비밀번호' : '비밀번호 *'}</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="숫자 4자리"
                  maxLength={4}
                />
              </div>
              <div className="space-y-2">
                <Label>역할 *</Label>
                <Select value={formData.roleId} onValueChange={(value) => setFormData({ ...formData, roleId: value })}>
                  <SelectTrigger><SelectValue placeholder="역할 선택" /></SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>{role.description || role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>소속 팀</Label>
              <Select value={formData.teamId || 'none'} onValueChange={(value) => setFormData({ ...formData, teamId: value === 'none' ? '' : value })}>
                <SelectTrigger><SelectValue placeholder="팀 선택" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">없음</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>취소</Button>
              <Button onClick={handleSubmit}>{editingUser ? '수정' : '생성'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ==================== ROLES TAB ====================
function RolesTab() {
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: DEFAULT_PERMISSIONS,
  })

  const fetchData = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('roles').select('*').order('created_at')
    if (data) setRoles(data)
    setIsLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleOpenDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role)
      setFormData({
        name: role.name,
        description: role.description || '',
        permissions: role.permissions as unknown as Permissions,
      })
    } else {
      setEditingRole(null)
      setFormData({ name: '', description: '', permissions: DEFAULT_PERMISSIONS })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('역할 이름을 입력해주세요')
      return
    }
    const supabase = createClient()
    const data = { name: formData.name, description: formData.description || null, permissions: formData.permissions }
    const { error } = editingRole
      ? await supabase.from('roles').update(data).eq('id', editingRole.id)
      : await supabase.from('roles').insert(data)

    if (error) {
      toast.error('저장 실패')
    } else {
      toast.success(editingRole ? '수정되었습니다' : '생성되었습니다')
      setIsDialogOpen(false)
      fetchData()
    }
  }

  const togglePermission = (resource: keyof Permissions, action: string) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [resource]: {
          ...formData.permissions[resource],
          [action]: !(formData.permissions[resource] as Record<string, boolean>)[action],
        },
      },
    })
  }

  const isDefaultRole = (name: string) => ['super_admin', 'manager', 'consultant', 'agent'].includes(name)

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          역할 추가
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => {
          const permissions = role.permissions as unknown as Permissions
          const enabledResources = Object.keys(PERMISSION_LABELS).filter((resource) => {
            const perms = permissions[resource as keyof Permissions]
            return Object.values(perms).some(Boolean)
          })

          return (
            <Card key={role.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm">{role.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    {isDefaultRole(role.name) && <Badge variant="outline" className="text-[10px]">기본</Badge>}
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleOpenDialog(role)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {role.description && <CardDescription className="text-xs">{role.description}</CardDescription>}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs text-muted-foreground">{enabledResources.length}개 권한 영역</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRole ? '역할 수정' : '역할 추가'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>역할 이름 *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="영문 이름"
                  disabled={!!(editingRole && isDefaultRole(editingRole.name))}
                />
              </div>
              <div className="space-y-2">
                <Label>설명</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="역할 설명"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>권한 설정</Label>
              <Accordion type="multiple" className="w-full">
                {(Object.keys(PERMISSION_LABELS) as Array<keyof Permissions>).map((resource) => (
                  <AccordionItem key={resource} value={resource}>
                    <AccordionTrigger className="text-sm">{PERMISSION_LABELS[resource].label}</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-3 py-2">
                        {Object.entries(PERMISSION_LABELS[resource].actions).map(([action, label]) => (
                          <div key={action} className="flex items-center justify-between">
                            <span className="text-sm">{label}</span>
                            <Switch
                              checked={(formData.permissions[resource] as Record<string, boolean>)[action] || false}
                              onCheckedChange={() => togglePermission(resource, action)}
                            />
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>취소</Button>
              <Button onClick={handleSubmit}>{editingRole ? '수정' : '생성'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ==================== ACCOUNTS AND ROLES TAB (통합) ====================
function AccountsAndRolesTab() {
  // Accounts state
  const [users, setUsers] = useState<(User & { role: Role; team: Team | null })[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [accountFormData, setAccountFormData] = useState({
    username: '',
    name: '',
    password: '',
    roleId: '',
    teamId: '',
    isActive: true,
  })

  // Roles state
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: '',
    permissions: DEFAULT_PERMISSIONS,
  })

  const fetchData = async () => {
    const supabase = createClient()
    const [usersRes, rolesRes, teamsRes] = await Promise.all([
      supabase.from('users').select('*, role:roles(*), team:teams(*)').order('created_at', { ascending: false }),
      supabase.from('roles').select('*').order('created_at'),
      supabase.from('teams').select('*'),
    ])
    if (usersRes.data) setUsers(usersRes.data as (User & { role: Role; team: Team | null })[])
    if (rolesRes.data) setRoles(rolesRes.data)
    if (teamsRes.data) setTeams(teamsRes.data)
    setIsLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  // Account handlers
  const handleOpenAccountDialog = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setAccountFormData({
        username: user.username,
        name: user.name,
        password: '',
        roleId: user.role_id,
        teamId: user.team_id || '',
        isActive: user.is_active,
      })
    } else {
      setEditingUser(null)
      setAccountFormData({
        username: '',
        name: '',
        password: '',
        roleId: roles[0]?.id || '',
        teamId: '',
        isActive: true,
      })
    }
    setIsAccountDialogOpen(true)
  }

  const handleAccountSubmit = async () => {
    if (!accountFormData.username || !accountFormData.name || !accountFormData.roleId) {
      toast.error('필수 항목을 입력해주세요')
      return
    }
    if (!editingUser && !accountFormData.password) {
      toast.error('비밀번호를 입력해주세요')
      return
    }

    try {
      const response = await fetch('/api/users', {
        method: editingUser ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingUser?.id, ...accountFormData }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '저장 실패')
      }
      toast.success(editingUser ? '수정되었습니다' : '생성되었습니다')
      setIsAccountDialogOpen(false)
      fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '저장 실패')
    }
  }

  const handleToggleActive = async (user: User) => {
    const supabase = createClient()
    const { error } = await supabase.from('users').update({ is_active: !user.is_active }).eq('id', user.id)
    if (error) {
      toast.error('상태 변경 실패')
    } else {
      toast.success('상태가 변경되었습니다')
      fetchData()
    }
  }

  // Role handlers
  const handleOpenRoleDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role)
      setRoleFormData({
        name: role.name,
        description: role.description || '',
        permissions: role.permissions as unknown as Permissions,
      })
    } else {
      setEditingRole(null)
      setRoleFormData({ name: '', description: '', permissions: DEFAULT_PERMISSIONS })
    }
    setIsRoleDialogOpen(true)
  }

  const handleRoleSubmit = async () => {
    if (!roleFormData.name) {
      toast.error('역할 이름을 입력해주세요')
      return
    }
    const supabase = createClient()
    const data = { name: roleFormData.name, description: roleFormData.description || null, permissions: roleFormData.permissions }
    const { error } = editingRole
      ? await supabase.from('roles').update(data).eq('id', editingRole.id)
      : await supabase.from('roles').insert(data)

    if (error) {
      toast.error('저장 실패')
    } else {
      toast.success(editingRole ? '수정되었습니다' : '생성되었습니다')
      setIsRoleDialogOpen(false)
      fetchData()
    }
  }

  const togglePermission = (resource: keyof Permissions, action: string) => {
    setRoleFormData({
      ...roleFormData,
      permissions: {
        ...roleFormData.permissions,
        [resource]: {
          ...roleFormData.permissions[resource],
          [action]: !(roleFormData.permissions[resource] as Record<string, boolean>)[action],
        },
      },
    })
  }

  const isDefaultRole = (name: string) => ['super_admin', 'manager', 'consultant', 'agent'].includes(name)

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Accounts Section */}
      <Card className="flex flex-col">
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              계정 목록
            </CardTitle>
            <Button size="sm" onClick={() => handleOpenAccountDialog()}>
              <Plus className="h-4 w-4 mr-1" />
              추가
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 flex-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-8 py-1">아이디</TableHead>
                <TableHead className="h-8 py-1">이름</TableHead>
                <TableHead className="h-8 py-1">역할</TableHead>
                <TableHead className="h-8 py-1">상태</TableHead>
                <TableHead className="h-8 py-1 w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="py-1.5 font-medium">{user.username}</TableCell>
                  <TableCell className="py-1.5">{user.name}</TableCell>
                  <TableCell className="py-1.5"><Badge variant="outline">{user.role?.description || user.role?.name}</Badge></TableCell>
                  <TableCell className="py-1.5"><Switch checked={user.is_active} onCheckedChange={() => handleToggleActive(user)} /></TableCell>
                  <TableCell className="py-1.5">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenAccountDialog(user)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Roles Section */}
      <Card className="flex flex-col">
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              역할 관리
            </CardTitle>
            <Button size="sm" onClick={() => handleOpenRoleDialog()}>
              <Plus className="h-4 w-4 mr-1" />
              추가
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex-1">
          <div className="grid grid-cols-1 gap-3">
            {roles.map((role) => {
              const permissions = role.permissions as unknown as Permissions
              const enabledResources = Object.keys(PERMISSION_LABELS).filter((resource) => {
                const perms = permissions[resource as keyof Permissions]
                return Object.values(perms).some(Boolean)
              })

              return (
                <Card key={role.id} className="bg-muted/20">
                  <CardHeader className="py-2 px-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm">{role.name}</CardTitle>
                        {isDefaultRole(role.name) && <Badge variant="outline" className="text-[10px]">기본</Badge>}
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleOpenRoleDialog(role)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>
                    {role.description && <CardDescription className="text-xs mt-1">{role.description}</CardDescription>}
                  </CardHeader>
                  <CardContent className="py-2 px-3 pt-0">
                    <div className="text-xs text-muted-foreground">{enabledResources.length}개 권한 영역</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Account Dialog */}
      <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? '계정 수정' : '계정 추가'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>아이디 *</Label>
                <Input
                  value={accountFormData.username}
                  onChange={(e) => setAccountFormData({ ...accountFormData, username: e.target.value })}
                  placeholder="영문 아이디"
                  disabled={!!editingUser}
                />
              </div>
              <div className="space-y-2">
                <Label>이름 *</Label>
                <Input
                  value={accountFormData.name}
                  onChange={(e) => setAccountFormData({ ...accountFormData, name: e.target.value })}
                  placeholder="사용자 이름"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{editingUser ? '새 비밀번호' : '비밀번호 *'}</Label>
                <Input
                  type="password"
                  value={accountFormData.password}
                  onChange={(e) => setAccountFormData({ ...accountFormData, password: e.target.value })}
                  placeholder="숫자 4자리"
                  maxLength={4}
                />
              </div>
              <div className="space-y-2">
                <Label>역할 *</Label>
                <Select value={accountFormData.roleId} onValueChange={(value) => setAccountFormData({ ...accountFormData, roleId: value })}>
                  <SelectTrigger><SelectValue placeholder="역할 선택" /></SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>{role.description || role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>소속 팀</Label>
              <Select value={accountFormData.teamId || 'none'} onValueChange={(value) => setAccountFormData({ ...accountFormData, teamId: value === 'none' ? '' : value })}>
                <SelectTrigger><SelectValue placeholder="팀 선택" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">없음</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAccountDialogOpen(false)}>취소</Button>
              <Button onClick={handleAccountSubmit}>{editingUser ? '수정' : '생성'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRole ? '역할 수정' : '역할 추가'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>역할 이름 *</Label>
                <Input
                  value={roleFormData.name}
                  onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                  placeholder="영문 이름"
                  disabled={!!(editingRole && isDefaultRole(editingRole.name))}
                />
              </div>
              <div className="space-y-2">
                <Label>설명</Label>
                <Input
                  value={roleFormData.description}
                  onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                  placeholder="역할 설명"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>권한 설정</Label>
              <Accordion type="multiple" className="w-full">
                {(Object.keys(PERMISSION_LABELS) as Array<keyof Permissions>).map((resource) => (
                  <AccordionItem key={resource} value={resource}>
                    <AccordionTrigger className="text-sm">{PERMISSION_LABELS[resource].label}</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-3 py-2">
                        {Object.entries(PERMISSION_LABELS[resource].actions).map(([action, label]) => (
                          <div key={action} className="flex items-center justify-between">
                            <span className="text-sm">{label}</span>
                            <Switch
                              checked={(roleFormData.permissions[resource] as Record<string, boolean>)[action] || false}
                              onCheckedChange={() => togglePermission(resource, action)}
                            />
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>취소</Button>
              <Button onClick={handleRoleSubmit}>{editingRole ? '수정' : '생성'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ==================== ORGANIZATION TAB ====================
function OrganizationTab() {
  const { setTeams, setUsers, setRoles, setIsLoading, isLoading } = useOrganizationStore()
  const [createTeamOpen, setCreateTeamOpen] = useState(false)
  const [createUserOpen, setCreateUserOpen] = useState(false)
  const [activeUser, setActiveUser] = useState<UserWithDetails | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/organization')
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '데이터 조회 실패')
      setTeams(data.teams || [])
      setUsers(
        (data.users || []).map((u: Record<string, unknown>) => ({
          ...u,
          permissions: u.permissions as Permissions | null,
          permission_mode: (u.permission_mode as 'role_only' | 'custom_only') || 'role_only',
        }))
      )
      setRoles(data.roles || [])
    } catch (error) {
      toast.error('데이터를 불러오는데 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }, [setTeams, setUsers, setRoles, setIsLoading])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current
    if (data?.type === 'user') setActiveUser(data.user as UserWithDetails)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveUser(null)
    if (!over) return

    const activeData = active.data.current
    const overData = over.data.current
    if (activeData?.type !== 'user' || overData?.type !== 'team') return

    const userId = (active.id as string).replace('user-', '')
    const teamId = (over.id as string).replace('team-', '')

    const supabase = createClient()
    const { error } = await supabase.from('users').update({ team_id: teamId }).eq('id', userId)

    if (error) {
      toast.error('이동 실패')
      return
    }
    toast.success('팀원이 이동되었습니다')
    fetchData()
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <DndContext collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex border rounded-lg overflow-hidden bg-card" style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }}>
        <div className="w-72 border-r flex-shrink-0">
          <div className="h-10 border-b px-3 flex items-center justify-between bg-muted/30">
            <span className="text-sm font-medium">조직 구조</span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setCreateTeamOpen(true)}>+팀</Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setCreateUserOpen(true)}>+인원</Button>
            </div>
          </div>
          <div className="h-[calc(100%-40px)]">
            <OrganizationTree />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <DetailPanel onUpdate={fetchData} />
        </div>
      </div>

      <DragOverlay>
        {activeUser && (
          <div className="bg-card border rounded-lg px-3 py-2 shadow-lg flex items-center gap-2">
            <UserCircle className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">{activeUser.name}</span>
            {activeUser.role && <Badge variant="outline" className="text-[10px]">{activeUser.role.name}</Badge>}
          </div>
        )}
      </DragOverlay>

      <CreateTeamModal open={createTeamOpen} onClose={() => setCreateTeamOpen(false)} onSuccess={fetchData} />
      <CreateUserModal open={createUserOpen} onClose={() => setCreateUserOpen(false)} onSuccess={fetchData} />
    </DndContext>
  )
}
