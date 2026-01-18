'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts'
import { CUSTOMER_STATUS_LABELS, CUSTOMER_STATUS_COLORS, type CustomerStatus } from '@/types/database'
import { cn } from '@/lib/utils'
import { getChartTokens } from '@/lib/widget-design-system'
import type { StyleOverrides } from '@/stores/dashboard-store'

interface ChartWidgetProps {
  title: string
  data: Array<Record<string, unknown>>
  chartType: 'pie' | 'line' | 'bar' | 'area' | 'donut' | 'stacked-bar'
  isLoading?: boolean
  dimensions?: { width: number; height: number }
  gridSize?: { w: number; h: number }
  colors?: string[]
  styleOverrides?: StyleOverrides
}

// Helper to map styleOverrides values to Tailwind classes
const TITLE_SIZE_MAP: Record<string, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
}

const SPACING_MAP: Record<string, { header: string; content: string }> = {
  compact: { header: 'pb-0 pt-1 px-2', content: 'pb-1 px-1' },
  normal: { header: 'pb-1 pt-1.5 px-3', content: 'pb-2 px-2' },
  spacious: { header: 'pb-2 pt-2 px-4', content: 'pb-3 px-3' },
}

const STATUS_CHART_COLORS: Record<CustomerStatus, string> = {
  prospect: '#3B82F6',     // 가망고객 - 파랑
  in_progress: '#F59E0B',  // 진행중 - 노랑
  completed: '#10B981',    // 완료 - 초록
  callback: '#8B5CF6',     // 재통화 - 보라
  absent: '#F97316',       // 부재 - 주황
  cancelled: '#EF4444',    // 취소 - 빨강
}

const DEFAULT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316']

export function ChartWidget({ title, data, chartType, isLoading, dimensions, gridSize, colors, styleOverrides }: ChartWidgetProps) {
  // Get tier-based design tokens from grid size
  const baseTokens = gridSize
    ? getChartTokens(gridSize.w, gridSize.h)
    : {
        titleSize: 'text-sm',
        headerPadding: 'pb-1 pt-1.5 px-3',
        contentPadding: 'pb-2 px-2',
        chartHeight: 200,
        axisFontSize: 11,
        showLabels: false,
        showLegend: false,
        pie: {
          innerRadius: 35,
          outerRadius: 70,
        },
      }

  // Apply styleOverrides if present
  const tokens = {
    ...baseTokens,
    titleSize: styleOverrides?.titleSize && styleOverrides.titleSize !== 'auto'
      ? TITLE_SIZE_MAP[styleOverrides.titleSize] || baseTokens.titleSize
      : baseTokens.titleSize,
    headerPadding: styleOverrides?.spacing
      ? SPACING_MAP[styleOverrides.spacing]?.header || baseTokens.headerPadding
      : baseTokens.headerPadding,
    contentPadding: styleOverrides?.spacing
      ? SPACING_MAP[styleOverrides.spacing]?.content || baseTokens.contentPadding
      : baseTokens.contentPadding,
  }

  const styles = tokens
  const chartHeight = tokens.chartHeight
  const chartColors = colors || DEFAULT_COLORS

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col overflow-hidden">
        <CardHeader className={cn(styles.headerPadding, 'flex-shrink-0')}>
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className={cn(styles.contentPadding, 'flex-1 min-h-0 overflow-hidden')}>
          <Skeleton className="w-full" style={{ height: chartHeight }} />
        </CardContent>
      </Card>
    )
  }

  const getColor = (entry: Record<string, unknown>, index: number) => {
    if (entry.status && STATUS_CHART_COLORS[entry.status as CustomerStatus]) {
      return STATUS_CHART_COLORS[entry.status as CustomerStatus]
    }
    return chartColors[index % chartColors.length]
  }

  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={tokens.pie.innerRadius}
                outerRadius={tokens.pie.outerRadius}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={tokens.showLabels ? ({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                : undefined}
                labelLine={tokens.showLabels}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry, index)} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [
                  (value as number).toLocaleString(),
                  CUSTOMER_STATUS_LABELS[name as CustomerStatus] || String(name),
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        )

      case 'donut':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={tokens.pie.innerRadius}
                outerRadius={tokens.pie.outerRadius}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={tokens.showLabels ? ({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                : undefined}
                labelLine={tokens.showLabels}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry, index)} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [
                  (value as number).toLocaleString(),
                  CUSTOMER_STATUS_LABELS[name as CustomerStatus] || String(name),
                ]}
              />
              {tokens.showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        )

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getMonth() + 1}/${date.getDate()}`
                }}
                tick={{ fontSize: tokens.axisFontSize }}
              />
              <YAxis tick={{ fontSize: tokens.axisFontSize }} />
              <Tooltip
                labelFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                }}
              />
              {tokens.showLegend && <Legend />}
              <Line
                type="monotone"
                dataKey="count"
                stroke={chartColors[0]}
                strokeWidth={2}
                dot={{ r: tokens.axisFontSize > 11 ? 3 : 2 }}
                name="접수 건수"
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getMonth() + 1}/${date.getDate()}`
                }}
                tick={{ fontSize: tokens.axisFontSize }}
              />
              <YAxis tick={{ fontSize: tokens.axisFontSize }} />
              <Tooltip
                labelFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                }}
              />
              {tokens.showLegend && <Legend />}
              <Area
                type="monotone"
                dataKey="count"
                stroke={chartColors[0]}
                fill={chartColors[0]}
                fillOpacity={0.3}
                strokeWidth={2}
                name="접수 건수"
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: tokens.axisFontSize }} />
              <YAxis tick={{ fontSize: tokens.axisFontSize }} />
              <Tooltip />
              {tokens.showLegend && <Legend />}
              <Bar dataKey="value" fill={chartColors[0]} name="건수" />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'stacked-bar':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: tokens.axisFontSize }} />
              <YAxis tick={{ fontSize: tokens.axisFontSize }} />
              <Tooltip />
              {tokens.showLegend && <Legend />}
              <Bar dataKey="value" stackId="a" fill={chartColors[0]} name="전체" />
              <Bar dataKey="completed" stackId="a" fill={chartColors[1]} name="완료" />
            </BarChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className={cn(styles.headerPadding, 'flex-shrink-0')}>
        <CardTitle className={cn(styles.titleSize, 'font-medium truncate')}>{title}</CardTitle>
      </CardHeader>
      <CardContent className={cn(styles.contentPadding, 'flex-1 min-h-0 overflow-hidden')}>
        {data.length === 0 ? (
          <div className="flex items-center justify-center text-muted-foreground text-sm" style={{ height: chartHeight }}>
            데이터가 없습니다
          </div>
        ) : (
          <div className="w-full h-full overflow-hidden">
            {renderChart()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
