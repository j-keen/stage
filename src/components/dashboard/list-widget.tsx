'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { getChartTokens } from '@/lib/widget-design-system'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import {
  Phone, Clock, AlertCircle, ChevronRight, User
} from 'lucide-react'
import type { CustomerStatus } from '@/types/database'
import { CUSTOMER_STATUS_LABELS } from '@/types/database'

export interface ListItem {
  id: string
  title: string
  subtitle?: string
  timestamp?: string
  badge?: {
    label: string
    color: string
    bgColor: string
  }
  status?: CustomerStatus
  phone?: string
  metadata?: Record<string, unknown>
}

interface ListWidgetProps {
  title: string
  items: ListItem[]
  maxItems?: number
  emptyMessage?: string
  icon?: 'phone' | 'clock' | 'alertCircle' | 'user'
  isLoading?: boolean
  gridSize?: { w: number; h: number }
  dimensions?: { width: number; height: number }
  onItemClick?: (item: ListItem) => void
  viewAllLink?: string
}

const iconMap = {
  phone: Phone,
  clock: Clock,
  alertCircle: AlertCircle,
  user: User,
}

// 상태별 배지 색상
const statusBadgeColors: Record<CustomerStatus, { color: string; bgColor: string }> = {
  prospect: { color: '#3B82F6', bgColor: '#DBEAFE' },
  in_progress: { color: '#F59E0B', bgColor: '#FEF3C7' },
  completed: { color: '#10B981', bgColor: '#D1FAE5' },
  callback: { color: '#8B5CF6', bgColor: '#EDE9FE' },
  absent: { color: '#F97316', bgColor: '#FFEDD5' },
  cancelled: { color: '#EF4444', bgColor: '#FEE2E2' },
}

export function ListWidget({
  title,
  items,
  maxItems = 5,
  emptyMessage = '데이터가 없습니다',
  icon = 'user',
  isLoading,
  gridSize,
  dimensions,
  onItemClick,
  viewAllLink,
}: ListWidgetProps) {
  const Icon = iconMap[icon] || User

  // 토큰
  const tokens = gridSize
    ? getChartTokens(gridSize.w, gridSize.h)
    : { titleSize: 'text-sm', headerPadding: 'pb-1 pt-1.5 px-2', contentPadding: 'pb-2 px-2' }

  // 표시할 아이템 수 (그리드 높이에 따라 조절)
  const displayItems = items.slice(0, maxItems)
  const hasMore = items.length > maxItems

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

  // 아이템 클릭 핸들러
  const handleItemClick = (item: ListItem) => {
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
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
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
          <Icon className="h-4 w-4 text-muted-foreground" />
          <CardTitle className={cn(tokens.titleSize, 'font-medium')}>
            {title}
          </CardTitle>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {items.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className={cn('flex-1 overflow-hidden', tokens.contentPadding)}>
        {items.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            {emptyMessage}
          </div>
        ) : (
          <div className="h-full overflow-hidden">
            <div className="space-y-1">
              {displayItems.slice(0, 3).map((item) => {
                const badgeColors = item.status
                  ? statusBadgeColors[item.status]
                  : item.badge

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="w-full p-2 rounded-md hover:bg-muted/50 transition-colors flex items-center gap-2 text-left group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {item.title || item.phone || '이름 없음'}
                        </span>
                        {badgeColors && (
                          <Badge
                            className="text-[10px] px-1.5 py-0 flex-shrink-0"
                            style={{
                              backgroundColor: badgeColors.bgColor,
                              color: badgeColors.color,
                            }}
                          >
                            {item.badge?.label || (item.status && CUSTOMER_STATUS_LABELS[item.status])}
                          </Badge>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                    {item.timestamp && (
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">
                        {formatTime(item.timestamp)}
                      </span>
                    )}
                    <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </button>
                )
              })}

              {items.length > 3 && viewAllLink && (
                <a
                  href={viewAllLink}
                  className="w-full p-1.5 text-center text-xs text-primary hover:underline block"
                >
                  +{items.length - 3}건 더 보기 →
                </a>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
