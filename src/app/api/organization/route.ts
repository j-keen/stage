import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch all organization data in parallel
    const [teamsRes, usersRes, rolesRes] = await Promise.all([
      supabase
        .from('teams')
        .select('*')
        .order('name'),
      supabase
        .from('users')
        .select(`
          *,
          role:roles(*),
          team:teams(*)
        `)
        .order('name'),
      supabase
        .from('roles')
        .select('*')
        .order('name'),
    ])

    if (teamsRes.error) {
      console.error('Teams fetch error:', teamsRes.error)
      return NextResponse.json(
        { error: '팀 목록 조회 실패' },
        { status: 500 }
      )
    }

    if (usersRes.error) {
      console.error('Users fetch error:', usersRes.error)
      return NextResponse.json(
        { error: '사용자 목록 조회 실패' },
        { status: 500 }
      )
    }

    if (rolesRes.error) {
      console.error('Roles fetch error:', rolesRes.error)
      return NextResponse.json(
        { error: '역할 목록 조회 실패' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      teams: teamsRes.data || [],
      users: usersRes.data || [],
      roles: rolesRes.data || [],
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: '서버 오류' },
      { status: 500 }
    )
  }
}
