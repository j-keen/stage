import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20')
  const assignedTo = searchParams.get('assignedTo')

  try {
    const supabase = createAdminClient()

    // customer_histories 테이블에서 최근 활동 조회
    let query = supabase
      .from('customer_histories')
      .select(`
        id,
        customer_id,
        user_id,
        field_name,
        old_value,
        new_value,
        created_at,
        customers:customer_id (id, name, phone),
        users:user_id (id, name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    const { data, error } = await query

    if (error) {
      // 테이블이 없을 수 있으므로 빈 배열 반환
      if (error.code === '42P01') {
        return NextResponse.json({ activities: [], total: 0 })
      }
      console.error('Timeline query error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 활동 타입 결정
    const getActivityType = (fieldName: string): string => {
      switch (fieldName) {
        case 'status':
          return 'status_change'
        case 'assigned_to':
          return 'assignment'
        case 'notes':
          return 'note_update'
        case 'callback_date':
          return 'callback_set'
        default:
          return 'update'
      }
    }

    // 활동 설명 생성
    const getActivityDescription = (
      fieldName: string,
      oldValue: string | null,
      newValue: string | null,
      customerName: string | null
    ): string => {
      const name = customerName || '고객'
      switch (fieldName) {
        case 'status':
          return `${name}의 상태가 변경되었습니다`
        case 'assigned_to':
          return `${name}의 담당자가 변경되었습니다`
        case 'notes':
          return `${name}에게 메모가 추가되었습니다`
        case 'callback_date':
          return `${name}의 재통화 일정이 설정되었습니다`
        default:
          return `${name}의 정보가 업데이트되었습니다`
      }
    }

    const activities = data?.map(h => {
      const customer = h.customers as unknown as { id: string; name: string; phone: string } | null
      const user = h.users as unknown as { id: string; name: string } | null
      return {
        id: h.id,
        customerId: h.customer_id,
        customerName: customer?.name || null,
        customerPhone: customer?.phone || null,
        action: getActivityType(h.field_name),
        fieldName: h.field_name,
        oldValue: h.old_value,
        newValue: h.new_value,
        description: getActivityDescription(
          h.field_name,
          h.old_value,
          h.new_value,
          customer?.name || null
        ),
        userId: h.user_id,
        userName: user?.name || null,
        createdAt: h.created_at,
      }
    }) || []

    return NextResponse.json({
      activities,
      total: activities.length,
    })
  } catch (error) {
    console.error('Timeline API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch timeline' },
      { status: 500 }
    )
  }
}
