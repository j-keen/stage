'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface DonutStatsWidgetProps {
  title: string
  enabledCount: number
  disabledCount: number
  totalLabel?: string
  totalValue?: number
  secondaryLabel?: string
  secondaryValue?: number
  isLoading?: boolean
  dimensions?: { width: number; height: number }
  gridSize?: { w: number; h: number }
}

export function DonutStatsWidget({
  title,
  enabledCount,
  disabledCount,
  totalLabel = 'Things total',
  totalValue,
  secondaryLabel = 'Rule Total',
  secondaryValue = 1,
  isLoading,
  gridSize,
}: DonutStatsWidgetProps) {
  const total = totalValue ?? (enabledCount + disabledCount)

  const data = [
    { name: 'Enabled', value: enabledCount, color: '#3B82F6' },
    { name: 'Not Enabled', value: disabledCount, color: '#EF4444' },
  ]

  const isCompact = gridSize && (gridSize.w <= 2 || gridSize.h <= 3)

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2 pt-3 px-3">
          <Skeleton className="h-4 w-16" />
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <Skeleton className="h-20 w-20 rounded-full mx-auto" />
          <Skeleton className="h-3 w-full mt-2" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full bg-white border-slate-200/60 shadow-sm flex flex-col">
      <CardHeader className="pb-1 pt-3 px-3 flex-shrink-0">
        <CardTitle className="text-sm font-medium text-slate-700">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 flex-1 flex flex-col min-h-0">
        {/* Donut Chart */}
        <div className="relative flex-1 min-h-0 flex items-center justify-center">
          <div className="w-full h-full max-h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={isCompact ? 25 : 35}
                  outerRadius={isCompact ? 40 : 50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className={`font-bold text-slate-900 ${isCompact ? 'text-xl' : 'text-2xl'}`}>
              {enabledCount}
            </span>
            <span className="text-xs text-slate-500">Enabled</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 mt-2 text-xs flex-shrink-0">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-slate-600">Enabled</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-slate-600">Not Enabled</span>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="flex justify-around mt-3 pt-2 border-t border-slate-100 flex-shrink-0">
          <div className="text-center">
            <div className="text-lg font-bold text-slate-900">{total}</div>
            <div className="text-xs text-slate-500">{totalLabel}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-slate-900">{secondaryValue}</div>
            <div className="text-xs text-slate-500">{secondaryLabel}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
