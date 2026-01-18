'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'

interface CategoryItem {
  name: string
  total: number
  proportion: number
  color: string
}

interface CategoryStatsTableProps {
  title?: string
  data: CategoryItem[]
  isLoading?: boolean
  dimensions?: { width: number; height: number }
  gridSize?: { w: number; h: number }
}

const DEFAULT_COLORS = [
  '#EF4444', // red
  '#F97316', // orange
  '#EAB308', // yellow
  '#22C55E', // green
  '#3B82F6', // blue
  '#8B5CF6', // purple
]

export function CategoryStatsTable({
  title = 'Statistics',
  data,
  isLoading,
}: CategoryStatsTableProps) {
  // Add colors if not provided
  const dataWithColors = data.map((item, index) => ({
    ...item,
    color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }))

  // Calculate total for proportions if not provided
  const totalSum = data.reduce((acc, item) => acc + item.total, 0)
  const total = data.reduce((acc, item) => acc + item.total, 0)

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2 pt-3 px-4">
          <Skeleton className="h-4 w-20" />
        </CardHeader>
        <CardContent className="px-4 pb-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-2 py-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-8 ml-auto" />
              <Skeleton className="h-3 w-12" />
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
      <CardContent className="px-4 pb-3 flex-1 min-h-0 flex flex-col">
        {/* Header Row */}
        <div className="flex items-center text-xs text-slate-500 pb-2 border-b border-slate-100 flex-shrink-0">
          <div className="flex-1">Name</div>
          <div className="w-14 text-right">Total</div>
          <div className="w-16 text-right">Proportion</div>
        </div>

        {/* Data Rows */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-0">
            {dataWithColors.map((item, index) => (
              <div
                key={index}
                className="flex items-center py-2 text-sm border-b border-slate-50 last:border-0"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-700 truncate">{item.name}</span>
                </div>
                <div className="w-14 text-right text-slate-900 font-medium">
                  {item.total}
                </div>
                <div className="w-16 text-right text-slate-500">
                  {item.proportion.toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Total Row */}
        <div className="flex items-center pt-2 mt-2 border-t border-slate-200 text-sm flex-shrink-0">
          <div className="flex-1 text-slate-500">The total number of instances:</div>
          <div className="font-bold text-slate-900">{total}</div>
        </div>

        {/* Progress Bar */}
        <div className="flex h-2 mt-2 rounded-full overflow-hidden flex-shrink-0">
          {dataWithColors.map((item, index) => (
            <div
              key={index}
              style={{
                width: `${(item.total / totalSum) * 100}%`,
                backgroundColor: item.color,
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
