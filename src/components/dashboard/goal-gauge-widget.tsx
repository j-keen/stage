'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { getChartTokens } from '@/lib/widget-design-system'
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts'
import { Target, TrendingUp, TrendingDown } from 'lucide-react'

interface GoalGaugeWidgetProps {
  title: string
  currentValue: number
  goalValue: number
  goalType?: 'manual' | 'previous_month'
  unit?: string
  icon?: string
  isLoading?: boolean
  gridSize?: { w: number; h: number }
  dimensions?: { width: number; height: number }
}

export function GoalGaugeWidget({
  title,
  currentValue,
  goalValue,
  goalType = 'previous_month',
  unit = '건',
  icon,
  isLoading,
  gridSize,
  dimensions,
}: GoalGaugeWidgetProps) {
  // 토큰
  const tokens = gridSize
    ? getChartTokens(gridSize.w, gridSize.h)
    : { titleSize: 'text-sm', headerPadding: 'pb-0.5 pt-1 px-2', contentPadding: 'pb-2 px-2' }

  // 달성률 계산
  const percentage = goalValue > 0
    ? Math.round((currentValue / goalValue) * 100)
    : currentValue > 0 ? 100 : 0

  // 색상 결정
  const getColor = (percent: number) => {
    if (percent >= 100) return '#10B981' // green-500
    if (percent >= 70) return '#3B82F6'  // blue-500
    if (percent >= 50) return '#F59E0B'  // amber-500
    return '#EF4444'                      // red-500
  }

  const color = getColor(percentage)

  // 차트 데이터
  const data = [
    {
      name: 'progress',
      value: Math.min(percentage, 100),
      fill: color,
    },
  ]

  // 컴팩트 여부
  const isCompact = gridSize && (gridSize.w * gridSize.h <= 9)

  if (isLoading) {
    return (
      <Card className="h-full overflow-hidden">
        <CardHeader className={cn('flex flex-row items-center justify-between space-y-0', tokens.headerPadding)}>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent className={cn('flex items-center justify-center', tokens.contentPadding)}>
          <Skeleton className="h-24 w-24 rounded-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <CardHeader className={cn('flex flex-row items-center justify-between space-y-0 flex-shrink-0', tokens.headerPadding)}>
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <CardTitle className={cn(tokens.titleSize, 'font-medium')}>
            {title}
          </CardTitle>
        </div>
        {percentage >= 100 ? (
          <TrendingUp className="h-4 w-4" style={{ color }} />
        ) : percentage < 50 ? (
          <TrendingDown className="h-4 w-4" style={{ color }} />
        ) : null}
      </CardHeader>
      <CardContent className={cn('flex-1 flex flex-col items-center justify-center', tokens.contentPadding)}>
        <div className="relative w-full flex items-center justify-center" style={{ height: isCompact ? 80 : 120 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius={isCompact ? '60%' : '70%'}
              outerRadius={isCompact ? '90%' : '100%'}
              barSize={isCompact ? 8 : 12}
              data={data}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                background={{ fill: '#E5E7EB' }}
                dataKey="value"
                cornerRadius={10}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          {/* 중앙 텍스트 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={cn(
                'font-bold',
                isCompact ? 'text-2xl' : 'text-3xl'
              )}
              style={{ color }}
            >
              {percentage}%
            </span>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="text-center mt-1">
          <div className="text-sm">
            <span className="font-semibold" style={{ color }}>
              {currentValue.toLocaleString()}
            </span>
            <span className="text-muted-foreground">
              {' / '}
              {goalValue.toLocaleString()}
              {unit}
            </span>
          </div>
          {!isCompact && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {goalType === 'previous_month' ? '전월 대비' : '목표 대비'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
