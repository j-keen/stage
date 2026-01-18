import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')
  const groupBy = searchParams.get('groupBy') || 'assignee' // 'assignee' | 'team'

  if (!dateFrom || !dateTo) {
    return NextResponse.json(
      { error: 'dateFrom and dateTo are required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createAdminClient()

    // 고객 데이터 조회
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select(`
        id,
        status,
        assigned_to,
        created_at,
        users:assigned_to (id, name, team_id)
      `)
      .gte('created_at', dateFrom)
      .lte('created_at', dateTo)

    if (customersError) {
      console.error('Performance customers query error:', customersError)
      return NextResponse.json({ error: customersError.message }, { status: 500 })
    }

    // 팀 데이터 조회 (groupBy가 team인 경우)
    let teams: Record<string, string> = {}
    if (groupBy === 'team') {
      const { data: teamsData } = await supabase
        .from('teams')
        .select('id, name')

      if (teamsData) {
        teams = teamsData.reduce((acc, t) => {
          acc[t.id] = t.name
          return acc
        }, {} as Record<string, string>)
      }
    }

    // 담당자별 또는 팀별 집계
    const performanceMap = new Map<string, {
      id: string
      name: string
      teamId?: string
      teamName?: string
      totalCount: number
      completedCount: number
      inProgressCount: number
      prospectCount: number
      callbackCount: number
      absentCount: number
      cancelledCount: number
    }>()

    customers?.forEach(c => {
      const user = c.users as unknown as { id: string; name: string; team_id?: string | null } | null

      let key: string
      let name: string
      let teamId: string | undefined
      let teamName: string | undefined

      if (groupBy === 'team') {
        teamId = user?.team_id || 'unassigned'
        key = teamId
        name = teams[teamId] || '미배정 팀'
      } else {
        key = c.assigned_to || 'unassigned'
        name = user?.name || '미배정'
        teamId = user?.team_id || undefined
        teamName = teamId ? teams[teamId] : undefined
      }

      if (!performanceMap.has(key)) {
        performanceMap.set(key, {
          id: key,
          name,
          teamId,
          teamName,
          totalCount: 0,
          completedCount: 0,
          inProgressCount: 0,
          prospectCount: 0,
          callbackCount: 0,
          absentCount: 0,
          cancelledCount: 0,
        })
      }

      const perf = performanceMap.get(key)!
      perf.totalCount++

      switch (c.status) {
        case 'completed':
          perf.completedCount++
          break
        case 'in_progress':
          perf.inProgressCount++
          break
        case 'prospect':
          perf.prospectCount++
          break
        case 'callback':
          perf.callbackCount++
          break
        case 'absent':
          perf.absentCount++
          break
        case 'cancelled':
          perf.cancelledCount++
          break
      }
    })

    // 성공률 계산 및 정렬
    const performance = Array.from(performanceMap.values())
      .map(p => ({
        ...p,
        successRate: p.totalCount > 0
          ? Math.round((p.completedCount / p.totalCount) * 100 * 10) / 10
          : 0,
      }))
      .sort((a, b) => b.completedCount - a.completedCount)

    // 순위 추가
    const rankedPerformance = performance.map((p, index) => ({
      ...p,
      rank: index + 1,
    }))

    return NextResponse.json({
      performance: rankedPerformance,
      groupBy,
      dateRange: { from: dateFrom, to: dateTo },
    })
  } catch (error) {
    console.error('Performance API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    )
  }
}
