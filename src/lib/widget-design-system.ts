// Widget Design System - 5-tier size system based on grid dimensions
// Grid settings: 12 columns, 80px row height, 10px margin
// 컴팩트한 여백으로 정보 밀도 향상, 값을 크고 꽉차게 표시

export type WidgetSizeTier = 'micro' | 'ultra_compact' | 'compact' | 'normal' | 'spacious'

// Legacy tier mapping (for backwards compatibility)
export type LegacySizeTier = 'small' | 'medium' | 'large'
export const LEGACY_TIER_MAP: Record<LegacySizeTier, WidgetSizeTier> = {
  small: 'compact',
  medium: 'normal',
  large: 'spacious',
}

// Design tokens for stat widgets - 5단계 여백 시스템 (값을 크고 꽉차게)
export const STAT_DESIGN_TOKENS = {
  // 1x1, 2x1: 마이크로 (area ≤ 2)
  micro: {
    titleSize: 'text-[10px]',  // 10px
    valueSize: 'text-base',    // 16px - 더 컴팩트하게
    iconSize: 'h-3 w-3',       // 12px
    headerPadding: 'pb-0 pt-0.5 px-1',
    contentPadding: 'pb-0.5 px-1',
    changeSize: 'text-[9px]',
    layout: 'horizontal',      // 가로 배치
  },
  // 2x2 이하: 가장 컴팩트 (area ≤ 4)
  ultra_compact: {
    titleSize: 'text-xs',      // 12px
    valueSize: 'text-2xl',     // 24px - 축소
    iconSize: 'h-3.5 w-3.5',   // 14px - 축소
    headerPadding: 'pb-0 pt-0.5 px-1',
    contentPadding: 'pb-0.5 px-1',
    changeSize: 'text-[10px]',
    layout: 'vertical',
  },
  // 3x2: 기본 컴팩트 (area ≤ 6)
  compact: {
    titleSize: 'text-sm',      // 14px
    valueSize: 'text-3xl',     // 30px - 축소
    iconSize: 'h-4 w-4',       // 16px - 축소
    headerPadding: 'pb-0 pt-0.5 px-1.5',
    contentPadding: 'pb-0.5 px-1.5',
    changeSize: 'text-xs',
    layout: 'vertical',
  },
  // 4x3, 6x2: 일반 (area ≤ 12)
  normal: {
    titleSize: 'text-sm',      // 14px
    valueSize: 'text-4xl',     // 36px - 축소
    iconSize: 'h-5 w-5',       // 20px - 축소
    headerPadding: 'pb-0.5 pt-1 px-2',
    contentPadding: 'pb-1 px-2',
    changeSize: 'text-xs',
    layout: 'vertical',
  },
  // 6x4 이상: 여유 (area > 12)
  spacious: {
    titleSize: 'text-base',    // 16px
    valueSize: 'text-5xl',     // 48px - 축소
    iconSize: 'h-6 w-6',       // 24px - 축소
    headerPadding: 'pb-1 pt-1.5 px-2.5',
    contentPadding: 'pb-1.5 px-2.5',
    changeSize: 'text-sm',
    layout: 'vertical',
  },
} as const

// Design tokens for chart widgets - 5단계 여백 시스템 (차트 영역 최대화)
export const CHART_DESIGN_TOKENS = {
  // 1x1, 2x1: 마이크로 - 스파크라인용 (area ≤ 2)
  micro: {
    titleSize: 'text-[10px]',  // 10px
    headerPadding: 'pb-0 pt-0.5 px-1',
    contentPadding: 'pb-0.5 px-0.5',
    chartHeight: 40,           // 축소
    axisFontSize: 8,
    showLabels: false,
    showLegend: false,
    pie: {
      innerRadius: 8,
      outerRadius: 20,
    },
  },
  // 2x2 이하: 미니 차트 (area ≤ 4)
  ultra_compact: {
    titleSize: 'text-xs',      // 12px
    headerPadding: 'pb-0 pt-0.5 px-1',
    contentPadding: 'pb-0.5 px-0.5',
    chartHeight: 80,           // 축소
    axisFontSize: 9,
    showLabels: false,
    showLegend: false,
    pie: {
      innerRadius: 15,
      outerRadius: 35,
    },
  },
  // 3x2, 4x2: 소형 차트 (area ≤ 6)
  compact: {
    titleSize: 'text-sm',      // 14px
    headerPadding: 'pb-0 pt-0.5 px-1',
    contentPadding: 'pb-0.5 px-1',
    chartHeight: 110,          // 축소
    axisFontSize: 10,
    showLabels: false,
    showLegend: false,
    pie: {
      innerRadius: 20,
      outerRadius: 45,
    },
  },
  // 4x3, 6x2, 6x3: 중형 차트 (area ≤ 12)
  normal: {
    titleSize: 'text-sm',      // 14px
    headerPadding: 'pb-0.5 pt-1 px-1.5',
    contentPadding: 'pb-0.5 px-1.5',
    chartHeight: 160,          // 축소
    axisFontSize: 11,
    showLabels: false,
    showLegend: false,
    pie: {
      innerRadius: 35,
      outerRadius: 65,
    },
  },
  // 6x4 이상: 대형 차트 (area > 12)
  spacious: {
    titleSize: 'text-base',    // 16px
    headerPadding: 'pb-0.5 pt-1 px-2',
    contentPadding: 'pb-1 px-2',
    chartHeight: 220,          // 축소
    axisFontSize: 12,
    showLabels: true,
    showLegend: false,         // 축소를 위해 false로 변경
    pie: {
      innerRadius: 45,
      outerRadius: 85,
    },
  },
} as const

/**
 * Determine widget size tier based on grid dimensions
 *
 * Size tiers (5단계):
 * - micro (1x1, 2x1): area ≤ 2 - 상태 카운트, 스파크라인
 * - ultra_compact (2x2): area ≤ 4 - 미니 위젯
 * - compact (3x2): area ≤ 6 - 기본 stat 위젯
 * - normal (4x3, 6x2): area ≤ 12 - 확장 stats, 중형 차트
 * - spacious (6x4+): area > 12 - 대형 차트, Hero 위젯
 *
 * @param w - Grid width (columns)
 * @param h - Grid height (rows)
 * @returns WidgetSizeTier
 */
export function getTierFromGridSize(w: number, h: number): WidgetSizeTier {
  const area = w * h

  if (area <= 2) {
    return 'micro'
  } else if (area <= 4) {
    return 'ultra_compact'
  } else if (area <= 6) {
    return 'compact'
  } else if (area <= 12) {
    return 'normal'
  } else {
    return 'spacious'
  }
}

/**
 * Legacy function for backwards compatibility
 */
export function getLegacyTier(w: number, h: number): LegacySizeTier {
  const tier = getTierFromGridSize(w, h)
  if (tier === 'ultra_compact' || tier === 'compact') return 'small'
  if (tier === 'normal') return 'medium'
  return 'large'
}

/**
 * Get stat widget design tokens based on grid dimensions
 */
export function getStatTokens(w: number, h: number) {
  const tier = getTierFromGridSize(w, h)
  return STAT_DESIGN_TOKENS[tier]
}

/**
 * Get chart widget design tokens based on grid dimensions
 */
export function getChartTokens(w: number, h: number) {
  const tier = getTierFromGridSize(w, h)
  return CHART_DESIGN_TOKENS[tier]
}
