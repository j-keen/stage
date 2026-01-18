import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { subDays } from 'date-fns'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20')
  const daysBack = parseInt(searchParams.get('daysBack') || '7')
  const assignedTo = searchParams.get('assignedTo')

  // 최근 N일 내 생성된 건만 조회
  const minDate = subDays(new Date(), daysBack).toISOString()

  try {
    const supabase = createAdminClient()

    // 이름 또는 메모가 비어있는 신규/가망 고객
    let query = supabase
      .from('customers')
      .select(`
        id,
        name,
        phone,
        status,
        notes,
        created_at,
        assigned_to,
        users:assigned_to (id, name)
      `)
      .in('status', ['prospect', 'in_progress'])
      .gte('created_at', minDate)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo)
    }

    const { data, error } = await query

    if (error) {
      console.error('Incomplete customers query error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 미입력 필드 확인
    const incompleteCustomers = data?.filter(c => {
      const missingFields: string[] = []
      if (!c.name || c.name.trim() === '') missingFields.push('name')
      if (!c.notes || c.notes.trim() === '') missingFields.push('notes')
      return missingFields.length > 0
    }).map(c => {
      const user = c.users as unknown as { id: string; name: string } | null
      const missingFields: string[] = []
      if (!c.name || c.name.trim() === '') missingFields.push('name')
      if (!c.notes || c.notes.trim() === '') missingFields.push('notes')
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        status: c.status,
        createdAt: c.created_at,
        missingFields,
        assignedTo: c.assigned_to,
        assigneeName: user?.name || null,
      }
    }) || []

    return NextResponse.json({
      incompleteCustomers,
      total: incompleteCustomers.length,
    })
  } catch (error) {
    console.error('Incomplete customers API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch incomplete customers' },
      { status: 500 }
    )
  }
}
