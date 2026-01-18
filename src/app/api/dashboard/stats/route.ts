import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')

  if (!dateFrom || !dateTo) {
    return NextResponse.json(
      { error: 'dateFrom and dateTo are required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('customers')
      .select(`
        id,
        status,
        created_at,
        assigned_to,
        users:assigned_to (id, name)
      `)
      .gte('created_at', dateFrom)
      .lte('created_at', dateTo)

    if (error) {
      console.error('Dashboard stats query error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ customers: data })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
