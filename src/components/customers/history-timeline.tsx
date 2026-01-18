'use client'

import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useCustomerHistory } from '@/hooks/use-customers'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { CUSTOMER_STATUS_LABELS, type CustomerStatus } from '@/types/database'
import { User, Clock, ArrowRight } from 'lucide-react'

interface HistoryTimelineProps {
  customerId: string
}

interface HistoryItem {
  id: string
  customer_id: string
  field_name: string
  old_value: string | null
  new_value: string | null
  changed_by: string | null
  created_at: string
  user?: { id: string; name: string } | null
}

const FIELD_LABELS: Record<string, string> = {
  phone: '전화번호',
  name: '이름',
  status: '상태',
  assigned_to: '담당자',
  notes: '메모',
  callback_date: '콜백일시',
  loan_amount: '대출희망금액',
  credit_score: '신용점수',
  created: '생성',
}

export function HistoryTimeline({ customerId }: HistoryTimelineProps) {
  const { data: history, isLoading } = useCustomerHistory(customerId)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        변경 이력이 없습니다
      </div>
    )
  }

  const formatValue = (fieldName: string, value: string | null) => {
    if (!value || value === 'null') return '-'

    if (fieldName === 'status') {
      return CUSTOMER_STATUS_LABELS[value as CustomerStatus] || value
    }

    if (fieldName === 'callback_date') {
      try {
        return format(new Date(value), 'yyyy-MM-dd HH:mm', { locale: ko })
      } catch {
        return value
      }
    }

    if (fieldName === 'loan_amount' || fieldName === 'credit_score') {
      const num = Number(value)
      if (!isNaN(num)) {
        return new Intl.NumberFormat('ko-KR').format(num)
      }
    }

    return value
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

        <div className="space-y-4">
          {(history as HistoryItem[]).map((item, index) => (
            <div key={item.id} className="relative flex gap-4 ml-1">
              {/* Timeline dot */}
              <div
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background ${
                  index === 0 ? 'border-primary' : 'border-muted'
                }`}
              >
                {item.user ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
              </div>

              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">
                    {item.user?.name || '시스템'}
                  </span>
                  <span className="text-muted-foreground">
                    {format(new Date(item.created_at), 'yyyy-MM-dd HH:mm', {
                      locale: ko,
                    })}
                  </span>
                </div>

                <div className="mt-1 text-sm">
                  <Badge variant="outline" className="mr-2">
                    {FIELD_LABELS[item.field_name] || item.field_name}
                  </Badge>

                  {item.field_name === 'created' ? (
                    <span className="text-muted-foreground">
                      고객 정보가 생성되었습니다
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <span className="text-muted-foreground line-through">
                        {formatValue(item.field_name, item.old_value)}
                      </span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">
                        {formatValue(item.field_name, item.new_value)}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}
