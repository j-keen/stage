import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAuthCredentials, validateUsername, validatePassword } from '@/lib/auth/transform'
import { z } from 'zod'

const createUserSchema = z.object({
  username: z.string().min(3).max(20),
  name: z.string().min(1),
  password: z.string().length(4).regex(/^\d{4}$/),
  roleId: z.string().uuid(),
  teamId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().optional().default(true),
})

const updateUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  password: z.string().length(4).regex(/^\d{4}$/).optional(),
  roleId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = createUserSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { username, name, password, roleId, teamId, isActive } = validation.data
    const supabase = createAdminClient()

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 사용 중인 아이디입니다' },
        { status: 400 }
      )
    }

    // Create auth user
    const credentials = getAuthCredentials(username, password)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: credentials.email,
      password: credentials.password,
      email_confirm: true,
    })

    if (authError) {
      console.error('Auth user creation error:', authError)
      return NextResponse.json(
        { error: '계정 생성 실패' },
        { status: 500 }
      )
    }

    // Create user record
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        auth_id: authData.user.id,
        username,
        name,
        email: credentials.email,
        role_id: roleId,
        team_id: teamId || null,
        is_active: isActive,
      })
      .select()
      .single()

    if (userError) {
      // Cleanup auth user if user record creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      console.error('User record creation error:', userError)
      return NextResponse.json(
        { error: '사용자 생성 실패' },
        { status: 500 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: '서버 오류' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = updateUserSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { id, name, password, roleId, teamId, isActive } = validation.data
    const supabase = createAdminClient()

    // Get existing user
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('auth_id, username')
      .eq('id', id)
      .single()

    if (fetchError || !existingUser) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // Update password if provided
    if (password) {
      const credentials = getAuthCredentials(existingUser.username, password)
      const { error: authError } = await supabase.auth.admin.updateUserById(
        existingUser.auth_id,
        { password: credentials.password }
      )

      if (authError) {
        console.error('Password update error:', authError)
        return NextResponse.json(
          { error: '비밀번호 변경 실패' },
          { status: 500 }
        )
      }
    }

    // Update user record
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (roleId !== undefined) updateData.role_id = roleId
    if (teamId !== undefined) updateData.team_id = teamId || null
    if (isActive !== undefined) updateData.is_active = isActive

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)

      if (updateError) {
        console.error('User update error:', updateError)
        return NextResponse.json(
          { error: '사용자 수정 실패' },
          { status: 500 }
        )
      }
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
