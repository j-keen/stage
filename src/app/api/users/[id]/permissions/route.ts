import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const permissionsSchema = z.object({
  permissions: z.object({
    customers: z.object({
      view: z.boolean(),
      create: z.boolean(),
      edit: z.boolean(),
      delete: z.boolean(),
      assign: z.boolean(),
      export: z.boolean(),
    }),
    teams: z.object({
      view: z.boolean(),
      create: z.boolean(),
      edit: z.boolean(),
      delete: z.boolean(),
    }),
    users: z.object({
      view: z.boolean(),
      create: z.boolean(),
      edit: z.boolean(),
      delete: z.boolean(),
    }),
    settings: z.object({
      view: z.boolean(),
      edit: z.boolean(),
    }),
    dashboard: z.object({
      view: z.boolean(),
      viewAll: z.boolean(),
    }),
    branches: z.object({
      view: z.boolean(),
      create: z.boolean(),
      edit: z.boolean(),
      delete: z.boolean(),
    }),
  }).nullable(),
  permissionMode: z.enum(['role_only', 'custom_only']),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validation = permissionsSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { permissions, permissionMode } = validation.data
    const supabase = createAdminClient()

    // Verify user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !existingUser) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // Update user permissions
    const { error: updateError } = await supabase
      .from('users')
      .update({
        permissions,
        permission_mode: permissionMode,
      })
      .eq('id', id)

    if (updateError) {
      console.error('Permissions update error:', updateError)
      return NextResponse.json(
        { error: '권한 업데이트 실패' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: '서버 오류' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { data: user, error } = await supabase
      .from('users')
      .select('permissions, permission_mode, role_id, roles!users_role_id_fkey(permissions)')
      .eq('id', id)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // Access the joined role data (Supabase may return it as an array)
    const rolesData = user.roles as unknown as { permissions: unknown } | { permissions: unknown }[] | null
    const rolePermissions = Array.isArray(rolesData) ? rolesData[0]?.permissions : rolesData?.permissions

    return NextResponse.json({
      permissions: user.permissions,
      permissionMode: user.permission_mode,
      rolePermissions: rolePermissions || null,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: '서버 오류' },
      { status: 500 }
    )
  }
}
