'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface DonutRing {
  label: string
  value: number
  total: number
  color: string
}

interface MultiRingDonutWidgetProps {
  title: string
  rings: DonutRing[]
  centerValue?: string | number
  centerLabel?: string
  isLoading?: boolean
  dimensions?: { width: number; height: number }
  gridSize?: { w: number; h: number }
}

export function MultiRingDonutWidget({
  title,
  rings,
  centerValue,
  centerLabel,
  isLoading,
  gridSize,
}: MultiRingDonutWidgetProps) {
  const isCompact = gridSize && (gridSize.w <= 2 || gridSize.h <= 3)

  // Ring configuration (outer to inner)
  const ringConfig = [
    { radius: 42, strokeWidth: 10 },
    { radius: 30, strokeWidth: 10 },
    { radius: 18, strokeWidth: 10 },
  ]

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2 pt-3 px-4">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="px-4 pb-4 flex flex-col items-center">
          <Skeleton className="h-28 w-28 rounded-full" />
          <div className="flex gap-3 mt-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate center value if not provided
  const displayCenterValue = centerValue ?? rings.reduce((sum, r) => sum + r.value, 0)

  return (
    <Card className="h-full bg-white border-slate-200/60 shadow-sm flex flex-col">
      <CardHeader className="pb-2 pt-3 px-4 flex-shrink-0">
        <CardTitle className="text-sm font-medium text-slate-700">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 flex-1 flex flex-col items-center justify-center min-h-0">
        {/* Multi-ring Donut */}
        <div className="relative flex items-center justify-center">
          <svg
            className={isCompact ? 'w-28 h-28' : 'w-36 h-36'}
            viewBox="0 0 100 100"
          >
            {rings.slice(0, 3).map((ring, index) => {
              const config = ringConfig[index]
              if (!config) return null

              const circumference = 2 * Math.PI * config.radius
              const percent = Math.min((ring.value / ring.total) * 100, 100)
              const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`

              return (
                <g key={index}>
                  {/* Background Ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r={config.radius}
                    fill="none"
                    stroke="#F1F5F9"
                    strokeWidth={config.strokeWidth}
                  />
                  {/* Progress Ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r={config.radius}
                    fill="none"
                    stroke={ring.color}
                    strokeWidth={config.strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={strokeDasharray}
                    transform="rotate(-90 50 50)"
                    className="transition-all duration-700 ease-out"
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
                  />
                </g>
              )
            })}
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-bold text-slate-800 ${isCompact ? 'text-lg' : 'text-2xl'}`}>
              {displayCenterValue}
            </span>
            {centerLabel && (
              <span className="text-[10px] text-slate-400">{centerLabel}</span>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className={`grid ${rings.length > 2 ? 'grid-cols-3' : 'grid-cols-2'} gap-2 mt-3 w-full max-w-[200px]`}>
          {rings.slice(0, 3).map((ring, index) => {
            const percent = Math.round((ring.value / ring.total) * 100)
            return (
              <div key={index} className="flex items-center gap-1.5 text-[10px]">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: ring.color }}
                />
                <div className="min-w-0">
                  <div className="text-slate-600 truncate">{ring.label}</div>
                  <div className="text-slate-900 font-medium">{percent}%</div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
