'use client'

import { useDashboardStore } from '@/stores/dashboard-store'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format, startOfDay, endOfDay, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Period = 'today' | 'yesterday' | 'week' | 'month' | 'lastMonth' | 'custom'

interface PeriodOption {
  value: Period
  label: string
}

const periodOptions: PeriodOption[] = [
  { value: 'today', label: '오늘' },
  { value: 'yesterday', label: '어제' },
  { value: 'week', label: '최근7일' },
  { value: 'month', label: '당월' },
  { value: 'lastMonth', label: '전월' },
]

export function PeriodFilter() {
  const { period, customDateRange, setPeriod, setCustomDateRange } = useDashboardStore()

  const getDateRange = () => {
    const now = new Date()
    switch (period) {
      case 'today':
        return { from: startOfDay(now), to: endOfDay(now) }
      case 'yesterday':
        const yesterday = subDays(now, 1)
        return { from: startOfDay(yesterday), to: endOfDay(yesterday) }
      case 'week':
        return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) }
      case 'month':
        return { from: startOfMonth(now), to: endOfMonth(now) }
      case 'lastMonth':
        const lastMonth = subMonths(now, 1)
        return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) }
      case 'custom':
        return {
          from: customDateRange.from ? new Date(customDateRange.from) : null,
          to: customDateRange.to ? new Date(customDateRange.to) : null,
        }
    }
  }

  const dateRange = getDateRange()

  return (
    <div className="flex items-center gap-1">
      {periodOptions.map((option) => (
        <Button
          key={option.value}
          variant={period === option.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPeriod(option.value)}
          className="h-8 px-3"
        >
          {option.label}
        </Button>
      ))}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={period === 'custom' ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'h-8 px-3',
              period === 'custom' && 'bg-primary text-primary-foreground'
            )}
          >
            <CalendarIcon className="h-4 w-4 mr-1" />
            {period === 'custom' && dateRange.from && dateRange.to
              ? `${format(dateRange.from, 'MM/dd', { locale: ko })} ~ ${format(dateRange.to, 'MM/dd', { locale: ko })}`
              : '날짜선택'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="flex gap-2 p-3">
            <div>
              <div className="text-sm font-medium mb-2 text-center">시작일</div>
              <Calendar
                mode="single"
                selected={dateRange.from || undefined}
                onSelect={(date) => {
                  setPeriod('custom')
                  setCustomDateRange(date?.toISOString() || null, customDateRange.to)
                }}
                locale={ko}
              />
            </div>
            <div>
              <div className="text-sm font-medium mb-2 text-center">종료일</div>
              <Calendar
                mode="single"
                selected={dateRange.to || undefined}
                onSelect={(date) => {
                  setPeriod('custom')
                  setCustomDateRange(customDateRange.from, date?.toISOString() || null)
                }}
                locale={ko}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
