'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface GradientGaugeWidgetProps {
  title: string
  value: number
  maxValue?: number
  label?: string
  gradientFrom?: string
  gradientTo?: string
  isLoading?: boolean
  dimensions?: { width: number; height: number }
  gridSize?: { w: number; h: number }
}

export function GradientGaugeWidget({
  title,
  value,
  maxValue = 100,
  label,
  gradientFrom = '#3B82F6',
  gradientTo = '#8B5CF6',
  isLoading,
  gridSize,
}: GradientGaugeWidgetProps) {
  const percent = Math.min((value / maxValue) * 100, 100)
  const isCompact = gridSize && (gridSize.w <= 2 || gridSize.h <= 2)

  // Semi-circle arc calculation
  const radius = 45
  const circumference = Math.PI * radius // Half circle
  const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2 pt-3 px-4">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="px-4 pb-4 flex flex-col items-center">
          <Skeleton className="h-24 w-32 rounded-t-full" />
          <Skeleton className="h-3 w-20 mt-2" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full bg-white border-slate-200/60 shadow-sm flex flex-col">
      <CardHeader className="pb-1 pt-3 px-4 flex-shrink-0">
        <CardTitle className="text-sm font-medium text-slate-700 text-center">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 flex-1 flex flex-col items-center justify-center min-h-0">
        {/* Semi-circle Gauge */}
        <div className="relative flex items-end justify-center">
          <svg
            className={isCompact ? 'w-24 h-14' : 'w-32 h-18'}
            viewBox="0 0 100 55"
          >
            {/* Gradient Definition */}
            <defs>
              <linearGradient id={`gauge-gradient-${title.replace(/\s/g, '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={gradientFrom} />
                <stop offset="100%" stopColor={gradientTo} />
              </linearGradient>
            </defs>

            {/* Background Arc */}
            <path
              d="M 5 50 A 45 45 0 0 1 95 50"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="8"
              strokeLinecap="round"
            />

            {/* Progress Arc */}
            <path
              d="M 5 50 A 45 45 0 0 1 95 50"
              fill="none"
              stroke={`url(#gauge-gradient-${title.replace(/\s/g, '')})`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Center Value */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
            <span
              className={`font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent ${
                isCompact ? 'text-2xl' : 'text-3xl'
              }`}
            >
              {percent.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Label */}
        {label && (
          <p className="text-xs text-slate-500 mt-2 text-center">{label}</p>
        )}

        {/* Value Info */}
        <div className="flex items-center gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})` }}
            />
            <span className="text-slate-600">Current: {value}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-slate-200" />
            <span className="text-slate-600">Target: {maxValue}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
