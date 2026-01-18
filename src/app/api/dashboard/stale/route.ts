import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { subDays } from 'date-fns'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '7')
  const status = searchParams.get('status') || 'in_progress'
  const limit = parseInt(searchParams.get('limit') || '20')
  const assignedTo = searchParams.get('assignedTo')

  // N일 전 날짜
  const staleDate = subDays(new Date(), days).toISOString()

  try {
    const supabase = createAdminClient()

    let query = supabase
      .from('customers')
      .select(`
        id,
        name,
        phone,
        status,
        updated_at,
        created_at,
        assigned_to,
        notes,
        users:assigned_to (id, name)
      `)
      .eq('status', status)
      .lte('updated_at', staleDate)
      .order('updated_at', { ascending: true })
      .limit(limit)

    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo)
    }

    const { data, error } = await query

    if (error) {
      console.error('Stale customers query error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 마지막 수정일로부터 경과일 계산
    const now = new Date()
    const staleCustomers = data?.map(c => {
      const user = c.users as unknown as { id: string; name: string } | null
      const updatedAt = new Date(c.updated_at)
      const daysSinceUpdate = Math.floor(
        (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)
      )
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        status: c.status,
        updatedAt: c.updated_at,
        createdAt: c.created_at,
        daysSinceUpdate,
        assignedTo: c.assigned_to,
        assigneeName: user?.name || null,
        notes: c.notes,
      }
    }) || []

    return NextResponse.json({
      staleCustomers,
      total: staleCustomers.length,
      threshold: days,
    })
  } catch (error) {
    console.error('Stale customers API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stale customers' },
      { status: 500 }
    )
  }
}
