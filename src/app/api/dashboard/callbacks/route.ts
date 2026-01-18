import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { startOfDay, endOfDay } from 'date-fns'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const dateParam = searchParams.get('date')
  const limit = parseInt(searchParams.get('limit') || '20')
  const assignedTo = searchParams.get('assignedTo')

  // 기본값: 오늘
  const targetDate = dateParam ? new Date(dateParam) : new Date()
  const dayStart = startOfDay(targetDate).toISOString()
  const dayEnd = endOfDay(targetDate).toISOString()

  try {
    const supabase = createAdminClient()

    let query = supabase
      .from('customers')
      .select(`
        id,
        name,
        phone,
        status,
        callback_date,
        assigned_to,
        notes,
        users:assigned_to (id, name)
      `)
      .gte('callback_date', dayStart)
      .lte('callback_date', dayEnd)
      .order('callback_date', { ascending: true })
      .limit(limit)

    // 특정 담당자 필터링 (상담사 프리셋용)
    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo)
    }

    const { data, error } = await query

    if (error) {
      console.error('Callbacks query error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      callbacks: data?.map(c => {
        const user = c.users as unknown as { id: string; name: string } | null
        return {
          id: c.id,
          name: c.name,
          phone: c.phone,
          status: c.status,
          callbackDate: c.callback_date,
          assignedTo: c.assigned_to,
          assigneeName: user?.name || null,
          notes: c.notes,
        }
      }) || [],
      total: data?.length || 0,
      date: targetDate.toISOString(),
    })
  } catch (error) {
    console.error('Callbacks API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch callbacks' },
      { status: 500 }
    )
  }
}
