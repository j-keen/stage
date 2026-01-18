'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { getChartTokens } from '@/lib/widget-design-system'
import { useRouter } from 'next/navigation'
import {
  Trophy,
  Medal,
  Award,
  ChevronUp,
  ChevronDown,
  Users,
} from 'lucide-react'

export interface PerformanceRow {
  id: string
  name: string
  teamId?: string
  teamName?: string
  rank?: number
  totalCount: number
  completedCount: number
  successRate: number
  inProgressCount?: number
  prospectCount?: number
  callbackCount?: number
}

interface PerformanceTableWidgetProps {
  title: string
  data: PerformanceRow[]
  sortBy?: 'completedCount' | 'successRate' | 'totalCount'
  showTeam?: boolean
  isLoading?: boolean
  gridSize?: { w: number; h: number }
  dimensions?: { width: number; height: number }
  onRowClick?: (row: PerformanceRow) => void
  groupBy?: 'assignee' | 'team'
}

// 순위별 아이콘
const rankIcons: Record<number, { icon: typeof Trophy; color: string }> = {
  1: { icon: Trophy, color: '#F59E0B' },   // gold
  2: { icon: Medal, color: '#9CA3AF' },     // silver
  3: { icon: Award, color: '#CD7F32' },     // bronze
}

export function PerformanceTableWidget({
  title,
  data,
  sortBy: initialSortBy = 'completedCount',
  showTeam = false,
  isLoading,
  gridSize,
  dimensions,
  onRowClick,
  groupBy = 'assignee',
}: PerformanceTableWidgetProps) {
  const router = useRouter()
  const [sortBy, setSortBy] = useState<'completedCount' | 'successRate' | 'totalCount'>(initialSortBy)
  const [sortAsc, setSortAsc] = useState(false)

  // 토큰
  const tokens = gridSize
    ? getChartTokens(gridSize.w, gridSize.h)
    : { titleSize: 'text-sm', headerPadding: 'pb-1 pt-1.5 px-2', contentPadding: 'pb-2 px-2' }

  // 정렬된 데이터
  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortBy]
    const bVal = b[sortBy]
    return sortAsc ? aVal - bVal : bVal - aVal
  })

  // 정렬 핸들러
  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortAsc(!sortAsc)
    } else {
      setSortBy(column)
      setSortAsc(false)
    }
  }

  // 행 클릭 핸들러
  const handleRowClick = (row: PerformanceRow) => {
    if (onRowClick) {
      onRowClick(row)
    } else {
      // 기본: 해당 담당자의 고객 목록으로 이동
      if (groupBy === 'assignee') {
        router.push(`/customers?assignedTo=${row.id}`)
      }
    }
  }

  // 컴팩트 여부
  const isCompact = gridSize && (gridSize.w * gridSize.h <= 16)

  // 정렬 아이콘
  const SortIcon = ({ column }: { column: typeof sortBy }) => {
    if (sortBy !== column) return null
    return sortAsc ? (
      <ChevronUp className="h-3 w-3" />
    ) : (
      <ChevronDown className="h-3 w-3" />
    )
  }

  if (isLoading) {
    return (
      <Card className="h-full overflow-hidden">
        <CardHeader className={cn('flex flex-row items-center justify-between space-y-0', tokens.headerPadding)}>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent className={tokens.contentPadding}>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <CardHeader className={cn('flex flex-row items-center justify-between space-y-0 flex-shrink-0', tokens.headerPadding)}>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <CardTitle className={cn(tokens.titleSize, 'font-medium')}>
            {title}
          </CardTitle>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {data.length}명
          </Badge>
        </div>
      </CardHeader>
      <CardContent className={cn('flex-1 overflow-hidden', tokens.contentPadding)}>
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            데이터가 없습니다
          </div>
        ) : (
          <div className="h-full overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1.5 px-1 font-medium text-muted-foreground w-8">
                    #
                  </th>
                  <th className="text-left py-1.5 px-1 font-medium text-muted-foreground">
                    {groupBy === 'team' ? '팀' : '담당자'}
                  </th>
                  <th
                    className="text-right py-1.5 px-1 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('completedCount')}
                  >
                    <span className="flex items-center justify-end gap-0.5">
                      완료
                      <SortIcon column="completedCount" />
                    </span>
                  </th>
                  {!isCompact && (
                    <th
                      className="text-right py-1.5 px-1 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                      onClick={() => handleSort('totalCount')}
                    >
                      <span className="flex items-center justify-end gap-0.5">
                        전체
                        <SortIcon column="totalCount" />
                      </span>
                    </th>
                  )}
                  <th
                    className="text-right py-1.5 px-1 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('successRate')}
                  >
                    <span className="flex items-center justify-end gap-0.5">
                      성공률
                      <SortIcon column="successRate" />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.slice(0, 5).map((row, index) => {
                  const rank = index + 1
                  const rankInfo = rankIcons[rank]
                  const RankIcon = rankInfo?.icon

                  return (
                    <tr
                      key={row.id}
                      onClick={() => handleRowClick(row)}
                      className={cn(
                        'border-b border-border/50 cursor-pointer hover:bg-muted/50 transition-colors',
                        rank <= 3 && 'bg-muted/30'
                      )}
                    >
                      <td className="py-1.5 px-1">
                        {RankIcon ? (
                          <RankIcon
                            className="h-4 w-4"
                            style={{ color: rankInfo.color }}
                          />
                        ) : (
                          <span className="text-muted-foreground">{rank}</span>
                        )}
                      </td>
                      <td className="py-1.5 px-1">
                        <div className="flex flex-col">
                          <span className={cn('font-medium', rank <= 3 && 'text-foreground')}>
                            {row.name}
                          </span>
                          {showTeam && row.teamName && (
                            <span className="text-[10px] text-muted-foreground">
                              {row.teamName}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-1.5 px-1 text-right font-semibold">
                        {row.completedCount.toLocaleString()}
                      </td>
                      {!isCompact && (
                        <td className="py-1.5 px-1 text-right text-muted-foreground">
                          {row.totalCount.toLocaleString()}
                        </td>
                      )}
                      <td className="py-1.5 px-1 text-right">
                        <span
                          className={cn(
                            'font-medium',
                            row.successRate >= 70 && 'text-green-600',
                            row.successRate >= 50 && row.successRate < 70 && 'text-amber-600',
                            row.successRate < 50 && 'text-red-600'
                          )}
                        >
                          {row.successRate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
