'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

interface SuccessRateWidgetProps {
  title?: string
  rate: number
  trendData?: Array<{ value: number }>
  isLoading?: boolean
  dimensions?: { width: number; height: number }
  gridSize?: { w: number; h: number }
}

type Period = 'year' | 'month' | 'week'

export function SuccessRateWidget({
  title = 'Success rate',
  rate,
  trendData = [],
  isLoading,
}: SuccessRateWidgetProps) {
  const [period, setPeriod] = useState<Period>('week')

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2 pt-3 px-4">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-8 w-full mt-2" />
        </CardContent>
      </Card>
    )
  }

  // Generate mock sparkline data if not provided
  const sparklineData = trendData.length > 0
    ? trendData
    : Array.from({ length: 7 }, (_, i) => ({
        value: rate - 5 + Math.random() * 10,
      }))

  return (
    <Card className="h-full bg-white border-slate-200/60 shadow-sm">
      <CardHeader className="pb-1 pt-3 px-4 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <div className="flex gap-1">
          {(['year', 'month', 'week'] as Period[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'h-6 px-2 text-xs',
                period === p
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:text-slate-900'
              )}
              onClick={() => setPeriod(p)}
            >
              {p === 'year' ? 'Year' : p === 'month' ? 'Month' : 'Week'}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <div className="flex items-end justify-between gap-4">
          {/* Rate Display */}
          <div>
            <span className="text-3xl font-bold text-slate-900">
              {rate.toFixed(1)}
            </span>
            <span className="text-xl font-bold text-slate-400">%</span>
          </div>

          {/* Sparkline */}
          <div className="flex-1 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
