'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { getChartTokens } from '@/lib/widget-design-system'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import {
  Activity,
  RefreshCw,
  UserPlus,
  MessageSquare,
  Phone,
  Edit3,
} from 'lucide-react'

export interface TimelineItem {
  id: string
  customerId: string
  customerName: string | null
  customerPhone: string | null
  action: string
  description: string
  fieldName?: string
  oldValue?: string | null
  newValue?: string | null
  userName: string | null
  createdAt: string
}

interface TimelineWidgetProps {
  title: string
  items: TimelineItem[]
  maxItems?: number
  isLoading?: boolean
  gridSize?: { w: number; h: number }
  dimensions?: { width: number; height: number }
  autoRefresh?: boolean
  refreshInterval?: number
  onRefresh?: () => void
  onItemClick?: (item: TimelineItem) => void
}

// 활동 타입별 아이콘과 색상
const activityConfig: Record<string, { icon: typeof Activity; color: string; bgColor: string }> = {
  status_change: {
    icon: RefreshCw,
    color: '#3B82F6',
    bgColor: '#DBEAFE',
  },
  assignment: {
    icon: UserPlus,
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
  },
  note_update: {
    icon: MessageSquare,
    color: '#10B981',
    bgColor: '#D1FAE5',
  },
  callback_set: {
    icon: Phone,
    color: '#F59E0B',
    bgColor: '#FEF3C7',
  },
  update: {
    icon: Edit3,
    color: '#6B7280',
    bgColor: '#F3F4F6',
  },
}

export function TimelineWidget({
  title,
  items,
  maxItems = 10,
  isLoading,
  gridSize,
  dimensions,
  autoRefresh,
  refreshInterval,
  onRefresh,
  onItemClick,
}: TimelineWidgetProps) {

  // 토큰
  const tokens = gridSize
    ? getChartTokens(gridSize.w, gridSize.h)
    : { titleSize: 'text-sm', headerPadding: 'pb-1 pt-1.5 px-2', contentPadding: 'pb-2 px-2' }

  // 표시할 아이템
  const displayItems = items.slice(0, maxItems)

  // 시간 포맷
  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: ko,
      })
    } catch {
      return timestamp
    }
  }

  // 아이템 클릭
  const handleItemClick = (item: TimelineItem) => {
    if (onItemClick) {
      onItemClick(item)
    }
  }

  if (isLoading) {
    return (
      <Card className="h-full overflow-hidden">
        <CardHeader className={cn('flex flex-row items-center justify-between space-y-0', tokens.headerPadding)}>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent className={tokens.contentPadding}>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-2">
                <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-2 w-20 mt-1" />
                </div>
              </div>
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
          <Activity className="h-4 w-4 text-muted-foreground" />
          <CardTitle className={cn(tokens.titleSize, 'font-medium')}>
            {title}
          </CardTitle>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-1 hover:bg-muted rounded transition-colors"
            title="새로고침"
          >
            <RefreshCw className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
      </CardHeader>
      <CardContent className={cn('flex-1 overflow-hidden', tokens.contentPadding)}>
        {items.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            최근 활동이 없습니다
          </div>
        ) : (
          <div className="h-full overflow-hidden">
            <div className="relative">
              {/* 타임라인 선 */}
              <div className="absolute left-3 top-3 bottom-3 w-px bg-border" />

              <div className="space-y-3">
                {displayItems.slice(0, 4).map((item, index) => {
                  const config = activityConfig[item.action] || activityConfig.update
                  const Icon = config.icon

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="w-full flex gap-3 items-start text-left hover:bg-muted/50 rounded-md p-1 -ml-1 transition-colors group"
                    >
                      {/* 아이콘 */}
                      <div
                        className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: config.bgColor }}
                      >
                        <Icon className="h-3 w-3" style={{ color: config.color }} />
                      </div>

                      {/* 내용 */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs leading-relaxed truncate">
                          <span className="font-medium">
                            {item.customerName || item.customerPhone || '고객'}
                          </span>
                          <span className="text-muted-foreground">
                            {' '}
                            {item.description}
                          </span>
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">
                            {formatTime(item.createdAt)}
                          </span>
                          {item.userName && (
                            <>
                              <span className="text-[10px] text-muted-foreground">·</span>
                              <span className="text-[10px] text-muted-foreground">
                                {item.userName}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
