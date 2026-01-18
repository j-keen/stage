// Widget color presets and conditional evaluation logic

export interface ColorPreset {
  name: string
  color: string
  bgColor: string
}

export const COLOR_PRESETS: ColorPreset[] = [
  { name: '파랑', color: '#1E40AF', bgColor: '#DBEAFE' },
  { name: '초록', color: '#047857', bgColor: '#D1FAE5' },
  { name: '빨강', color: '#DC2626', bgColor: '#FEE2E2' },
  { name: '노랑', color: '#B45309', bgColor: '#FEF3C7' },
  { name: '보라', color: '#6D28D9', bgColor: '#EDE9FE' },
  { name: '주황', color: '#C2410C', bgColor: '#FFEDD5' },
  { name: '청록', color: '#0E7490', bgColor: '#CFFAFE' },
  { name: '분홍', color: '#BE185D', bgColor: '#FCE7F3' },
]

export const ALERT_COLORS = {
  success: { color: '#047857', bgColor: '#D1FAE5', label: '양호' },
  warning: { color: '#B45309', bgColor: '#FEF3C7', label: '주의' },
  danger: { color: '#DC2626', bgColor: '#FEE2E2', label: '위험' },
  info: { color: '#1E40AF', bgColor: '#DBEAFE', label: '정보' },
}

export type ComparisonOperator = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq' | 'between'

export interface ConditionalColorRule {
  id: string
  field: 'value' | 'changePercent'
  operator: ComparisonOperator
  value: number
  value2?: number // For 'between' operator
  color: string
  bgColor: string
  label?: string
}

export const OPERATOR_LABELS: Record<ComparisonOperator, string> = {
  gt: '보다 큼 (>)',
  gte: '이상 (>=)',
  lt: '보다 작음 (<)',
  lte: '이하 (<=)',
  eq: '같음 (=)',
  neq: '같지 않음 (!=)',
  between: '범위 내',
}

export function evaluateCondition(
  value: number,
  operator: ComparisonOperator,
  threshold: number,
  threshold2?: number
): boolean {
  switch (operator) {
    case 'gt':
      return value > threshold
    case 'gte':
      return value >= threshold
    case 'lt':
      return value < threshold
    case 'lte':
      return value <= threshold
    case 'eq':
      return value === threshold
    case 'neq':
      return value !== threshold
    case 'between':
      return threshold2 !== undefined && value >= threshold && value <= threshold2
    default:
      return false
  }
}

export function getColorForValue(
  value: number,
  changePercent: number | null,
  rules: ConditionalColorRule[]
): { color: string; bgColor: string; label?: string } | null {
  for (const rule of rules) {
    const checkValue = rule.field === 'changePercent' ? (changePercent ?? 0) : value
    if (evaluateCondition(checkValue, rule.operator, rule.value, rule.value2)) {
      return {
        color: rule.color,
        bgColor: rule.bgColor,
        label: rule.label,
      }
    }
  }
  return null
}

export function getDefaultColorRules(): ConditionalColorRule[] {
  return [
    {
      id: 'rule-1',
      field: 'changePercent',
      operator: 'gte',
      value: 10,
      color: ALERT_COLORS.success.color,
      bgColor: ALERT_COLORS.success.bgColor,
      label: '양호',
    },
    {
      id: 'rule-2',
      field: 'changePercent',
      operator: 'lt',
      value: 0,
      color: ALERT_COLORS.danger.color,
      bgColor: ALERT_COLORS.danger.bgColor,
      label: '위험',
    },
  ]
}
