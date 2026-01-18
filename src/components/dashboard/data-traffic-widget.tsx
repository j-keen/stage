'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react'

interface DataTrafficWidgetProps {
  title?: string
  uploadValue: number
  downloadValue: number
  totalValue: number
  unit?: string
  isLoading?: boolean
  dimensions?: { width: number; height: number }
  gridSize?: { w: number; h: number }
}

export function DataTrafficWidget({
  title = 'Data traffic statistics',
  uploadValue,
  downloadValue,
  totalValue,
  unit = '',
  isLoading,
  gridSize,
}: DataTrafficWidgetProps) {
  const [filter, setFilter] = useState('all')

  const isCompact = gridSize && (gridSize.w <= 2 || gridSize.h <= 3)

  // Format value with unit
  const formatValue = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toString()
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2 pt-3 px-4">
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="flex gap-4">
            <Skeleton className="h-16 w-20" />
            <Skeleton className="h-24 w-24 rounded-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full bg-white border-slate-200/60 shadow-sm flex flex-col">
      <CardHeader className="pb-2 pt-3 px-4 flex flex-row items-center justify-between flex-shrink-0">
        <CardTitle className="text-sm font-medium text-slate-700">{title}</CardTitle>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-16 h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Week</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-4 pb-3 flex-1 min-h-0 flex items-center">
        <div className="flex items-center justify-between w-full gap-4">
          {/* Upload/Download Stats */}
          <div className="space-y-3">
            {/* Upload */}
            <div className="flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4 text-rose-500" />
              <span className="text-xs text-slate-500">Upload:</span>
              <span className="text-sm font-semibold text-rose-500">
                {formatValue(uploadValue)}{unit}
              </span>
            </div>
            {/* Download */}
            <div className="flex items-center gap-2">
              <ArrowDownCircle className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-slate-500">Download:</span>
              <span className="text-sm font-semibold text-blue-500">
                {formatValue(downloadValue)}{unit}
              </span>
            </div>
          </div>

          {/* Total Circular Indicator */}
          <div className="relative flex items-center justify-center">
            <svg
              className={isCompact ? 'w-20 h-20' : 'w-24 h-24'}
              viewBox="0 0 100 100"
            >
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="8"
              />
              {/* Progress circle - gradient */}
              <defs>
                <linearGradient id="trafficGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#trafficGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${Math.PI * 90 * 0.75} ${Math.PI * 90 * 0.25}`}
                transform="rotate(-90 50 50)"
              />
            </svg>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`font-bold text-blue-600 ${isCompact ? 'text-lg' : 'text-xl'}`}>
                {formatValue(totalValue)}
              </span>
              <span className="text-[10px] text-slate-400">{unit}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
