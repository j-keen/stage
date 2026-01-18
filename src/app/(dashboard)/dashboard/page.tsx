'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useDashboardStore, type WidgetConfig } from '@/stores/dashboard-store'
import { PeriodFilter } from '@/components/dashboard/period-filter'
import { StatWidget } from '@/components/dashboard/stat-widget'
import { ChartWidget } from '@/components/dashboard/chart-widget'
import { StatusCountWidget } from '@/components/dashboard/status-count-widget'
import { ListWidget, type ListItem } from '@/components/dashboard/list-widget'
import { GoalGaugeWidget } from '@/components/dashboard/goal-gauge-widget'
import { TimelineWidget, type TimelineItem } from '@/components/dashboard/timeline-widget'
import { PerformanceTableWidget, type PerformanceRow } from '@/components/dashboard/performance-table-widget'
// IoT Admin Panel 위젯
import { AccountInfoWidget } from '@/components/dashboard/account-info-widget'
import { LibraryQuotaWidget } from '@/components/dashboard/library-quota-widget'
import { SuccessRateWidget } from '@/components/dashboard/success-rate-widget'
import { DonutStatsWidget } from '@/components/dashboard/donut-stats-widget'
import { CategoryStatsTable } from '@/components/dashboard/category-stats-table'
import { DataTrafficWidget } from '@/components/dashboard/data-traffic-widget'
import { CircularQuotaWidget } from '@/components/dashboard/circular-quota-widget'
// 새로운 다양한 스타일 위젯
import { GradientGaugeWidget } from '@/components/dashboard/gradient-gauge-widget'
import { ActivityRingsWidget } from '@/components/dashboard/activity-rings-widget'
import { TrendStatWidget } from '@/components/dashboard/trend-stat-widget'
import { HorizontalBarWidget } from '@/components/dashboard/horizontal-bar-widget'
import { MultiRingDonutWidget } from '@/components/dashboard/multi-ring-donut-widget'
import { TaskProgressWidget } from '@/components/dashboard/task-progress-widget'
import { CustomerModal } from '@/components/customers/customer-modal'
import { useUser } from '@/hooks/use-user'
import { Button } from '@/components/ui/button'
import { RefreshCw, Settings, Plus, RotateCcw, X, MoreVertical, ChevronDown, Save, FolderOpen, Database } from 'lucide-react'
import { AddWidgetModal } from '@/components/dashboard/add-widget-modal'
import { WidgetCustomizationModal } from '@/components/dashboard/widget-customization-modal'
import { PresetManager } from '@/components/dashboard/preset-manager'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  PRESET_FORMULAS,
  FORMULA_CATEGORY_LABELS,
  isChartViewType,
  getChartType,
  getWidgetIcon,
  type FormulaCategory,
} from '@/lib/widget-formulas'
import { startOfDay, endOfDay, subDays, subMonths, startOfMonth, endOfMonth, format } from 'date-fns'
import type { CustomerStatus } from '@/types/database'
import { CUSTOMER_STATUS_LABELS } from '@/types/database'
import { GridLayout, verticalCompactor, type LayoutItem, type Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'

interface DashboardStats {
  totalCustomers: number
  prospectCustomers: number
  inProgressCount: number
  completedCount: number
  successRate: number
  statusDistribution: Array<{ name: string; value: number; status: CustomerStatus }>
  dailyTrend: Array<{ date: string; count: number }>
  assigneeStats: Array<{ name: string; total: number; completed: number }>
  // 새로 추가된 데이터
  callbackCount: number
  absentCount: number
  cancelledCount: number
}

// 새 위젯용 데이터 타입
interface CallbackData {
  callbacks: ListItem[]
  total: number
}

interface StaleData {
  staleCustomers: ListItem[]
  total: number
}

interface IncompleteData {
  incompleteCustomers: ListItem[]
  total: number
}

interface TimelineData {
  activities: TimelineItem[]
  total: number
}

interface PerformanceData {
  performance: PerformanceRow[]
  groupBy: string
}

interface GoalData {
  current: number
  goal: number
  percentage: number
  trend: 'up' | 'down' | 'same'
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [customizingWidget, setCustomizingWidget] = useState<WidgetConfig | null>(null)
  const [isPresetSaveOpen, setIsPresetSaveOpen] = useState(false)
  const [isPresetLoadOpen, setIsPresetLoadOpen] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const [containerWidth, setContainerWidth] = useState(1200)
  const containerRef = useRef<HTMLDivElement>(null)

  // 고객 모달 상태
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)

  // IoT Admin Panel용 사용자 정보
  const { user, role } = useUser()

  // 새 위젯용 데이터 상태
  const [callbackData, setCallbackData] = useState<CallbackData | null>(null)
  const [staleData, setStaleData] = useState<StaleData | null>(null)
  const [incompleteData, setIncompleteData] = useState<IncompleteData | null>(null)
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null)
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [goalData, setGoalData] = useState<GoalData | null>(null)

  const { period, customDateRange, widgets, setWidgets, updateWidget, addWidget, resetWidgets, removeWidget } = useDashboardStore()

  // Track container width with ResizeObserver
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })

    resizeObserver.observe(container)
    setContainerWidth(container.clientWidth)

    return () => resizeObserver.disconnect()
  }, [])

  const getDateRange = useCallback(() => {
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
          from: customDateRange.from ? new Date(customDateRange.from) : startOfMonth(now),
          to: customDateRange.to ? new Date(customDateRange.to) : endOfMonth(now),
        }
    }
  }, [period, customDateRange])

  const fetchStats = useCallback(async () => {
    setIsFetching(true)
    const dateRange = getDateRange()

    try {
      // Fetch customers via API (uses Admin client to bypass RLS)
      const params = new URLSearchParams({
        dateFrom: dateRange.from.toISOString(),
        dateTo: dateRange.to.toISOString(),
      })

      const response = await fetch(`/api/dashboard/stats?${params}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch dashboard stats')
      }

      const { customers: data } = await response.json()

      const customers = data as Array<{
        id: string
        status: string
        created_at: string
        assigned_to: string | null
        users: { id: string; name: string } | null
      }> | null

      // Calculate stats with new status values
      const totalCustomers = customers?.length || 0
      const prospectCustomers = customers?.filter(c => c.status === 'prospect').length || 0
      const inProgressCount = customers?.filter(c => c.status === 'in_progress').length || 0
      const completedCount = customers?.filter(c => c.status === 'completed').length || 0
      const callbackCount = customers?.filter(c => c.status === 'callback').length || 0
      const absentCount = customers?.filter(c => c.status === 'absent').length || 0
      const cancelledCount = customers?.filter(c => c.status === 'cancelled').length || 0
      const successRate = totalCustomers > 0
        ? (completedCount / totalCustomers) * 100
        : 0

      // Status distribution with new status values
      const statusCounts: Record<CustomerStatus, number> = {
        prospect: 0,
        in_progress: 0,
        completed: 0,
        callback: 0,
        absent: 0,
        cancelled: 0,
      }
      customers?.forEach(c => {
        if (c.status in statusCounts) {
          statusCounts[c.status as CustomerStatus]++
        }
      })
      const statusDistribution = Object.entries(statusCounts)
        .filter(([, value]) => value > 0)
        .map(([status, value]) => ({
          name: CUSTOMER_STATUS_LABELS[status as CustomerStatus] || status,
          value,
          status: status as CustomerStatus,
        }))

      // Daily trend
      const dailyCounts: Record<string, number> = {}
      customers?.forEach(c => {
        const date = format(new Date(c.created_at), 'yyyy-MM-dd')
        dailyCounts[date] = (dailyCounts[date] || 0) + 1
      })
      const dailyTrend = Object.entries(dailyCounts)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))

      // Assignee stats
      const assigneeCounts: Record<string, { name: string; total: number; completed: number }> = {}
      customers?.forEach(c => {
        const userName = c.users?.name || '미배정'
        if (!assigneeCounts[userName]) {
          assigneeCounts[userName] = { name: userName, total: 0, completed: 0 }
        }
        assigneeCounts[userName].total++
        if (c.status === 'completed') {
          assigneeCounts[userName].completed++
        }
      })
      const assigneeStats = Object.values(assigneeCounts)
        .sort((a, b) => b.total - a.total)

      setStats({
        totalCustomers,
        prospectCustomers,
        inProgressCount,
        completedCount,
        callbackCount,
        absentCount,
        cancelledCount,
        successRate,
        statusDistribution,
        dailyTrend,
        assigneeStats,
      })

      // 새 위젯용 데이터 병렬 fetch
      const [callbackRes, staleRes, incompleteRes, timelineRes, performanceRes, goalRes] = await Promise.allSettled([
        fetch('/api/dashboard/callbacks').then(r => r.json()),
        fetch('/api/dashboard/stale').then(r => r.json()),
        fetch('/api/dashboard/incomplete').then(r => r.json()),
        fetch('/api/dashboard/timeline').then(r => r.json()),
        fetch(`/api/dashboard/performance?${params}`).then(r => r.json()),
        fetch('/api/dashboard/goal').then(r => r.json()),
      ])

      // 결과 처리
      if (callbackRes.status === 'fulfilled') {
        const data = callbackRes.value
        setCallbackData({
          callbacks: data.callbacks?.map((c: { id: string; name: string | null; phone: string; status: CustomerStatus; callbackDate: string; assigneeName: string | null }) => ({
            id: c.id,
            title: c.name || c.phone,
            subtitle: c.assigneeName || '미배정',
            timestamp: c.callbackDate,
            status: c.status,
            phone: c.phone,
          })) || [],
          total: data.total || 0,
        })
      }

      if (staleRes.status === 'fulfilled') {
        const data = staleRes.value
        setStaleData({
          staleCustomers: data.staleCustomers?.map((c: { id: string; name: string | null; phone: string; status: CustomerStatus; updatedAt: string; daysSinceUpdate: number; assigneeName: string | null }) => ({
            id: c.id,
            title: c.name || c.phone,
            subtitle: `${c.daysSinceUpdate}일 경과 · ${c.assigneeName || '미배정'}`,
            timestamp: c.updatedAt,
            status: c.status,
            phone: c.phone,
          })) || [],
          total: data.total || 0,
        })
      }

      if (incompleteRes.status === 'fulfilled') {
        const data = incompleteRes.value
        setIncompleteData({
          incompleteCustomers: data.incompleteCustomers?.map((c: { id: string; name: string | null; phone: string; status: CustomerStatus; createdAt: string; missingFields: string[] }) => ({
            id: c.id,
            title: c.name || c.phone,
            subtitle: `미입력: ${c.missingFields.join(', ')}`,
            timestamp: c.createdAt,
            status: c.status,
            phone: c.phone,
          })) || [],
          total: data.total || 0,
        })
      }

      if (timelineRes.status === 'fulfilled') {
        setTimelineData(timelineRes.value)
      }

      if (performanceRes.status === 'fulfilled') {
        setPerformanceData(performanceRes.value)
      }

      if (goalRes.status === 'fulfilled') {
        setGoalData(goalRes.value)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setIsLoading(false)
      setIsFetching(false)
    }
  }, [getDateRange])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const seedSampleData = async () => {
    setIsSeeding(true)
    try {
      const response = await fetch('/api/seed-sample-data', { method: 'POST' })
      const data = await response.json()
      if (data.success) {
        alert(`테스트 데이터 생성 완료: ${data.insertedCount}건`)
        fetchStats() // Refresh dashboard
      } else {
        alert(`오류: ${data.error}`)
      }
    } catch (error) {
      console.error('Seed error:', error)
      alert('테스트 데이터 생성 중 오류가 발생했습니다')
    } finally {
      setIsSeeding(false)
    }
  }

  const handleLayoutChange = (newLayout: Layout) => {
    if (!isEditMode) return

    const updatedWidgets = widgets.map(widget => {
      const layoutItem = newLayout.find(l => l.i === widget.id)
      if (layoutItem) {
        return {
          ...widget,
          x: layoutItem.x,
          y: layoutItem.y,
          w: layoutItem.w,
          h: layoutItem.h,
        }
      }
      return widget
    })
    setWidgets(updatedWidgets)
  }

  const layout: Layout = widgets.map(widget => ({
    i: widget.id,
    x: widget.x,
    y: widget.y,
    w: widget.w,
    h: widget.h,
    minW: 1,
    minH: 1,
    resizeHandles: ['s', 'w', 'e', 'n', 'se', 'sw', 'ne', 'nw'],
  }))

  // Grid configuration constants
  const GRID_COLS = 12
  const GRID_MARGIN = 8
  const ROW_HEIGHT = 60

  // Get widget dimensions and grid size for responsive sizing
  const getWidgetDimensions = (widget: WidgetConfig) => {
    // Calculate total margin space: (cols - 1) * margin
    const totalMarginWidth = (GRID_COLS - 1) * GRID_MARGIN
    const colWidth = (containerWidth - totalMarginWidth) / GRID_COLS
    return {
      width: widget.w * colWidth + (widget.w - 1) * GRID_MARGIN,
      height: widget.h * ROW_HEIGHT + (widget.h - 1) * GRID_MARGIN,
      gridSize: { w: widget.w, h: widget.h },
    }
  }

  const handleWidgetDoubleClick = (widget: WidgetConfig) => {
    setCustomizingWidget(widget)
  }

  // 고객 클릭 핸들러 (대시보드 위젯에서 고객 클릭 시 모달 열기)
  const handleCustomerClick = useCallback((customerId: string) => {
    setSelectedCustomerId(customerId)
    setIsCustomerModalOpen(true)
  }, [])

  const getCustomWidgetValue = (widget: typeof widgets[0]) => {
    const formula = widget.config.formula
    if (!formula) return 0

    const dataSource = formula.dataSource as string
    switch (dataSource) {
      case 'all':
        return stats?.totalCustomers || 0
      case 'prospect':
        return stats?.prospectCustomers || 0
      case 'in_progress':
        return stats?.inProgressCount || 0
      case 'completed':
        return stats?.completedCount || 0
      default:
        // For other statuses, try to find in statusDistribution
        const statusData = stats?.statusDistribution.find(
          s => s.status === dataSource
        )
        return statusData?.value || 0
    }
  }

  const renderWidget = (widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId)
    if (!widget) return null

    const { width, height, gridSize } = getWidgetDimensions(widget)
    const dimensions = { width, height }

    // Common customization props from widget.config
    const iconColor = widget.config.iconColor as string | undefined
    const valueColor = widget.config.valueColor as string | undefined
    const chartColors = widget.config.colors as string[] | undefined
    const colorRules = widget.config.colorRules
    const customIcon = (widget.config.icon as 'users' | 'userPlus' | 'percent' | 'checkCircle' | 'clock' | 'phone' | 'userMinus' | 'xCircle') || undefined
    const customChartType = widget.config.chartType || undefined
    const styleOverrides = widget.config.styleOverrides

    // Handle built-in widgets - now with customization support
    switch (widget.id) {
      case 'total-customers':
        return (
          <StatWidget
            title={widget.title}
            value={stats?.totalCustomers || 0}
            icon={customIcon || 'users'}
            isLoading={isLoading}
            dimensions={dimensions}
            gridSize={gridSize}
            iconColor={iconColor}
            valueColor={valueColor}
            colorRules={colorRules}
            styleOverrides={styleOverrides}
          />
        )
      case 'new-customers':
        return (
          <StatWidget
            title={widget.title}
            value={stats?.prospectCustomers || 0}
            icon={customIcon || 'userPlus'}
            isLoading={isLoading}
            dimensions={dimensions}
            gridSize={gridSize}
            iconColor={iconColor}
            valueColor={valueColor}
            colorRules={colorRules}
            styleOverrides={styleOverrides}
          />
        )
      case 'approved-rate':
        return (
          <StatWidget
            title={widget.title}
            value={stats?.successRate || 0}
            icon={customIcon || 'percent'}
            isPercentage
            isLoading={isLoading}
            dimensions={dimensions}
            gridSize={gridSize}
            iconColor={iconColor}
            valueColor={valueColor}
            colorRules={colorRules}
            styleOverrides={styleOverrides}
          />
        )
      case 'completed-count':
        return (
          <StatWidget
            title={widget.title}
            value={stats?.completedCount || 0}
            icon={customIcon || 'checkCircle'}
            isLoading={isLoading}
            dimensions={dimensions}
            gridSize={gridSize}
            iconColor={iconColor}
            valueColor={valueColor}
            colorRules={colorRules}
            styleOverrides={styleOverrides}
          />
        )
      case 'status-distribution':
        return (
          <ChartWidget
            title={widget.title}
            data={stats?.statusDistribution || []}
            chartType={customChartType || 'pie'}
            isLoading={isLoading}
            dimensions={dimensions}
            gridSize={gridSize}
            colors={chartColors}
            styleOverrides={styleOverrides}
          />
        )
      case 'daily-trend':
        return (
          <ChartWidget
            title={widget.title}
            data={stats?.dailyTrend || []}
            chartType={customChartType || 'line'}
            isLoading={isLoading}
            dimensions={dimensions}
            gridSize={gridSize}
            colors={chartColors}
            styleOverrides={styleOverrides}
          />
        )
      case 'assignee-stats':
        return (
          <ChartWidget
            title={widget.title}
            data={stats?.assigneeStats?.map(a => ({
              name: a.name,
              value: a.total,
              completed: a.completed,
            })) || []}
            chartType={customChartType || 'bar'}
            isLoading={isLoading}
            dimensions={dimensions}
            gridSize={gridSize}
            colors={chartColors}
            styleOverrides={styleOverrides}
          />
        )
      case 'in-progress':
        return (
          <StatWidget
            title={widget.title}
            value={stats?.inProgressCount || 0}
            icon={customIcon || 'clock'}
            isLoading={isLoading}
            dimensions={dimensions}
            gridSize={gridSize}
            iconColor={iconColor}
            valueColor={valueColor}
            colorRules={colorRules}
            styleOverrides={styleOverrides}
          />
        )
    }

    // Handle statusCount widgets
    if (widget.type === 'statusCount') {
      const status = widget.config.status as CustomerStatus
      let count = 0

      if (status && stats) {
        switch (status) {
          case 'prospect': count = stats.prospectCustomers; break
          case 'in_progress': count = stats.inProgressCount; break
          case 'completed': count = stats.completedCount; break
          case 'callback': count = stats.callbackCount; break
          case 'absent': count = stats.absentCount; break
          case 'cancelled': count = stats.cancelledCount; break
        }
      }

      return (
        <StatusCountWidget
          status={status || 'prospect'}
          count={count}
          isLoading={isLoading}
          gridSize={gridSize}
          dimensions={dimensions}
        />
      )
    }

    // Handle list widgets
    if (widget.type === 'list') {
      const listType = widget.config.listType
      let items: ListItem[] = []
      let emptyMessage = '데이터가 없습니다'
      let listIcon: 'phone' | 'clock' | 'alertCircle' | 'user' = 'user'
      let viewAllLink: string | undefined

      switch (listType) {
        case 'callback':
          items = callbackData?.callbacks || []
          emptyMessage = '오늘 재통화 예정이 없습니다'
          listIcon = 'phone'
          viewAllLink = '/customers?status=callback'
          break
        case 'stale':
          items = staleData?.staleCustomers || []
          emptyMessage = '정체 건이 없습니다'
          listIcon = 'clock'
          viewAllLink = '/customers?status=in_progress'
          break
        case 'new_incomplete':
          items = incompleteData?.incompleteCustomers || []
          emptyMessage = '미입력 건이 없습니다'
          listIcon = 'alertCircle'
          viewAllLink = '/customers?status=prospect'
          break
      }

      return (
        <ListWidget
          title={widget.title}
          items={items}
          maxItems={widget.config.maxItems || 5}
          emptyMessage={emptyMessage}
          icon={listIcon}
          isLoading={isLoading}
          gridSize={gridSize}
          dimensions={dimensions}
          viewAllLink={viewAllLink}
          onItemClick={(item) => handleCustomerClick(item.id)}
        />
      )
    }

    // Handle gauge widgets
    if (widget.type === 'gauge') {
      return (
        <GoalGaugeWidget
          title={widget.title}
          currentValue={goalData?.current || 0}
          goalValue={widget.config.goalValue || goalData?.goal || 0}
          goalType={widget.config.goalType || 'previous_month'}
          unit="건"
          isLoading={isLoading}
          gridSize={gridSize}
          dimensions={dimensions}
        />
      )
    }

    // Handle timeline widgets
    if (widget.type === 'timeline') {
      return (
        <TimelineWidget
          title={widget.title}
          items={timelineData?.activities || []}
          maxItems={widget.config.maxItems || 10}
          isLoading={isLoading}
          gridSize={gridSize}
          dimensions={dimensions}
          autoRefresh={widget.config.autoRefresh}
          refreshInterval={widget.config.refreshInterval}
          onRefresh={fetchStats}
          onItemClick={(item) => handleCustomerClick(item.customerId)}
        />
      )
    }

    // Handle table widgets
    if (widget.type === 'table') {
      return (
        <PerformanceTableWidget
          title={widget.title}
          data={performanceData?.performance || []}
          sortBy={(widget.config.sortBy as 'completedCount' | 'successRate' | 'totalCount') || 'completedCount'}
          showTeam={widget.config.tableType === 'team'}
          isLoading={isLoading}
          gridSize={gridSize}
          dimensions={dimensions}
          groupBy={widget.config.tableType || 'assignee'}
        />
      )
    }

    // ===== IoT Admin Panel 위젯 타입 =====

    // Handle account widgets
    if (widget.type === 'account') {
      return (
        <AccountInfoWidget
          userName={user?.name || 'Admin'}
          userEmail={user?.email || ''}
          userRole={role?.name || '관리자'}
          totalCustomers={stats?.totalCustomers || 0}
          completedCount={stats?.completedCount || 0}
          isLoading={isLoading}
          dimensions={dimensions}
          gridSize={gridSize}
        />
      )
    }

    // Handle libraryQuota widgets
    if (widget.type === 'libraryQuota') {
      const metric = widget.config.metric as string
      let allCount = 0
      let publicCount = 0
      let privateCount = 0
      let quotaValue: number | undefined

      if (stats) {
        switch (metric) {
          case 'totalCustomers':
            allCount = stats.totalCustomers
            publicCount = stats.completedCount
            privateCount = stats.totalCustomers - stats.completedCount
            quotaValue = stats.totalCustomers
            break
          case 'prospectCustomers':
            allCount = stats.prospectCustomers
            publicCount = Math.round(stats.prospectCustomers * 0.3)
            privateCount = stats.prospectCustomers - publicCount
            quotaValue = stats.prospectCustomers
            break
          case 'inProgressCount':
            allCount = stats.inProgressCount
            publicCount = Math.round(stats.inProgressCount * 0.5)
            privateCount = stats.inProgressCount - publicCount
            break
          default:
            allCount = stats.totalCustomers
        }
      }

      return (
        <LibraryQuotaWidget
          title={widget.title}
          quotaValue={quotaValue}
          allCount={allCount}
          publicCount={publicCount}
          privateCount={privateCount}
          isLoading={isLoading}
          dimensions={dimensions}
          gridSize={gridSize}
        />
      )
    }

    // Handle successRate widgets
    if (widget.type === 'successRate') {
      const trendData = stats?.dailyTrend?.map(d => ({ value: d.count })) || []
      return (
        <SuccessRateWidget
          title={widget.title}
          rate={stats?.successRate || 0}
          trendData={trendData}
          isLoading={isLoading}
          dimensions={dimensions}
          gridSize={gridSize}
        />
      )
    }

    // Handle donutStats widgets
    if (widget.type === 'donutStats') {
      const enabledCount = stats?.completedCount || 0
      const disabledCount = (stats?.totalCustomers || 0) - enabledCount
      return (
        <DonutStatsWidget
          title={widget.title}
          enabledCount={enabledCount}
          disabledCount={disabledCount}
          totalLabel="총 고객"
          totalValue={stats?.totalCustomers || 0}
          secondaryLabel="진행중"
          secondaryValue={stats?.inProgressCount || 0}
          isLoading={isLoading}
          dimensions={dimensions}
          gridSize={gridSize}
        />
      )
    }

    // Handle categoryStats widgets
    if (widget.type === 'categoryStats') {
      const categoryData = stats?.statusDistribution?.map((item, index) => ({
        name: item.name,
        total: item.value,
        proportion: stats.totalCustomers > 0 ? (item.value / stats.totalCustomers) * 100 : 0,
        color: ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6'][index % 6],
      })) || []

      return (
        <CategoryStatsTable
          title={widget.title}
          data={categoryData}
          isLoading={isLoading}
          dimensions={dimensions}
          gridSize={gridSize}
        />
      )
    }

    // Handle dataTraffic widgets
    if (widget.type === 'dataTraffic') {
      const uploadValue = stats?.dailyTrend?.reduce((sum, d) => sum + d.count, 0) || 0
      const downloadValue = stats?.completedCount || 0
      const totalValue = uploadValue + downloadValue

      return (
        <DataTrafficWidget
          title={widget.title}
          uploadValue={uploadValue}
          downloadValue={downloadValue}
          totalValue={totalValue}
          unit="건"
          isLoading={isLoading}
          dimensions={dimensions}
          gridSize={gridSize}
        />
      )
    }

    // Handle circularQuota widgets
    if (widget.type === 'circularQuota') {
      const targetMetric = widget.config.targetMetric as string
      let quota = 100
      let used = 0

      if (stats) {
        const total = stats.totalCustomers || 1
        switch (targetMetric) {
          case 'prospect':
            quota = total
            used = stats.prospectCustomers
            break
          case 'in_progress':
            quota = total
            used = stats.inProgressCount
            break
          case 'completed':
            quota = total
            used = stats.completedCount
            break
          case 'callback':
            quota = total
            used = stats.callbackCount
            break
          case 'absent':
            quota = total
            used = stats.absentCount
            break
          case 'cancelled':
            quota = total
            used = stats.cancelledCount
            break
          default:
            quota = total
            used = Math.round(total * 0.25)
        }
      }

      return (
        <CircularQuotaWidget
          title={widget.title}
          quota={quota}
          used={used}
          isLoading={isLoading}
          dimensions={dimensions}
          gridSize={gridSize}
        />
      )
    }

    // ===== 새로운 다양한 스타일 위젯 =====

    // Handle gradientGauge widgets
    if (widget.type === 'gradientGauge') {
      const value = goalData?.current || stats?.completedCount || 0
      const maxValue = goalData?.goal || stats?.totalCustomers || 100
      return (
        <GradientGaugeWidget
          title={widget.title}
          value={value}
          maxValue={maxValue}
          label={widget.config.label as string | undefined}
          gradientFrom={widget.config.gradientFrom as string | undefined}
          gradientTo={widget.config.gradientTo as string | undefined}
          isLoading={isLoading}
          dimensions={dimensions}
          gridSize={gridSize}
        />
      )
    }

    // Handle activityRings widgets
    if (widget.type === 'activityRings') {
      const rings = [
        {
          label: '가망',
          value: stats?.prospectCustomers || 0,
          maxValue: stats?.totalCustomers || 100,
          color: '#EF4444',
        },
        {
          label: '진행',
          value: stats?.inProgressCount || 0,
          maxValue: stats?.totalCustomers || 100,
          color: '#10B981',
        },
        {
          label: '완료',
          value: stats?.completedCount || 0,
          maxValue: stats?.totalCustomers || 100,
          color: '#3B82F6',
        },
      ]
      return (
        <ActivityRingsWidget
          title={widget.title}
          rings={rings}
          isLoading={isLoading}
          dimensions={dimensions}
          gridSize={gridSize}
        />
      )
    }

    // Handle trendStat widgets
    if (widget.type === 'trendStat') {
      const trendData = stats?.dailyTrend?.map(d => ({ value: d.count })) || []
      const trend = goalData?.trend === 'up' ? 6.5 : goalData?.trend === 'down' ? -3.2 : 0
      return (
        <TrendStatWidget
          title={widget.title}
          value={stats?.successRate?.toFixed(1) || '0'}
          unit="%"
          trend={trend}
          trendLabel="vs 지난달"
          sparklineData={trendData}
          isLoading={isLoading}
          dimensions={dimensions}
          gridSize={gridSize}
        />
      )
    }

    // Handle horizontalBar widgets
    if (widget.type === 'horizontalBar') {
      const barData = stats?.assigneeStats?.slice(0, 6).map(a => ({
        label: a.name,
        value: a.total,
        maxValue: stats?.totalCustomers,
      })) || []
      return (
        <HorizontalBarWidget
          title={widget.title}
          data={barData}
          unit="건"
          showPercentage={true}
          isLoading={isLoading}
          dimensions={dimensions}
          gridSize={gridSize}
        />
      )
    }

    // Handle multiRingDonut widgets
    if (widget.type === 'multiRingDonut') {
      const rings = [
        {
          label: '완료',
          value: stats?.completedCount || 0,
          total: stats?.totalCustomers || 100,
          color: '#10B981',
        },
        {
          label: '진행',
          value: stats?.inProgressCount || 0,
          total: stats?.totalCustomers || 100,
          color: '#3B82F6',
        },
        {
          label: '가망',
          value: stats?.prospectCustomers || 0,
          total: stats?.totalCustomers || 100,
          color: '#F59E0B',
        },
      ]
      return (
        <MultiRingDonutWidget
          title={widget.title}
          rings={rings}
          centerValue={stats?.totalCustomers || 0}
          centerLabel="총 고객"
          isLoading={isLoading}
          dimensions={dimensions}
          gridSize={gridSize}
        />
      )
    }

    // Handle taskProgress widgets
    if (widget.type === 'taskProgress') {
      const tasks = [
        { label: '신규 고객 연락', completed: true },
        { label: '가망 고객 팔로업', completed: true },
        { label: '콜백 처리', completed: (stats?.callbackCount || 0) === 0 },
        { label: '부재 재시도', completed: (stats?.absentCount || 0) === 0 },
        { label: '일일 보고서 작성', completed: false },
        { label: '주간 목표 검토', completed: false },
      ]
      return (
        <TaskProgressWidget
          title={widget.title}
          tasks={tasks}
          isLoading={isLoading}
          dimensions={dimensions}
          gridSize={gridSize}
        />
      )
    }

    // ===== 기존 위젯 타입 =====

    // Handle custom/preset widgets
    if (widget.type === 'chart') {
      const chartType = customChartType || 'pie'
      let chartData: Array<Record<string, unknown>> = []

      // Determine chart data based on metric/formula
      if (chartType === 'pie' || chartType === 'donut') {
        chartData = stats?.statusDistribution || []
      } else if (chartType === 'line' || chartType === 'area') {
        chartData = stats?.dailyTrend || []
      } else if (chartType === 'bar' || chartType === 'stacked-bar') {
        chartData = stats?.assigneeStats?.map(a => ({
          name: a.name,
          value: a.total,
          completed: a.completed,
        })) || []
      }

      return (
        <ChartWidget
          title={widget.title}
          data={chartData}
          chartType={chartType}
          isLoading={isLoading}
          dimensions={dimensions}
          gridSize={gridSize}
          colors={chartColors}
          styleOverrides={styleOverrides}
        />
      )
    }

    // Handle stat widgets (custom)
    const value = widget.config.viewType === 'percent'
      ? stats?.successRate || 0
      : getCustomWidgetValue(widget)

    return (
      <StatWidget
        title={widget.title}
        value={value}
        icon={customIcon || 'users'}
        isPercentage={widget.config.isPercentage || widget.config.viewType === 'percent'}
        isLoading={isLoading}
        dimensions={dimensions}
        gridSize={gridSize}
        iconColor={iconColor}
        valueColor={valueColor}
        styleOverrides={styleOverrides}
        colorRules={colorRules}
      />
    )
  }

  return (
    <div className="space-y-4 min-h-screen bg-slate-50 dark:bg-gray-900 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">대시보드</h1>
        <div className="flex items-center gap-2">
          <PeriodFilter />
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
          <Button
            variant={isEditMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {isEditMode ? '편집 완료' : '위젯 편집'}
          </Button>
          {isEditMode && (
            <>
              {/* Widget Add Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    위젯 추가
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {(['status-count', 'ratio', 'distribution', 'trend'] as FormulaCategory[]).map((category) => (
                    <DropdownMenuSub key={category}>
                      <DropdownMenuSubTrigger>
                        {FORMULA_CATEGORY_LABELS[category]}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-48">
                        {PRESET_FORMULAS.filter(p => p.category === category).map((preset) => {
                          const isRegistered = widgets.some(w => w.id.startsWith(preset.id))
                          return (
                            <DropdownMenuItem
                              key={preset.id}
                              disabled={isRegistered}
                              onClick={() => {
                                if (!isRegistered) {
                                  const maxY = Math.max(...widgets.map(w => w.y + w.h), 0)
                                  const isChart = isChartViewType(preset.viewType)
                                  const chartType = getChartType(preset.viewType) || undefined

                                  const newWidget: WidgetConfig = {
                                    id: `${preset.id}-${Date.now()}`,
                                    type: isChart ? 'chart' : 'stat',
                                    title: preset.name,
                                    x: 0,
                                    y: maxY,
                                    w: isChart ? 6 : 3,
                                    h: isChart ? 4 : 2,
                                    config: {
                                      metric: preset.id,
                                      formula: preset.formula,
                                      viewType: preset.viewType,
                                      icon: getWidgetIcon(preset.formula.dataSource),
                                      chartType: chartType,
                                      isPercentage: preset.viewType === 'percent',
                                    },
                                  }
                                  addWidget(newWidget)
                                }
                              }}
                            >
                              <span className={isRegistered ? 'text-muted-foreground' : ''}>
                                {preset.name}
                                {isRegistered && ' (등록됨)'}
                              </span>
                            </DropdownMenuItem>
                          )
                        })}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    전체 보기...
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Overflow Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="px-2">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsPresetSaveOpen(true)}>
                    <Save className="h-4 w-4 mr-2" />
                    레이아웃 저장
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsPresetLoadOpen(true)}>
                    <FolderOpen className="h-4 w-4 mr-2" />
                    레이아웃 불러오기
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={seedSampleData} disabled={isSeeding}>
                    <Database className={`h-4 w-4 mr-2 ${isSeeding ? 'animate-pulse' : ''}`} />
                    {isSeeding ? '생성 중...' : '테스트 데이터 생성'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={resetWidgets}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    초기화
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>


      {/* Grid Layout */}
      <div ref={containerRef}>
        <GridLayout
          className="layout"
          layout={layout}
          width={containerWidth}
          gridConfig={{
            cols: 12,
            rowHeight: 60,
            margin: [8, 8],
            containerPadding: [0, 0],
            maxRows: Infinity,
          }}
          dragConfig={{
            enabled: isEditMode,
            handle: '.widget-handle',
          }}
          resizeConfig={{
            enabled: isEditMode,
          }}
          compactor={verticalCompactor}
          onLayoutChange={handleLayoutChange}
        >
          {widgets.map(widget => (
            <div
              key={widget.id}
              className={`relative bg-card border rounded-xl shadow-sm overflow-hidden group transition-all duration-200 ${
                isEditMode ? 'widget-edit-mode' : ''
              }`}
              onDoubleClick={() => isEditMode && handleWidgetDoubleClick(widget)}
            >
              {/* Widget content - full height */}
              <div className={`h-full ${isEditMode ? 'widget-handle' : ''}`}>
                {renderWidget(widget.id)}
              </div>
              {/* Edit mode overlay - positioned absolutely */}
              {isEditMode && (
                <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="flex items-center justify-between px-2 py-1 pointer-events-auto">
                    <div className="flex items-center gap-1 text-white/90 text-[10px] font-medium">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                      </svg>
                      <span className="drop-shadow-sm">이동</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeWidget(widget.id)
                      }}
                      className="p-0.5 bg-red-500/80 hover:bg-red-600 text-white rounded transition-colors"
                      title="위젯 삭제"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </GridLayout>
      </div>

      {/* Add Widget Modal */}
      <AddWidgetModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Widget Customization Modal */}
      <WidgetCustomizationModal
        widget={customizingWidget}
        open={!!customizingWidget}
        onClose={() => setCustomizingWidget(null)}
        onSave={(updates) => {
          if (customizingWidget) {
            updateWidget(customizingWidget.id, updates)
          }
          setCustomizingWidget(null)
        }}
      />

      {/* Preset Manager (controlled mode) */}
      <PresetManager
        mode="controlled"
        saveDialogOpen={isPresetSaveOpen}
        onSaveDialogOpenChange={setIsPresetSaveOpen}
        loadDialogOpen={isPresetLoadOpen}
        onLoadDialogOpenChange={setIsPresetLoadOpen}
      />

      {/* Customer Detail Modal */}
      <CustomerModal
        customerId={selectedCustomerId}
        open={isCustomerModalOpen}
        onClose={() => {
          setIsCustomerModalOpen(false)
          setSelectedCustomerId(null)
        }}
        onNavigateToCustomer={(customerId) => {
          setSelectedCustomerId(customerId)
        }}
      />
    </div>
  )
}
