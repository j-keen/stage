// Widget preset definitions with categories and conditional color rules
import type { FormulaConfig, ViewType, DataSource } from './widget-formulas'
import type { ConditionalColorRule } from './widget-colors'

export type PresetCategory = 'status-count' | 'ratio' | 'chart'

export interface WidgetPreset {
  id: string
  name: string
  description: string
  category: PresetCategory
  formula: FormulaConfig
  viewType: ViewType
  defaultSize: { w: number; h: number }
  icon: string
  colorRules?: ConditionalColorRule[]
  chartType?: 'pie' | 'donut' | 'bar' | 'line' | 'area' | 'stacked-bar'
}

export const PRESET_CATEGORIES: Record<PresetCategory, { label: string; description: string }> = {
  'status-count': {
    label: '상태별 건수',
    description: '고객 상태별 건수를 표시합니다',
  },
  ratio: {
    label: '비율',
    description: '특정 조건의 비율을 계산합니다',
  },
  chart: {
    label: '차트',
    description: '데이터를 시각적으로 표시합니다',
  },
}

// Status count presets (7)
const statusCountPresets: WidgetPreset[] = [
  {
    id: 'preset-total-count',
    name: '전체 접수',
    description: '전체 고객 수',
    category: 'status-count',
    formula: { type: 'count', dataSource: 'all' },
    viewType: 'number',
    defaultSize: { w: 3, h: 2 },
    icon: 'users',
  },
  {
    id: 'preset-prospect-count',
    name: '가망고객',
    description: '가망 상태 고객 수',
    category: 'status-count',
    formula: { type: 'count', dataSource: 'prospect' },
    viewType: 'number',
    defaultSize: { w: 3, h: 2 },
    icon: 'userPlus',
  },
  {
    id: 'preset-in-progress-count',
    name: '진행중',
    description: '진행중인 고객 수',
    category: 'status-count',
    formula: { type: 'count', dataSource: 'in_progress' },
    viewType: 'number',
    defaultSize: { w: 3, h: 2 },
    icon: 'clock',
  },
  {
    id: 'preset-completed-count',
    name: '완료',
    description: '완료된 고객 수',
    category: 'status-count',
    formula: { type: 'count', dataSource: 'completed' },
    viewType: 'number',
    defaultSize: { w: 3, h: 2 },
    icon: 'checkCircle',
  },
  {
    id: 'preset-callback-count',
    name: '재통화',
    description: '재통화 예정 고객 수',
    category: 'status-count',
    formula: { type: 'count', dataSource: 'callback' },
    viewType: 'number',
    defaultSize: { w: 3, h: 2 },
    icon: 'phone',
  },
  {
    id: 'preset-absent-count',
    name: '부재',
    description: '부재 상태 고객 수',
    category: 'status-count',
    formula: { type: 'count', dataSource: 'absent' },
    viewType: 'number',
    defaultSize: { w: 3, h: 2 },
    icon: 'userMinus',
  },
  {
    id: 'preset-cancelled-count',
    name: '취소',
    description: '취소된 고객 수',
    category: 'status-count',
    formula: { type: 'count', dataSource: 'cancelled' },
    viewType: 'number',
    defaultSize: { w: 3, h: 2 },
    icon: 'xCircle',
  },
]

// Ratio presets (6)
const ratioPresets: WidgetPreset[] = [
  {
    id: 'preset-success-rate',
    name: '성공률',
    description: '완료/전체 비율',
    category: 'ratio',
    formula: { type: 'ratio', dataSource: 'completed' },
    viewType: 'percent',
    defaultSize: { w: 3, h: 2 },
    icon: 'percent',
    colorRules: [
      { id: 'success-high', field: 'value', operator: 'gte', value: 70, color: '#16A34A', bgColor: '#DCFCE7', label: '높음' },
      { id: 'success-low', field: 'value', operator: 'lt', value: 50, color: '#DC2626', bgColor: '#FEE2E2', label: '낮음' },
    ],
  },
  {
    id: 'preset-completion-rate',
    name: '완료율',
    description: '완료된 건의 비율',
    category: 'ratio',
    formula: { type: 'ratio', dataSource: 'completed' },
    viewType: 'percent',
    defaultSize: { w: 3, h: 2 },
    icon: 'checkCircle',
    colorRules: [
      { id: 'completion-high', field: 'value', operator: 'gte', value: 80, color: '#16A34A', bgColor: '#DCFCE7', label: '우수' },
      { id: 'completion-low', field: 'value', operator: 'lt', value: 60, color: '#DC2626', bgColor: '#FEE2E2', label: '미달' },
    ],
  },
  {
    id: 'preset-absent-rate',
    name: '부재율',
    description: '부재 고객 비율',
    category: 'ratio',
    formula: { type: 'ratio', dataSource: 'absent' },
    viewType: 'percent',
    defaultSize: { w: 3, h: 2 },
    icon: 'userMinus',
    colorRules: [
      { id: 'absent-high', field: 'value', operator: 'gte', value: 30, color: '#DC2626', bgColor: '#FEE2E2', label: '높음' },
      { id: 'absent-low', field: 'value', operator: 'lt', value: 10, color: '#16A34A', bgColor: '#DCFCE7', label: '낮음' },
    ],
  },
  {
    id: 'preset-cancel-rate',
    name: '취소율',
    description: '취소된 건의 비율',
    category: 'ratio',
    formula: { type: 'ratio', dataSource: 'cancelled' },
    viewType: 'percent',
    defaultSize: { w: 3, h: 2 },
    icon: 'xCircle',
    colorRules: [
      { id: 'cancel-high', field: 'value', operator: 'gte', value: 20, color: '#DC2626', bgColor: '#FEE2E2', label: '높음' },
      { id: 'cancel-low', field: 'value', operator: 'lt', value: 5, color: '#16A34A', bgColor: '#DCFCE7', label: '낮음' },
    ],
  },
  {
    id: 'preset-callback-rate',
    name: '재통화율',
    description: '재통화 예정 비율',
    category: 'ratio',
    formula: { type: 'ratio', dataSource: 'callback' },
    viewType: 'percent',
    defaultSize: { w: 3, h: 2 },
    icon: 'phone',
    colorRules: [
      { id: 'callback-high', field: 'value', operator: 'gte', value: 25, color: '#F59E0B', bgColor: '#FEF3C7', label: '많음' },
    ],
  },
  {
    id: 'preset-progress-rate',
    name: '진행률',
    description: '진행중인 건의 비율',
    category: 'ratio',
    formula: { type: 'ratio', dataSource: 'in_progress' },
    viewType: 'percent',
    defaultSize: { w: 3, h: 2 },
    icon: 'clock',
    colorRules: [
      { id: 'progress-high', field: 'value', operator: 'gte', value: 40, color: '#3B82F6', bgColor: '#DBEAFE', label: '활발' },
    ],
  },
]

// Chart presets (8)
const chartPresets: WidgetPreset[] = [
  {
    id: 'preset-status-pie',
    name: '상태 분포 (파이)',
    description: '상태별 고객 분포를 파이 차트로 표시',
    category: 'chart',
    formula: { type: 'count', dataSource: 'all' },
    viewType: 'pie',
    defaultSize: { w: 6, h: 4 },
    icon: 'pieChart',
    chartType: 'pie',
  },
  {
    id: 'preset-status-donut',
    name: '상태 분포 (도넛)',
    description: '상태별 고객 분포를 도넛 차트로 표시',
    category: 'chart',
    formula: { type: 'count', dataSource: 'all' },
    viewType: 'pie',
    defaultSize: { w: 6, h: 4 },
    icon: 'pieChart',
    chartType: 'donut',
  },
  {
    id: 'preset-status-bar',
    name: '상태 분포 (막대)',
    description: '상태별 고객 분포를 막대 차트로 표시',
    category: 'chart',
    formula: { type: 'count', dataSource: 'all' },
    viewType: 'bar',
    defaultSize: { w: 6, h: 4 },
    icon: 'barChart',
    chartType: 'bar',
  },
  {
    id: 'preset-daily-line',
    name: '일별 추이 (라인)',
    description: '일별 접수 건수를 라인 차트로 표시',
    category: 'chart',
    formula: { type: 'count', dataSource: 'all' },
    viewType: 'line',
    defaultSize: { w: 6, h: 4 },
    icon: 'lineChart',
    chartType: 'line',
  },
  {
    id: 'preset-daily-area',
    name: '일별 추이 (영역)',
    description: '일별 접수 건수를 영역 차트로 표시',
    category: 'chart',
    formula: { type: 'count', dataSource: 'all' },
    viewType: 'line',
    defaultSize: { w: 6, h: 4 },
    icon: 'trendingUp',
    chartType: 'area',
  },
  {
    id: 'preset-assignee-bar',
    name: '담당자별 실적 (막대)',
    description: '담당자별 처리 실적을 막대 차트로 표시',
    category: 'chart',
    formula: { type: 'count', dataSource: 'all' },
    viewType: 'bar',
    defaultSize: { w: 6, h: 4 },
    icon: 'barChart',
    chartType: 'bar',
  },
  {
    id: 'preset-assignee-stacked',
    name: '담당자별 실적 (누적)',
    description: '담당자별 처리 실적을 누적 막대로 표시',
    category: 'chart',
    formula: { type: 'count', dataSource: 'all' },
    viewType: 'bar',
    defaultSize: { w: 6, h: 4 },
    icon: 'barChart',
    chartType: 'stacked-bar',
  },
  {
    id: 'preset-category-pie',
    name: '카테고리별 분포',
    description: '카테고리별 고객 분포를 파이 차트로 표시',
    category: 'chart',
    formula: { type: 'count', dataSource: 'all' },
    viewType: 'pie',
    defaultSize: { w: 6, h: 4 },
    icon: 'pieChart',
    chartType: 'pie',
  },
]

// All presets combined
export const WIDGET_PRESETS: WidgetPreset[] = [
  ...statusCountPresets,
  ...ratioPresets,
  ...chartPresets,
]

// Get presets by category
export function getPresetsByCategory(category: PresetCategory): WidgetPreset[] {
  return WIDGET_PRESETS.filter(p => p.category === category)
}

// Get preset by ID
export function getPresetById(id: string): WidgetPreset | undefined {
  return WIDGET_PRESETS.find(p => p.id === id)
}

// Check if preset is a chart type
export function isChartPreset(preset: WidgetPreset): boolean {
  return preset.category === 'chart'
}
