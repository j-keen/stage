'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Users, UserPlus, Percent, CheckCircle, TrendingUp, TrendingDown, Clock, Phone, UserMinus, XCircle,
  // 추가 아이콘
  User, UserCheck, UserX, Users2,
  Circle, CircleDot, AlertCircle, Info, Star, Heart,
  Briefcase, Building, Wallet, CreditCard, DollarSign,
  Mail, MessageSquare, Bell,
  Target, Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getColorForValue, type ConditionalColorRule } from '@/lib/widget-colors'
import { getStatTokens } from '@/lib/widget-design-system'
import type { StyleOverrides } from '@/stores/dashboard-store'

// 벤치마크 정보 타입
interface BenchmarkInfo {
  value: number
  label: string  // "업계평균", "팀평균" 등
}

interface StatWidgetProps {
  title: string
  value: number | string
  previousValue?: number
  isPercentage?: boolean
  icon?: 'users' | 'userPlus' | 'percent' | 'checkCircle' | 'clock' | 'phone' | 'userMinus' | 'xCircle' |
    'user' | 'userCheck' | 'userX' | 'users2' |
    'circle' | 'circleDot' | 'alertCircle' | 'info' | 'star' | 'heart' |
    'briefcase' | 'building' | 'wallet' | 'creditCard' | 'dollarSign' | 'trendingUp' | 'trendingDown' |
    'mail' | 'messageSquare' | 'bell' |
    'target' | 'zap'
  isLoading?: boolean
  colorRules?: ConditionalColorRule[]
  dimensions?: { width: number; height: number }
  gridSize?: { w: number; h: number }
  iconColor?: string
  valueColor?: string
  styleOverrides?: StyleOverrides
  // 맥락 정보 (새로 추가)
  target?: number              // 목표값
  targetLabel?: string         // "목표", "기준" 등
  benchmark?: BenchmarkInfo    // 벤치마크 비교 정보
  showProgressBar?: boolean    // 목표 대비 진행률 바 표시
  unit?: string                // "건", "%" 등 단위 표시
}

const icons: Record<string, typeof Users> = {
  // 기본 아이콘 (8개)
  users: Users,
  userPlus: UserPlus,
  percent: Percent,
  checkCircle: CheckCircle,
  clock: Clock,
  phone: Phone,
  userMinus: UserMinus,
  xCircle: XCircle,
  // 사용자 (4개)
  user: User,
  userCheck: UserCheck,
  userX: UserX,
  users2: Users2,
  // 상태 (6개)
  circle: Circle,
  circleDot: CircleDot,
  alertCircle: AlertCircle,
  info: Info,
  star: Star,
  heart: Heart,
  // 비즈니스 (7개)
  briefcase: Briefcase,
  building: Building,
  wallet: Wallet,
  creditCard: CreditCard,
  dollarSign: DollarSign,
  trendingUp: TrendingUp,
  trendingDown: TrendingDown,
  // 커뮤니케이션 (3개)
  mail: Mail,
  messageSquare: MessageSquare,
  bell: Bell,
  // 기타 (2개)
  target: Target,
  zap: Zap,
}

// Helper to map styleOverrides values to Tailwind classes
const TITLE_SIZE_MAP: Record<string, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
}

const VALUE_SIZE_MAP: Record<string, string> = {
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
}

const ICON_SIZE_MAP: Record<string, string> = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
  xl: 'h-6 w-6',
}

// 4단계 여백 시스템 (widget-design-system.ts와 일치)
const SPACING_MAP: Record<string, { header: string; content: string }> = {
  ultra_compact: { header: 'pb-0.5 pt-1 px-1.5', content: 'pb-1 px-1.5' },
  compact: { header: 'pb-0.5 pt-1 px-2', content: 'pb-1.5 px-2' },
  normal: { header: 'pb-1 pt-1.5 px-2.5', content: 'pb-2 px-2.5' },
  spacious: { header: 'pb-1.5 pt-2 px-3', content: 'pb-2.5 px-3' },
}

export function StatWidget({
  title,
  value,
  previousValue,
  isPercentage,
  icon = 'users',
  isLoading,
  colorRules,
  dimensions,
  gridSize,
  iconColor,
  valueColor,
  styleOverrides,
  target,
  targetLabel = '목표',
  benchmark,
  showProgressBar,
  unit,
}: StatWidgetProps) {
  const Icon = icons[icon] || Users

  // Get tier-based design tokens from grid size (4단계 시스템)
  const baseTokens = gridSize
    ? getStatTokens(gridSize.w, gridSize.h)
    : {
        titleSize: 'text-sm',
        valueSize: 'text-2xl',
        iconSize: 'h-4 w-4',
        headerPadding: 'pb-0.5 pt-1 px-2',
        contentPadding: 'pb-1.5 px-2',
        changeSize: 'text-xs',
      }

  // Apply styleOverrides if present
  const tokens = {
    titleSize: styleOverrides?.titleSize && styleOverrides.titleSize !== 'auto'
      ? TITLE_SIZE_MAP[styleOverrides.titleSize] || baseTokens.titleSize
      : baseTokens.titleSize,
    valueSize: styleOverrides?.valueSize && styleOverrides.valueSize !== 'auto'
      ? VALUE_SIZE_MAP[styleOverrides.valueSize] || baseTokens.valueSize
      : baseTokens.valueSize,
    iconSize: styleOverrides?.iconSize && styleOverrides.iconSize !== 'auto'
      ? ICON_SIZE_MAP[styleOverrides.iconSize] || baseTokens.iconSize
      : baseTokens.iconSize,
    headerPadding: styleOverrides?.spacing
      ? SPACING_MAP[styleOverrides.spacing]?.header || baseTokens.headerPadding
      : baseTokens.headerPadding,
    contentPadding: styleOverrides?.spacing
      ? SPACING_MAP[styleOverrides.spacing]?.content || baseTokens.contentPadding
      : baseTokens.contentPadding,
  }

  const sizes = tokens

  // 값 포맷팅 (단위 포함)
  const formatValue = (val: number | string, includeUnit = true) => {
    if (typeof val === 'string') return val
    if (isPercentage) return `${val.toFixed(1)}%`
    const formatted = val.toLocaleString()
    return includeUnit && unit ? `${formatted}${unit}` : formatted
  }

  // 전기 대비 변화율 계산
  const getChangePercent = () => {
    if (previousValue === undefined || previousValue === 0) return null
    const numValue = typeof value === 'number' ? value : parseFloat(value)
    if (isNaN(numValue)) return null
    return ((numValue - previousValue) / previousValue) * 100
  }

  const changePercent = getChangePercent()

  // 숫자 값 추출
  const numericValue = typeof value === 'number' ? value : parseFloat(value as string)

  // 조건부 색상 계산
  const conditionalColor = colorRules && !isNaN(numericValue)
    ? getColorForValue(numericValue, changePercent, colorRules)
    : null

  // 목표 대비 진행률 계산
  const progressPercent = target && !isNaN(numericValue) && target > 0
    ? Math.min((numericValue / target) * 100, 100)
    : null

  // 진행률에 따른 색상 결정
  const getProgressColor = (percent: number) => {
    if (percent >= 100) return 'bg-green-500'
    if (percent >= 70) return 'bg-blue-500'
    if (percent >= 50) return 'bg-amber-500'
    return 'bg-red-500'
  }

  // 컴팩트 모드 여부 (2x2 이하)
  const isCompact = gridSize && (gridSize.w * gridSize.h <= 4)

  if (isLoading) {
    return (
      <Card className="h-full overflow-hidden">
        <CardHeader className={cn('flex flex-row items-center justify-between space-y-0', sizes.headerPadding)}>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent className={sizes.contentPadding}>
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-24 mt-1" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className="h-full overflow-hidden"
      style={conditionalColor ? {
        borderColor: conditionalColor.color,
        borderWidth: '2px',
      } : undefined}
    >
      <CardHeader className={cn('flex flex-row items-center justify-between space-y-0', sizes.headerPadding)}>
        <CardTitle className={cn(sizes.titleSize, 'font-medium text-muted-foreground truncate')}>
          {title}
        </CardTitle>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {conditionalColor?.label && (
            <Badge
              style={{
                backgroundColor: conditionalColor.bgColor,
                color: conditionalColor.color,
              }}
              className="text-[10px] px-1.5 py-0"
            >
              {conditionalColor.label}
            </Badge>
          )}
          <Icon
            className={cn(sizes.iconSize, !iconColor && 'text-muted-foreground')}
            style={iconColor ? { color: iconColor } : undefined}
          />
        </div>
      </CardHeader>
      <CardContent className={sizes.contentPadding}>
        <div
          className={cn(sizes.valueSize, 'font-bold')}
          style={valueColor ? { color: valueColor } : conditionalColor ? { color: conditionalColor.color } : undefined}
        >
          {formatValue(value)}
        </div>
        {changePercent !== null && (
          <p
            className={cn(
              'text-xs flex items-center gap-1 mt-0.5',
              !conditionalColor && changePercent > 0 && 'text-green-600',
              !conditionalColor && changePercent < 0 && 'text-red-600',
              !conditionalColor && changePercent === 0 && 'text-muted-foreground'
            )}
            style={conditionalColor ? { color: conditionalColor.color } : undefined}
          >
            {changePercent > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : changePercent < 0 ? (
              <TrendingDown className="h-3 w-3" />
            ) : null}
            {changePercent > 0 ? '+' : ''}
            {changePercent.toFixed(1)}% 전기 대비
          </p>
        )}
      </CardContent>
    </Card>
  )
}
