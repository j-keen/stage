'use client'

import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { getStatTokens } from '@/lib/widget-design-system'
import { CUSTOMER_STATUS_LABELS, CUSTOMER_STATUS_COLORS, type CustomerStatus } from '@/types/database'
import {
  Users, UserPlus, Clock, Phone, UserMinus, XCircle, CheckCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface StatusCountWidgetProps {
  status: CustomerStatus
  count: number
  isLoading?: boolean
  gridSize?: { w: number; h: number }
  dimensions?: { width: number; height: number }
  onClick?: () => void
}

// 상태별 아이콘 매핑
const statusIcons: Record<CustomerStatus, typeof Users> = {
  prospect: UserPlus,
  in_progress: Clock,
  completed: CheckCircle,
  callback: Phone,
  absent: UserMinus,
  cancelled: XCircle,
}

// 상태별 배경색 (Tailwind 클래스 대신 hex 색상)
const statusBgColors: Record<CustomerStatus, string> = {
  prospect: '#DBEAFE',     // blue-100
  in_progress: '#FEF3C7', // amber-100
  completed: '#D1FAE5',   // green-100
  callback: '#EDE9FE',    // purple-100
  absent: '#FFEDD5',      // orange-100
  cancelled: '#FEE2E2',   // red-100
}

const statusIconColors: Record<CustomerStatus, string> = {
  prospect: '#3B82F6',     // blue-500
  in_progress: '#F59E0B', // amber-500
  completed: '#10B981',   // green-500
  callback: '#8B5CF6',    // purple-500
  absent: '#F97316',      // orange-500
  cancelled: '#EF4444',   // red-500
}

export function StatusCountWidget({
  status,
  count,
  isLoading,
  gridSize,
  dimensions,
  onClick,
}: StatusCountWidgetProps) {
  const router = useRouter()
  const Icon = statusIcons[status] || Users
  const label = CUSTOMER_STATUS_LABELS[status] || status
  const bgColor = statusBgColors[status]
  const iconColor = statusIconColors[status]

  // 그리드 사이즈 기반 토큰
  const tokens = gridSize
    ? getStatTokens(gridSize.w, gridSize.h)
    : { valueSize: 'text-xl', iconSize: 'h-4 w-4' }

  // micro (1x1, 2x1) 사이즈 감지
  const isMicro = gridSize && (gridSize.w * gridSize.h <= 2)
  const isCompact = gridSize && (gridSize.w * gridSize.h <= 4)

  // 클릭 핸들러
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      // 기본: 해당 상태로 필터링된 고객 목록으로 이동
      router.push(`/customers?status=${status}`)
    }
  }

  if (isLoading) {
    return (
      <div
        className="h-full w-full rounded-lg p-2 flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <Skeleton className="h-6 w-10" />
      </div>
    )
  }

  // 1x1 레이아웃: 아이콘과 숫자만
  if (isMicro && gridSize?.h === 1) {
    return (
      <button
        onClick={handleClick}
        className="h-full w-full rounded-lg p-1 flex items-center justify-center gap-1 transition-all hover:scale-105 hover:shadow-lg cursor-pointer backdrop-blur-sm"
        style={{
          backgroundColor: `${bgColor}cc`,
          backdropFilter: 'blur(8px)'
        }}
        title={label}
      >
        <Icon className="h-3 w-3" style={{ color: iconColor }} />
        <span className="text-lg font-bold" style={{ color: iconColor }}>
          {count.toLocaleString()}
        </span>
      </button>
    )
  }

  // 2x1 레이아웃: 아이콘, 숫자, 라벨 (가로 배치)
  if (isMicro) {
    return (
      <button
        onClick={handleClick}
        className="h-full w-full rounded-lg px-2 py-1 flex items-center justify-between transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer backdrop-blur-sm"
        style={{
          backgroundColor: `${bgColor}cc`,
          backdropFilter: 'blur(8px)'
        }}
      >
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5" style={{ color: iconColor }} />
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
        </div>
        <span className="text-xl font-bold" style={{ color: iconColor }}>
          {count.toLocaleString()}
        </span>
      </button>
    )
  }

  // 2x2 이상 레이아웃: 세로 배치
  return (
    <button
      onClick={handleClick}
      className="h-full w-full rounded-lg p-2 flex flex-col items-center justify-center transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer backdrop-blur-sm"
      style={{
        backgroundColor: `${bgColor}cc`,
        backdropFilter: 'blur(8px)'
      }}
    >
      <Icon className={cn(tokens.iconSize)} style={{ color: iconColor }} />
      <span
        className={cn(tokens.valueSize, 'font-bold mt-1')}
        style={{ color: iconColor }}
      >
        {count.toLocaleString()}
      </span>
      {!isCompact && (
        <span className="text-xs font-medium text-muted-foreground mt-0.5">
          {label}
        </span>
      )}
    </button>
  )
}
