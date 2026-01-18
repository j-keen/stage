'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface LibraryQuotaWidgetProps {
  title: string
  quotaValue?: number
  allCount: number
  publicCount: number
  privateCount: number
  isLoading?: boolean
  dimensions?: { width: number; height: number }
  gridSize?: { w: number; h: number }
  accentColor?: string
}

export function LibraryQuotaWidget({
  title,
  quotaValue,
  allCount,
  publicCount,
  privateCount,
  isLoading,
  accentColor = '#3B82F6',
}: LibraryQuotaWidgetProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2 pt-3 px-4">
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="flex justify-between">
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-8 w-12" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full bg-white border-slate-200/60 shadow-sm">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
          {title}
          {quotaValue !== undefined && (
            <span className="text-xs" style={{ color: accentColor }}>
              (quota: {quotaValue.toLocaleString()})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <div className="flex justify-between items-end">
          {/* All */}
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{allCount}</div>
            <div className="text-xs text-slate-500">All</div>
          </div>

          {/* Public */}
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: accentColor }}>
              {publicCount}
            </div>
            <div className="text-xs text-slate-500">Public</div>
          </div>

          {/* Private */}
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-400">{privateCount}</div>
            <div className="text-xs text-slate-500">Private</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
