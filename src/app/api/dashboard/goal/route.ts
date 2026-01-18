import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  startOfMonth,
  endOfMonth,
  subMonths,
} from 'date-fns'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const metric = searchParams.get('metric') || 'completed' // 'completed' | 'total' | 'success_rate'
  const goalType = searchParams.get('goalType') || 'previous_month' // 'previous_month' | 'manual'
  const manualGoal = searchParams.get('manualGoal') // 수동 목표값
  const assignedTo = searchParams.get('assignedTo')

  const now = new Date()
  const currentMonthStart = startOfMonth(now).toISOString()
  const currentMonthEnd = endOfMonth(now).toISOString()
  const lastMonthStart = startOfMonth(subMonths(now, 1)).toISOString()
  const lastMonthEnd = endOfMonth(subMonths(now, 1)).toISOString()

  try {
    const supabase = createAdminClient()

    // 현재 월 데이터 조회
    let currentQuery = supabase
      .from('customers')
      .select('id, status')
      .gte('created_at', currentMonthStart)
      .lte('created_at', currentMonthEnd)

    if (assignedTo) {
      currentQuery = currentQuery.eq('assigned_to', assignedTo)
    }

    const { data: currentData, error: currentError } = await currentQuery

    if (currentError) {
      console.error('Goal current month query error:', currentError)
      return NextResponse.json({ error: currentError.message }, { status: 500 })
    }

    // 전월 데이터 조회 (goalType이 previous_month인 경우)
    let previousData: { id: string; status: string }[] = []
    if (goalType === 'previous_month') {
      let prevQuery = supabase
        .from('customers')
        .select('id, status')
        .gte('created_at', lastMonthStart)
        .lte('created_at', lastMonthEnd)

      if (assignedTo) {
        prevQuery = prevQuery.eq('assigned_to', assignedTo)
      }

      const { data, error } = await prevQuery
      if (error) {
        console.error('Goal previous month query error:', error)
      } else {
        previousData = data || []
      }
    }

    // 메트릭 계산
    const calculateMetric = (
      data: { id: string; status: string }[],
      metricType: string
    ): number => {
      const total = data.length
      const completed = data.filter(c => c.status === 'completed').length

      switch (metricType) {
        case 'completed':
          return completed
        case 'total':
          return total
        case 'success_rate':
          return total > 0 ? Math.round((completed / total) * 100 * 10) / 10 : 0
        default:
          return completed
      }
    }

    const currentValue = calculateMetric(currentData || [], metric)

    // 목표값 결정
    let goalValue: number
    if (goalType === 'manual' && manualGoal) {
      goalValue = parseFloat(manualGoal)
    } else {
      goalValue = calculateMetric(previousData, metric)
    }

    // 달성률 계산
    const percentage = goalValue > 0
      ? Math.round((currentValue / goalValue) * 100 * 10) / 10
      : currentValue > 0 ? 100 : 0

    // 추세 결정
    let trend: 'up' | 'down' | 'same'
    if (percentage > 100) {
      trend = 'up'
    } else if (percentage < 80) {
      trend = 'down'
    } else {
      trend = 'same'
    }

    return NextResponse.json({
      current: currentValue,
      goal: goalValue,
      percentage,
      trend,
      metric,
      goalType,
      period: {
        current: { start: currentMonthStart, end: currentMonthEnd },
        previous: goalType === 'previous_month'
          ? { start: lastMonthStart, end: lastMonthEnd }
          : null,
      },
    })
  } catch (error) {
    console.error('Goal API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goal data' },
      { status: 500 }
    )
  }
}
