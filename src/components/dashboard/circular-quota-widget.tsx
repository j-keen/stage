'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface CircularQuotaWidgetProps {
  title: string
  quota: number
  used: number
  usedPercent?: number
  color?: string
  isLoading?: boolean
  dimensions?: { width: number; height: number }
  gridSize?: { w: number; h: number }
}

export function CircularQuotaWidget({
  title,
  quota,
  used,
  usedPercent,
  color,
  isLoading,
  gridSize,
}: CircularQuotaWidgetProps) {
  const percent = usedPercent ?? (quota > 0 ? (used / quota) * 100 : 0)
  const unused = quota - used
  const unusedPercent = 100 - percent

  // Determine color based on usage percentage
  const getColor = () => {
    if (color) return color
    if (percent >= 80) return '#EF4444' // red
    if (percent >= 60) return '#F59E0B' // amber
    if (percent >= 40) return '#3B82F6' // blue
    return '#10B981' // green
  }

  const strokeColor = getColor()
  const isCompact = gridSize && (gridSize.w <= 2 || gridSize.h <= 2)

  // Calculate stroke dash for the progress
  const circumference = 2 * Math.PI * 40
  const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-1 pt-3 px-3">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="px-3 pb-3 flex flex-col items-center">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-3 w-full mt-2" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full bg-white border-slate-200/60 shadow-sm flex flex-col">
      <CardHeader className="pb-1 pt-3 px-3 flex-shrink-0">
        <CardTitle className="text-xs font-medium text-slate-600 text-center">
          {title}
          <span className="text-slate-400 ml-1">(quota: {quota})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 flex-1 flex flex-col items-center justify-center min-h-0">
        {/* Circular Progress */}
        <div className="relative flex items-center justify-center">
          <svg
            className={isCompact ? 'w-16 h-16' : 'w-20 h-20'}
            viewBox="0 0 100 100"
          >
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="10"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={strokeColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              transform="rotate(-90 50 50)"
              className="transition-all duration-500"
            />
          </svg>
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`font-bold ${isCompact ? 'text-lg' : 'text-xl'}`}
              style={{ color: strokeColor }}
            >
              {percent.toFixed(percent < 10 ? 1 : 0)}%
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 mt-2 text-[10px] flex-shrink-0">
          <div className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: strokeColor }}
            />
            <span className="text-slate-600">
              Used: {used}({percent.toFixed(percent < 10 ? 1 : 0)}%)
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-slate-200" />
            <span className="text-slate-600">
              Unused: {unused}({unusedPercent.toFixed(unusedPercent < 10 ? 1 : 0)}%)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
