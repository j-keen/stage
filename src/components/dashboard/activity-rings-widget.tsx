'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface RingData {
  label: string
  value: number
  maxValue: number
  color: string
}

interface ActivityRingsWidgetProps {
  title: string
  rings: RingData[]
  isLoading?: boolean
  dimensions?: { width: number; height: number }
  gridSize?: { w: number; h: number }
}

export function ActivityRingsWidget({
  title,
  rings,
  isLoading,
  gridSize,
}: ActivityRingsWidgetProps) {
  const isCompact = gridSize && (gridSize.w <= 2 || gridSize.h <= 3)

  // Ring sizes (outer to inner)
  const ringSizes = [42, 32, 22]
  const strokeWidth = 8

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2 pt-3 px-4">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="px-4 pb-4 flex flex-col items-center">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex gap-4 mt-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full bg-white border-slate-200/60 shadow-sm flex flex-col">
      <CardHeader className="pb-2 pt-3 px-4 flex-shrink-0">
        <CardTitle className="text-sm font-medium text-slate-700">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 flex-1 flex flex-col items-center justify-center min-h-0">
        {/* Concentric Rings */}
        <div className="relative flex items-center justify-center">
          <svg
            className={isCompact ? 'w-24 h-24' : 'w-32 h-32'}
            viewBox="0 0 100 100"
          >
            {rings.slice(0, 3).map((ring, index) => {
              const radius = ringSizes[index] || 22
              const circumference = 2 * Math.PI * radius
              const percent = Math.min((ring.value / ring.maxValue) * 100, 100)
              const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`

              return (
                <g key={index}>
                  {/* Background Ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={`${ring.color}20`}
                    strokeWidth={strokeWidth}
                  />
                  {/* Progress Ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={ring.color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={strokeDasharray}
                    transform="rotate(-90 50 50)"
                    className="transition-all duration-700 ease-out"
                  />
                </g>
              )
            })}
          </svg>

          {/* Center Total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-bold text-slate-700 ${isCompact ? 'text-lg' : 'text-xl'}`}>
              {rings.reduce((sum, r) => sum + Math.round((r.value / r.maxValue) * 100), 0) / rings.length}%
            </span>
            <span className="text-[10px] text-slate-400">Average</span>
          </div>
        </div>

        {/* Legend */}
        <div className={`flex flex-wrap justify-center gap-3 mt-3 ${isCompact ? 'text-[10px]' : 'text-xs'}`}>
          {rings.slice(0, 3).map((ring, index) => {
            const percent = Math.round((ring.value / ring.maxValue) * 100)
            return (
              <div key={index} className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: ring.color }}
                />
                <span className="text-slate-600">
                  {ring.label}: {percent}%
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
