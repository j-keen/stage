import type { TitleSizeOption, ValueSizeOption, IconSizeOption, SpacingOption } from '@/stores/dashboard-store'
import type { ConditionalColorRule } from '@/lib/widget-colors'

// Style Preset Types
export interface StylePreset {
  id: string
  name: string
  titleSize: TitleSizeOption
  valueSize: ValueSizeOption
  iconSize: IconSizeOption
  spacing: SpacingOption
  iconColor?: string
  valueColor?: string
}

// Conditional Rule Preset Types
export interface ConditionalPreset {
  id: string
  name: string
  description: string
  rules: Omit<ConditionalColorRule, 'id'>[]
}

// Style Presets Definition
export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'default',
    name: '기본',
    titleSize: 'auto',
    valueSize: 'auto',
    iconSize: 'auto',
    spacing: 'normal',
  },
  {
    id: 'emphasis',
    name: '강조',
    titleSize: 'lg',
    valueSize: '4xl',
    iconSize: 'lg',
    spacing: 'spacious',
    iconColor: '#3B82F6',
    valueColor: '#3B82F6',
  },
  {
    id: 'compact',
    name: '컴팩트',
    titleSize: 'xs',
    valueSize: 'xl',
    iconSize: 'sm',
    spacing: 'compact',
  },
  {
    id: 'wide',
    name: '넓은',
    titleSize: 'base',
    valueSize: '3xl',
    iconSize: 'md',
    spacing: 'spacious',
  },
  {
    id: 'success',
    name: '성공강조',
    titleSize: 'base',
    valueSize: '3xl',
    iconSize: 'md',
    spacing: 'normal',
    iconColor: '#16A34A',
    valueColor: '#16A34A',
  },
  {
    id: 'warning',
    name: '경고',
    titleSize: 'base',
    valueSize: '3xl',
    iconSize: 'md',
    spacing: 'normal',
    iconColor: '#F59E0B',
    valueColor: '#F59E0B',
  },
  {
    id: 'danger',
    name: '위험',
    titleSize: 'base',
    valueSize: '3xl',
    iconSize: 'md',
    spacing: 'normal',
    iconColor: '#EF4444',
    valueColor: '#EF4444',
  },
]

// Conditional Rule Presets Definition
export const CONDITIONAL_PRESETS: ConditionalPreset[] = [
  {
    id: 'success-fail',
    name: '성공/실패',
    description: '비율 위젯용: 70% 이상 성공, 50% 미만 위험',
    rules: [
      { field: 'value', operator: 'gte', value: 70, color: '#16A34A', bgColor: '#DCFCE7', label: '성공' },
      { field: 'value', operator: 'lt', value: 50, color: '#DC2626', bgColor: '#FEE2E2', label: '위험' },
    ],
  },
  {
    id: 'three-levels',
    name: '3단계 등급',
    description: '비율 위젯용: 우수/보통/미달 3단계',
    rules: [
      { field: 'value', operator: 'gte', value: 80, color: '#16A34A', bgColor: '#DCFCE7', label: '우수' },
      { field: 'value', operator: 'gte', value: 50, color: '#F59E0B', bgColor: '#FEF3C7', label: '보통' },
      { field: 'value', operator: 'lt', value: 50, color: '#DC2626', bgColor: '#FEE2E2', label: '미달' },
    ],
  },
  {
    id: 'warning-threshold',
    name: '경고 임계값',
    description: '숫자 위젯용: 100 이상 정상, 30 미만 경고',
    rules: [
      { field: 'value', operator: 'gte', value: 100, color: '#16A34A', bgColor: '#DCFCE7', label: '정상' },
      { field: 'value', operator: 'lt', value: 30, color: '#DC2626', bgColor: '#FEE2E2', label: '경고' },
    ],
  },
  {
    id: 'absence-monitoring',
    name: '부재/취소 감시',
    description: '역방향: 30% 이상 위험, 10% 미만 양호',
    rules: [
      { field: 'value', operator: 'gte', value: 30, color: '#DC2626', bgColor: '#FEE2E2', label: '위험' },
      { field: 'value', operator: 'lt', value: 10, color: '#16A34A', bgColor: '#DCFCE7', label: '양호' },
    ],
  },
]

// Utility functions
export function applyStylePreset(preset: StylePreset): {
  titleSize: TitleSizeOption
  valueSize: ValueSizeOption
  iconSize: IconSizeOption
  spacing: SpacingOption
  iconColor: string
  valueColor: string
} {
  return {
    titleSize: preset.titleSize,
    valueSize: preset.valueSize,
    iconSize: preset.iconSize,
    spacing: preset.spacing,
    iconColor: preset.iconColor || '',
    valueColor: preset.valueColor || '',
  }
}

export function applyConditionalPreset(preset: ConditionalPreset): ConditionalColorRule[] {
  return preset.rules.map((rule, index) => ({
    ...rule,
    id: `rule-${Date.now()}-${index}`,
  }))
}

export function getPresetIdFromStyle(
  titleSize: TitleSizeOption,
  valueSize: ValueSizeOption,
  iconSize: IconSizeOption,
  spacing: SpacingOption,
  iconColor: string,
  valueColor: string
): string | null {
  const preset = STYLE_PRESETS.find(
    (p) =>
      p.titleSize === titleSize &&
      p.valueSize === valueSize &&
      p.iconSize === iconSize &&
      p.spacing === spacing &&
      (p.iconColor || '') === iconColor &&
      (p.valueColor || '') === valueColor
  )
  return preset?.id || null
}

// ============================================
// Grid Size Presets - 그리드 크기 프리셋
// ============================================

export type WidgetType = 'stat' | 'chart'

export interface GridSizePreset {
  id: string
  name: string
  description: string
  w: number
  h: number
  recommended: WidgetType[]
  icon: 'compact' | 'small' | 'medium' | 'wide' | 'large' | 'tall' | 'extra-large'
}

// 그리드 크기 프리셋 정의 (7가지)
export const GRID_SIZE_PRESETS: GridSizePreset[] = [
  {
    id: 'compact',
    name: '컴팩트',
    description: '2×2',
    w: 2,
    h: 2,
    recommended: ['stat'],
    icon: 'compact',
  },
  {
    id: 'small',
    name: '기본',
    description: '3×2',
    w: 3,
    h: 2,
    recommended: ['stat'],
    icon: 'small',
  },
  {
    id: 'medium',
    name: '중간',
    description: '4×2',
    w: 4,
    h: 2,
    recommended: ['stat', 'chart'],
    icon: 'medium',
  },
  {
    id: 'wide',
    name: '가로형',
    description: '6×2',
    w: 6,
    h: 2,
    recommended: ['stat', 'chart'],
    icon: 'wide',
  },
  {
    id: 'tall',
    name: '세로형',
    description: '3×4',
    w: 3,
    h: 4,
    recommended: ['chart'],
    icon: 'tall',
  },
  {
    id: 'large',
    name: '크게',
    description: '6×4',
    w: 6,
    h: 4,
    recommended: ['chart'],
    icon: 'large',
  },
  {
    id: 'extra-large',
    name: '초대형',
    description: '12×4',
    w: 12,
    h: 4,
    recommended: ['chart'],
    icon: 'extra-large',
  },
]

// 위젯 타입별 권장 크기 프리셋 필터링
export function getGridSizePresetsForType(type: WidgetType): GridSizePreset[] {
  return GRID_SIZE_PRESETS.filter(preset => preset.recommended.includes(type))
}

// 그리드 크기로 프리셋 ID 찾기
export function getGridSizePresetFromDimensions(w: number, h: number): string | null {
  const preset = GRID_SIZE_PRESETS.find(p => p.w === w && p.h === h)
  return preset?.id || null
}

// 프리셋 ID로 그리드 크기 가져오기
export function getGridSizeFromPresetId(id: string): { w: number; h: number } | null {
  const preset = GRID_SIZE_PRESETS.find(p => p.id === id)
  return preset ? { w: preset.w, h: preset.h } : null
}
