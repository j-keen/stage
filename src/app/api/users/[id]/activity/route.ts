import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const supabase = createAdminClient()

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // Get activity logs with pagination
    const { data: logs, error: logsError, count } = await supabase
      .from('user_activity_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (logsError) {
      console.error('Activity logs fetch error:', logsError)
      return NextResponse.json(
        { error: '활동 로그 조회 실패' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      logs: logs || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: '서버 오류' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, resourceType, resourceId, details } = body

    if (!action) {
      return NextResponse.json(
        { error: 'action은 필수입니다' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Insert activity log
    const { data, error } = await supabase
      .from('user_activity_logs')
      .insert({
        user_id: id,
        action,
        resource_type: resourceType || null,
        resource_id: resourceId || null,
        details: details || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Activity log insert error:', error)
      return NextResponse.json(
        { error: '활동 로그 기록 실패' },
        { status: 500 }
      )
    }

    // Update last_activity_at on user
    await supabase
      .from('users')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', id)

    return NextResponse.json({ success: true, log: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: '서버 오류' },
      { status: 500 }
    )
  }
}
