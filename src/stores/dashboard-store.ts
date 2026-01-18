import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ConditionalColorRule } from '@/lib/widget-colors'
import type { WidgetSizePreset } from '@/components/dashboard/size-selector'
import type { WidgetSizeTier } from '@/lib/widget-design-system'
import type { CustomerStatus } from '@/types/database'

export type TitleSizeOption = 'xs' | 'sm' | 'base' | 'lg' | 'auto'
export type ValueSizeOption = 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'auto'
export type IconSizeOption = 'sm' | 'md' | 'lg' | 'xl' | 'auto'
export type SpacingOption = 'compact' | 'normal' | 'spacious'

export interface StyleOverrides {
  titleSize?: TitleSizeOption
  valueSize?: ValueSizeOption
  iconSize?: IconSizeOption
  spacing?: SpacingOption
}

// 위젯 타입 정의
export type WidgetType =
  | 'stat'
  | 'chart'
  | 'list'
  | 'gauge'
  | 'timeline'
  | 'table'
  | 'statusCount'
  // IoT Admin Panel 위젯 타입
  | 'account'
  | 'libraryQuota'
  | 'successRate'
  | 'donutStats'
  | 'categoryStats'
  | 'dataTraffic'
  | 'circularQuota'
  // 새로운 다양한 스타일 위젯
  | 'gradientGauge'
  | 'activityRings'
  | 'trendStat'
  | 'horizontalBar'
  | 'multiRingDonut'
  | 'taskProgress'

// 리스트 위젯 타입
export type ListWidgetType = 'callback' | 'stale' | 'new_incomplete'

// 테이블 위젯 그룹화 타입
export type TableGroupBy = 'assignee' | 'team'

// 목표 타입
export type GoalType = 'manual' | 'previous_month'

export interface WidgetConfig {
  id: string
  type: WidgetType
  title: string
  x: number
  y: number
  w: number
  h: number
  sizePreset?: WidgetSizePreset
  sizeTier?: WidgetSizeTier
  config: {
    metric?: string
    icon?: string
    isPercentage?: boolean
    chartType?: 'pie' | 'bar' | 'line' | 'area' | 'donut' | 'stacked-bar'
    viewType?: string
    formula?: {
      type: string
      dataSource: string
      field?: string
      condition?: {
        field: string
        operator: string
        value: string | number
      }
      compareWith?: string
    }
    colorRules?: ConditionalColorRule[]
    styleOverrides?: StyleOverrides

    // 리스트 위젯 설정
    listType?: ListWidgetType
    maxItems?: number

    // 게이지 위젯 설정
    goalType?: GoalType
    goalValue?: number
    targetMetric?: string

    // 테이블 위젯 설정
    tableType?: TableGroupBy
    sortBy?: string

    // 타임라인 위젯 설정
    autoRefresh?: boolean
    refreshInterval?: number

    // 상태 카운트 위젯 설정
    status?: CustomerStatus

    // 사용자 필터링 (상담사 프리셋용)
    filterByCurrentUser?: boolean

    [key: string]: unknown
  }
}

export interface DashboardPreset {
  id: string
  name: string
  widgets: WidgetConfig[]
  createdAt: string
}

interface DashboardState {
  widgets: WidgetConfig[]
  presets: DashboardPreset[]
  period: 'today' | 'yesterday' | 'week' | 'month' | 'lastMonth' | 'custom'
  customDateRange: { from: string | null; to: string | null }
  setWidgets: (widgets: WidgetConfig[]) => void
  updateWidget: (id: string, updates: Partial<WidgetConfig>) => void
  addWidget: (widget: WidgetConfig) => void
  removeWidget: (id: string) => void
  setPeriod: (period: DashboardState['period']) => void
  setCustomDateRange: (from: string | null, to: string | null) => void
  resetWidgets: () => void
  saveAsPreset: (name: string) => void
  loadPreset: (id: string) => void
  deletePreset: (id: string) => void
}

// 🎨 위젯 쇼케이스 - 모든 위젯 타입을 한눈에
const defaultWidgets: WidgetConfig[] = [
  // ═══════════════════════════════════════════════════════════
  // 📊 STAT 위젯 (기본 숫자 카드)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'showcase-stat-1',
    type: 'stat',
    title: '[STAT] 총 고객',
    x: 0,
    y: 0,
    w: 3,
    h: 2,
    config: { metric: 'totalCustomers', icon: 'users' },
  },
  {
    id: 'showcase-stat-2',
    type: 'stat',
    title: '[STAT] 가망고객',
    x: 3,
    y: 0,
    w: 3,
    h: 2,
    config: { metric: 'prospectCustomers', icon: 'userPlus' },
  },
  {
    id: 'showcase-stat-3',
    type: 'stat',
    title: '[STAT] 성공률',
    x: 6,
    y: 0,
    w: 3,
    h: 2,
    config: { metric: 'successRate', icon: 'percent', isPercentage: true },
  },
  {
    id: 'showcase-stat-4',
    type: 'stat',
    title: '[STAT] 완료',
    x: 9,
    y: 0,
    w: 3,
    h: 2,
    config: { metric: 'completedCount', icon: 'checkCircle' },
  },

  // ═══════════════════════════════════════════════════════════
  // 📈 CHART 위젯 (차트 타입별)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'showcase-chart-pie',
    type: 'chart',
    title: '[CHART] 파이',
    x: 0,
    y: 2,
    w: 3,
    h: 4,
    config: { chartType: 'pie' },
  },
  {
    id: 'showcase-chart-donut',
    type: 'chart',
    title: '[CHART] 도넛',
    x: 3,
    y: 2,
    w: 3,
    h: 4,
    config: { chartType: 'donut' },
  },
  {
    id: 'showcase-chart-bar',
    type: 'chart',
    title: '[CHART] 바',
    x: 6,
    y: 2,
    w: 3,
    h: 4,
    config: { chartType: 'bar' },
  },
  {
    id: 'showcase-chart-line',
    type: 'chart',
    title: '[CHART] 라인',
    x: 9,
    y: 2,
    w: 3,
    h: 4,
    config: { chartType: 'line' },
  },

  // ═══════════════════════════════════════════════════════════
  // 📋 LIST 위젯 (리스트 타입별)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'showcase-list-callback',
    type: 'list',
    title: '[LIST] 재통화',
    x: 0,
    y: 6,
    w: 4,
    h: 4,
    config: { listType: 'callback', maxItems: 5 },
  },
  {
    id: 'showcase-list-stale',
    type: 'list',
    title: '[LIST] 정체건',
    x: 4,
    y: 6,
    w: 4,
    h: 4,
    config: { listType: 'stale', maxItems: 5 },
  },
  {
    id: 'showcase-list-incomplete',
    type: 'list',
    title: '[LIST] 미입력',
    x: 8,
    y: 6,
    w: 4,
    h: 4,
    config: { listType: 'new_incomplete', maxItems: 5 },
  },

  // ═══════════════════════════════════════════════════════════
  // 🎯 GAUGE / TIMELINE / TABLE 위젯
  // ═══════════════════════════════════════════════════════════
  {
    id: 'showcase-gauge',
    type: 'gauge',
    title: '[GAUGE] 목표달성',
    x: 0,
    y: 10,
    w: 3,
    h: 4,
    config: { goalType: 'previous_month' },
  },
  {
    id: 'showcase-timeline',
    type: 'timeline',
    title: '[TIMELINE] 활동',
    x: 3,
    y: 10,
    w: 4,
    h: 4,
    config: { maxItems: 8 },
  },
  {
    id: 'showcase-table',
    type: 'table',
    title: '[TABLE] 실적표',
    x: 7,
    y: 10,
    w: 5,
    h: 4,
    config: { tableType: 'assignee', sortBy: 'completedCount' },
  },

  // ═══════════════════════════════════════════════════════════
  // 🏷️ STATUS COUNT 위젯 (상태별)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'showcase-status-prospect',
    type: 'statusCount',
    title: '[STATUS] 가망',
    x: 0,
    y: 14,
    w: 2,
    h: 2,
    config: { status: 'prospect' },
  },
  {
    id: 'showcase-status-inprogress',
    type: 'statusCount',
    title: '[STATUS] 진행',
    x: 2,
    y: 14,
    w: 2,
    h: 2,
    config: { status: 'in_progress' },
  },
  {
    id: 'showcase-status-completed',
    type: 'statusCount',
    title: '[STATUS] 완료',
    x: 4,
    y: 14,
    w: 2,
    h: 2,
    config: { status: 'completed' },
  },
  {
    id: 'showcase-status-callback',
    type: 'statusCount',
    title: '[STATUS] 재통화',
    x: 6,
    y: 14,
    w: 2,
    h: 2,
    config: { status: 'callback' },
  },
  {
    id: 'showcase-status-absent',
    type: 'statusCount',
    title: '[STATUS] 부재',
    x: 8,
    y: 14,
    w: 2,
    h: 2,
    config: { status: 'absent' },
  },
  {
    id: 'showcase-status-cancelled',
    type: 'statusCount',
    title: '[STATUS] 취소',
    x: 10,
    y: 14,
    w: 2,
    h: 2,
    config: { status: 'cancelled' },
  },

  // ═══════════════════════════════════════════════════════════
  // 🔷 IoT 스타일 위젯
  // ═══════════════════════════════════════════════════════════
  {
    id: 'showcase-account',
    type: 'account',
    title: '[ACCOUNT] 계정정보',
    x: 0,
    y: 16,
    w: 12,
    h: 2,
    config: {},
  },
  {
    id: 'showcase-libraryQuota-1',
    type: 'libraryQuota',
    title: '[LIBRARY] 총고객',
    x: 0,
    y: 18,
    w: 3,
    h: 2,
    config: { metric: 'totalCustomers' },
  },
  {
    id: 'showcase-libraryQuota-2',
    type: 'libraryQuota',
    title: '[LIBRARY] 가망',
    x: 3,
    y: 18,
    w: 3,
    h: 2,
    config: { metric: 'prospectCustomers' },
  },
  {
    id: 'showcase-successRate',
    type: 'successRate',
    title: '[SUCCESS] 성공률',
    x: 6,
    y: 18,
    w: 3,
    h: 2,
    config: {},
  },
  {
    id: 'showcase-donutStats',
    type: 'donutStats',
    title: '[DONUT] 상태현황',
    x: 9,
    y: 18,
    w: 3,
    h: 4,
    config: {},
  },
  {
    id: 'showcase-categoryStats',
    type: 'categoryStats',
    title: '[CATEGORY] 담당자별',
    x: 0,
    y: 20,
    w: 4,
    h: 4,
    config: {},
  },
  {
    id: 'showcase-dataTraffic',
    type: 'dataTraffic',
    title: '[TRAFFIC] 일별추이',
    x: 4,
    y: 20,
    w: 3,
    h: 4,
    config: {},
  },

  // ═══════════════════════════════════════════════════════════
  // ⭕ CIRCULAR QUOTA 위젯
  // ═══════════════════════════════════════════════════════════
  {
    id: 'showcase-circular-1',
    type: 'circularQuota',
    title: '[CIRCULAR] 가망',
    x: 7,
    y: 20,
    w: 2,
    h: 3,
    config: { targetMetric: 'prospect' },
  },
  {
    id: 'showcase-circular-2',
    type: 'circularQuota',
    title: '[CIRCULAR] 진행',
    x: 9,
    y: 22,
    w: 2,
    h: 3,
    config: { targetMetric: 'in_progress' },
  },

  // ═══════════════════════════════════════════════════════════
  // ✨ 새로운 스타일 위젯
  // ═══════════════════════════════════════════════════════════
  {
    id: 'showcase-gradientGauge',
    type: 'gradientGauge',
    title: '[GRADIENT] 목표달성',
    x: 0,
    y: 24,
    w: 3,
    h: 3,
    config: {},
  },
  {
    id: 'showcase-activityRings',
    type: 'activityRings',
    title: '[RINGS] 진행현황',
    x: 3,
    y: 24,
    w: 3,
    h: 4,
    config: {},
  },
  {
    id: 'showcase-trendStat',
    type: 'trendStat',
    title: '[TREND] 성공률추이',
    x: 6,
    y: 24,
    w: 3,
    h: 2,
    config: {},
  },
  {
    id: 'showcase-horizontalBar',
    type: 'horizontalBar',
    title: '[HBAR] 담당자실적',
    x: 9,
    y: 24,
    w: 3,
    h: 4,
    config: {},
  },
  {
    id: 'showcase-multiRingDonut',
    type: 'multiRingDonut',
    title: '[MULTI] 상태현황',
    x: 6,
    y: 26,
    w: 3,
    h: 4,
    config: {},
  },
  {
    id: 'showcase-taskProgress',
    type: 'taskProgress',
    title: '[TASK] 오늘할일',
    x: 0,
    y: 27,
    w: 4,
    h: 3,
    config: {},
  },
]

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      widgets: defaultWidgets,
      presets: [],
      period: 'month',
      customDateRange: { from: null, to: null },

      setWidgets: (widgets) => set({ widgets }),

      updateWidget: (id, updates) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        })),

      addWidget: (widget) =>
        set((state) => ({
          widgets: [...state.widgets, widget],
        })),

      removeWidget: (id) =>
        set((state) => ({
          widgets: state.widgets.filter((w) => w.id !== id),
        })),

      setPeriod: (period) => set({ period }),

      setCustomDateRange: (from, to) =>
        set({ customDateRange: { from, to } }),

      resetWidgets: () => set({ widgets: defaultWidgets }),

      saveAsPreset: (name) =>
        set((state) => ({
          presets: [
            ...state.presets,
            {
              id: `preset-${Date.now()}`,
              name,
              widgets: JSON.parse(JSON.stringify(state.widgets)),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      loadPreset: (id) => {
        const preset = get().presets.find((p) => p.id === id)
        if (preset) {
          set({ widgets: JSON.parse(JSON.stringify(preset.widgets)) })
        }
      },

      deletePreset: (id) =>
        set((state) => ({
          presets: state.presets.filter((p) => p.id !== id),
        })),
    }),
    {
      name: 'dashboard-store',
    }
  )
)
