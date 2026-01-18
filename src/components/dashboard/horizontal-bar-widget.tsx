'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'

interface BarItem {
  label: string
  value: number
  maxValue?: number
  color?: string
}

interface HorizontalBarWidgetProps {
  title: string
  data: BarItem[]
  unit?: string
  showPercentage?: boolean
  isLoading?: boolean
  dimensions?: { width: number; height: number }
  gridSize?: { w: number; h: number }
}

const DEFAULT_COLORS = [
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#F59E0B', // amber
  '#10B981', // emerald
  '#06B6D4', // cyan
]

export function HorizontalBarWidget({
  title,
  data,
  unit = '',
  showPercentage = true,
  isLoading,
}: HorizontalBarWidgetProps) {
  // Calculate max for percentage
  const maxValue = Math.max(...data.map((d) => d.maxValue || d.value))

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2 pt-3 px-4">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="px-4 pb-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between mb-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-3 w-full rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full bg-white border-slate-200/60 shadow-sm flex flex-col">
      <CardHeader className="pb-2 pt-3 px-4 flex-shrink-0">
        <CardTitle className="text-sm font-medium text-slate-700">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3 flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-4">
            {data.map((item, index) => {
              const itemMax = item.maxValue || maxValue
              const percent = (item.value / itemMax) * 100
              const color = item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]

              return (
                <div key={index}>
                  {/* Label and Value */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-slate-700 font-medium truncate">
                      {item.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {item.value.toLocaleString()}{unit}
                      </span>
                      {showPercentage && (
                        <span className="text-xs text-slate-400">
                          ({percent.toFixed(0)}%)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${percent}%`,
                        background: `linear-gradient(90deg, ${color}CC, ${color})`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
