'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'

interface TrendStatWidgetProps {
  title: string
  value: number | string
  unit?: string
  trend?: number
  trendLabel?: string
  sparklineData?: { value: number }[]
  onViewChart?: () => void
  isLoading?: boolean
  dimensions?: { width: number; height: number }
  gridSize?: { w: number; h: number }
}

export function TrendStatWidget({
  title,
  value,
  unit = '%',
  trend,
  trendLabel = 'vs last month',
  sparklineData,
  onViewChart,
  isLoading,
  gridSize,
}: TrendStatWidgetProps) {
  const isCompact = gridSize && (gridSize.w <= 2 || gridSize.h <= 2)
  const isPositive = trend && trend > 0
  const isNegative = trend && trend < 0

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-1 pt-3 px-4">
          <Skeleton className="h-4 w-20" />
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-3 w-16 mt-2" />
            </div>
            <Skeleton className="h-16 w-24" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Generate sample sparkline data if not provided
  const chartData = sparklineData || [
    { value: 30 },
    { value: 45 },
    { value: 38 },
    { value: 52 },
    { value: 48 },
    { value: 60 },
    { value: 55 },
  ]

  return (
    <Card className="h-full bg-white border-slate-200/60 shadow-sm flex flex-col">
      <CardHeader className="pb-1 pt-3 px-4 flex-shrink-0">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3 flex-1 min-h-0 flex items-center">
        <div className="flex items-center justify-between w-full gap-4">
          {/* Value and Trend */}
          <div className="flex-shrink-0">
            <div className="flex items-baseline gap-1">
              <span className={`font-bold text-slate-900 ${isCompact ? 'text-2xl' : 'text-3xl'}`}>
                {value}
              </span>
              <span className="text-lg text-slate-400">{unit}</span>
            </div>

            {trend !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                <div
                  className={`flex items-center gap-0.5 text-sm font-medium ${
                    isPositive ? 'text-emerald-500' : isNegative ? 'text-rose-500' : 'text-slate-400'
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : isNegative ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : null}
                  <span>
                    {isPositive ? '+' : ''}{trend.toFixed(1)}%
                  </span>
                </div>
                <span className="text-xs text-slate-400">{trendLabel}</span>
              </div>
            )}

            {onViewChart && (
              <button
                onClick={onViewChart}
                className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 mt-2 group"
              >
                View chart
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}
          </div>

          {/* Sparkline */}
          {!isCompact && (
            <div className="flex-1 h-16 max-w-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isPositive ? '#10B981' : '#3B82F6'} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={isPositive ? '#10B981' : '#3B82F6'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={isPositive ? '#10B981' : '#3B82F6'}
                    strokeWidth={2}
                    fill="url(#sparklineGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
