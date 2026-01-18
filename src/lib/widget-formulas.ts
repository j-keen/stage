// Widget formula types and calculation logic

export type FormulaType = 'count' | 'countIf' | 'sum' | 'avg' | 'ratio' | 'compare'

export type DataSource =
  | 'all'
  | 'prospect'
  | 'in_progress'
  | 'completed'
  | 'callback'
  | 'absent'
  | 'cancelled'

export type ViewType = 'number' | 'percent' | 'trend' | 'pie' | 'bar' | 'line'

export interface FormulaConfig {
  type: FormulaType
  dataSource: DataSource
  field?: string
  condition?: {
    field: string
    operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte'
    value: string | number
  }
  compareWith?: 'previousPeriod' | 'previousMonth' | 'previousYear'
}

export type FormulaCategory = 'status-count' | 'ratio' | 'distribution' | 'trend'

export interface WidgetFormula {
  id: string
  name: string
  description: string
  formula: FormulaConfig
  viewType: ViewType
  category: FormulaCategory
}

export const FORMULA_LABELS: Record<FormulaType, string> = {
  count: '건수',
  countIf: '조건부 건수',
  sum: '합계',
  avg: '평균',
  ratio: '비율',
  compare: '기간 비교',
}

export const DATA_SOURCE_LABELS: Record<DataSource, string> = {
  all: '전체 고객',
  prospect: '가망고객',
  in_progress: '진행중',
  completed: '완료',
  callback: '재통화',
  absent: '부재',
  cancelled: '취소',
}

export const VIEW_TYPE_LABELS: Record<ViewType, string> = {
  number: '숫자',
  percent: '백분율',
  trend: '추이 표시',
  pie: '파이 차트',
  bar: '막대 차트',
  line: '라인 차트',
}

export const VIEW_TYPE_ICONS: Record<ViewType, string> = {
  number: 'hash',
  percent: 'percent',
  trend: 'trendingUp',
  pie: 'pieChart',
  bar: 'barChart',
  line: 'lineChart',
}

export const FORMULA_CATEGORY_LABELS: Record<FormulaCategory, string> = {
  'status-count': '상태별 건수',
  ratio: '비율',
  distribution: '분포',
  trend: '추이',
}

// Preset formulas for quick widget creation
export const PRESET_FORMULAS: WidgetFormula[] = [
  // Status count presets (7)
  {
    id: 'total-count',
    name: '전체 접수',
    description: '전체 고객 수 (count: all)',
    formula: { type: 'count', dataSource: 'all' },
    viewType: 'number',
    category: 'status-count',
  },
  {
    id: 'prospect-count',
    name: '가망고객',
    description: '가망 상태 고객 수 (count: prospect)',
    formula: { type: 'count', dataSource: 'prospect' },
    viewType: 'number',
    category: 'status-count',
  },
  {
    id: 'in-progress-count',
    name: '진행중',
    description: '진행중인 고객 수 (count: in_progress)',
    formula: { type: 'count', dataSource: 'in_progress' },
    viewType: 'number',
    category: 'status-count',
  },
  {
    id: 'completed-count',
    name: '완료',
    description: '완료된 고객 수 (count: completed)',
    formula: { type: 'count', dataSource: 'completed' },
    viewType: 'number',
    category: 'status-count',
  },
  {
    id: 'callback-count',
    name: '재통화',
    description: '재통화 예정 고객 수 (count: callback)',
    formula: { type: 'count', dataSource: 'callback' },
    viewType: 'number',
    category: 'status-count',
  },
  {
    id: 'absent-count',
    name: '부재',
    description: '부재 상태 고객 수 (count: absent)',
    formula: { type: 'count', dataSource: 'absent' },
    viewType: 'number',
    category: 'status-count',
  },
  {
    id: 'cancelled-count',
    name: '취소',
    description: '취소된 고객 수 (count: cancelled)',
    formula: { type: 'count', dataSource: 'cancelled' },
    viewType: 'number',
    category: 'status-count',
  },
  // Ratio presets (6)
  {
    id: 'success-rate',
    name: '성공률',
    description: '완료/전체 비율 (ratio: completed/all)',
    formula: { type: 'ratio', dataSource: 'completed' },
    viewType: 'percent',
    category: 'ratio',
  },
  {
    id: 'completion-rate',
    name: '완료율',
    description: '완료된 건의 비율 (ratio: completed/all)',
    formula: { type: 'ratio', dataSource: 'completed' },
    viewType: 'percent',
    category: 'ratio',
  },
  {
    id: 'absent-rate',
    name: '부재율',
    description: '부재 고객 비율 (ratio: absent/all)',
    formula: { type: 'ratio', dataSource: 'absent' },
    viewType: 'percent',
    category: 'ratio',
  },
  {
    id: 'cancel-rate',
    name: '취소율',
    description: '취소된 건의 비율 (ratio: cancelled/all)',
    formula: { type: 'ratio', dataSource: 'cancelled' },
    viewType: 'percent',
    category: 'ratio',
  },
  {
    id: 'callback-rate',
    name: '재통화율',
    description: '재통화 예정 비율 (ratio: callback/all)',
    formula: { type: 'ratio', dataSource: 'callback' },
    viewType: 'percent',
    category: 'ratio',
  },
  {
    id: 'progress-rate',
    name: '진행률',
    description: '진행중인 건의 비율 (ratio: in_progress/all)',
    formula: { type: 'ratio', dataSource: 'in_progress' },
    viewType: 'percent',
    category: 'ratio',
  },
  // Distribution presets (4)
  {
    id: 'status-distribution-pie',
    name: '상태 분포 (파이)',
    description: '상태별 고객 분포 (count: by status)',
    formula: { type: 'count', dataSource: 'all' },
    viewType: 'pie',
    category: 'distribution',
  },
  {
    id: 'status-distribution-donut',
    name: '상태 분포 (도넛)',
    description: '상태별 고객 분포 (count: by status)',
    formula: { type: 'count', dataSource: 'all' },
    viewType: 'pie',
    category: 'distribution',
  },
  {
    id: 'status-distribution-bar',
    name: '상태 분포 (막대)',
    description: '상태별 고객 분포 (count: by status)',
    formula: { type: 'count', dataSource: 'all' },
    viewType: 'bar',
    category: 'distribution',
  },
  {
    id: 'assignee-stats',
    name: '담당자별 실적',
    description: '담당자별 처리 현황 (count: by assignee)',
    formula: { type: 'count', dataSource: 'all' },
    viewType: 'bar',
    category: 'distribution',
  },
  // Trend presets (4)
  {
    id: 'daily-trend-line',
    name: '일별 추이 (라인)',
    description: '날짜별 접수 현황 (count: by date)',
    formula: { type: 'count', dataSource: 'all' },
    viewType: 'line',
    category: 'trend',
  },
  {
    id: 'daily-trend-area',
    name: '일별 추이 (영역)',
    description: '날짜별 접수 현황 (count: by date)',
    formula: { type: 'count', dataSource: 'all' },
    viewType: 'line',
    category: 'trend',
  },
  {
    id: 'assignee-stacked',
    name: '담당자별 누적',
    description: '담당자별 처리 현황 (count: by assignee, stacked)',
    formula: { type: 'count', dataSource: 'all' },
    viewType: 'bar',
    category: 'trend',
  },
  {
    id: 'category-distribution',
    name: '카테고리별 분포',
    description: '카테고리별 고객 분포 (count: by category)',
    formula: { type: 'count', dataSource: 'all' },
    viewType: 'pie',
    category: 'distribution',
  },
]

// Get presets by category
export function getPresetsByCategory(category: FormulaCategory): WidgetFormula[] {
  return PRESET_FORMULAS.filter(p => p.category === category)
}

// Get the icon name for a widget based on its data source
export function getWidgetIcon(dataSource: DataSource): string {
  switch (dataSource) {
    case 'all':
      return 'users'
    case 'prospect':
      return 'userPlus'
    case 'in_progress':
      return 'clock'
    case 'completed':
      return 'checkCircle'
    case 'callback':
      return 'phone'
    case 'absent':
      return 'userMinus'
    case 'cancelled':
      return 'xCircle'
    default:
      return 'users'
  }
}

// Determine if a view type is a chart type
export function isChartViewType(viewType: ViewType): boolean {
  return viewType === 'pie' || viewType === 'bar' || viewType === 'line'
}

// Get chart type from view type
export function getChartType(viewType: ViewType): 'pie' | 'bar' | 'line' | null {
  if (viewType === 'pie' || viewType === 'bar' || viewType === 'line') {
    return viewType
  }
  return null
}

// Generate human-readable formula description
export function generateFormulaDescription(formula: FormulaConfig): string {
  const dataSourceLabel = DATA_SOURCE_LABELS[formula.dataSource]
  const formulaLabel = FORMULA_LABELS[formula.type]

  switch (formula.type) {
    case 'count':
      return `${dataSourceLabel}의 총 건수를 표시합니다.`
    case 'countIf':
      if (formula.condition) {
        return `${dataSourceLabel} 중 조건을 만족하는 건수를 표시합니다.`
      }
      return `${dataSourceLabel}의 조건부 건수를 표시합니다.`
    case 'sum':
      return `${dataSourceLabel}의 ${formula.field || '값'} 합계를 표시합니다.`
    case 'avg':
      return `${dataSourceLabel}의 ${formula.field || '값'} 평균을 표시합니다.`
    case 'ratio':
      return `${dataSourceLabel} / 전체 고객의 비율을 표시합니다.`
    case 'compare':
      const compareLabel = formula.compareWith === 'previousPeriod' ? '이전 기간'
        : formula.compareWith === 'previousMonth' ? '전월'
        : formula.compareWith === 'previousYear' ? '전년'
        : '이전'
      return `${dataSourceLabel}의 ${compareLabel} 대비 변화를 표시합니다.`
    default:
      return `${formulaLabel} - ${dataSourceLabel}`
  }
}

// Generate preview example value
export function generateFormulaPreview(formula: FormulaConfig, viewType: ViewType): string {
  switch (viewType) {
    case 'percent':
      return '45.2%'
    case 'trend':
      return '123 (+12.5%)'
    case 'number':
    default:
      return '123건'
  }
}

// Get step description for wizard
export const WIZARD_STEPS = [
  {
    id: 'formula',
    title: '수식 선택',
    description: '어떤 데이터를 계산할지 선택하세요',
  },
  {
    id: 'dataSource',
    title: '데이터 소스',
    description: '어떤 고객 그룹을 대상으로 할지 선택하세요',
  },
  {
    id: 'display',
    title: '표시 형식',
    description: '데이터를 어떻게 표시할지 선택하세요',
  },
  {
    id: 'style',
    title: '스타일링',
    description: '위젯의 크기와 색상을 설정하세요',
  },
]
