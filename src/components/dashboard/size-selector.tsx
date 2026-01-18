'use client'

import { cn } from '@/lib/utils'

export type WidgetSizePreset =
  | 'mini' | 'miniWide' | 'compact' | 'small' | 'medium' | 'wide' | 'large' | 'tall'
  | 'square' | 'squareLarge'

export interface WidgetSize {
  w: number
  h: number
}

export const SIZE_PRESETS: Record<WidgetSizePreset, { size: WidgetSize; label: string; description: string }> = {
  mini: {
    size: { w: 1, h: 1 },
    label: '미니',
    description: '상태 카운트 (1x1)',
  },
  miniWide: {
    size: { w: 2, h: 1 },
    label: '미니 가로',
    description: '상태 카운트 (2x1)',
  },
  compact: {
    size: { w: 2, h: 2 },
    label: '컴팩트',
    description: '작은 숫자용 (2x2)',
  },
  small: {
    size: { w: 3, h: 2 },
    label: '기본',
    description: '기본 통계 (3x2)',
  },
  medium: {
    size: { w: 4, h: 2 },
    label: '중간',
    description: '넓은 통계 (4x2)',
  },
  wide: {
    size: { w: 6, h: 2 },
    label: '가로형',
    description: '가로 차트 (6x2)',
  },
  square: {
    size: { w: 3, h: 3 },
    label: '정사각',
    description: '게이지/리스트 (3x3)',
  },
  tall: {
    size: { w: 3, h: 4 },
    label: '세로형',
    description: '세로 차트 (3x4)',
  },
  squareLarge: {
    size: { w: 4, h: 4 },
    label: '큰 정사각',
    description: '테이블/타임라인 (4x4)',
  },
  large: {
    size: { w: 6, h: 4 },
    label: '크게',
    description: '큰 차트 (6x4)',
  },
}

type WidgetCategory = 'stat' | 'chart' | 'list' | 'gauge' | 'timeline' | 'table' | 'statusCount'

interface SizeSelectorProps {
  value: WidgetSizePreset
  onChange: (size: WidgetSizePreset) => void
  isChart?: boolean
  widgetType?: WidgetCategory
}

export function SizeSelector({ value, onChange, isChart, widgetType }: SizeSelectorProps) {
  // Filter available sizes based on widget type
  const getAvailablePresets = (): WidgetSizePreset[] => {
    if (widgetType) {
      switch (widgetType) {
        case 'statusCount':
          return ['mini', 'miniWide', 'compact']
        case 'gauge':
          return ['square', 'tall', 'squareLarge']
        case 'list':
        case 'timeline':
          return ['square', 'tall', 'squareLarge', 'large']
        case 'table':
          return ['squareLarge', 'large', 'wide']
        case 'chart':
          return ['medium', 'wide', 'large', 'tall', 'squareLarge']
        case 'stat':
        default:
          return ['compact', 'small', 'medium']
      }
    }
    // Legacy fallback
    return isChart ? ['medium', 'wide', 'large', 'tall'] : ['compact', 'small', 'medium']
  }

  const availablePresets = getAvailablePresets()

  return (
    <div className="grid grid-cols-3 gap-2">
      {availablePresets.map((preset) => {
        const { size, label, description } = SIZE_PRESETS[preset]
        const isSelected = value === preset

        return (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={cn(
              'flex flex-col items-center p-3 rounded-lg border transition-all',
              isSelected
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:bg-muted'
            )}
          >
            {/* Visual representation of the size */}
            <div className="mb-2 relative">
              <div
                className={cn(
                  'rounded',
                  isSelected ? 'bg-primary' : 'bg-muted-foreground/30'
                )}
                style={{
                  width: `${size.w * 20}px`,
                  height: `${size.h * 20}px`,
                }}
              />
            </div>
            <span className="text-sm font-medium">{label}</span>
            <span className="text-xs text-muted-foreground">{description}</span>
          </button>
        )
      })}
    </div>
  )
}

export function getSizeFromPreset(preset: WidgetSizePreset): WidgetSize {
  return SIZE_PRESETS[preset].size
}

export function getPresetFromSize(w: number, h: number): WidgetSizePreset {
  if (w === 1 && h === 1) return 'mini'
  if (w === 2 && h === 1) return 'miniWide'
  if (w <= 2 && h <= 2) return 'compact'
  if (w === 3 && h === 2) return 'small'
  if (w === 4 && h === 2) return 'medium'
  if (w === 6 && h === 2) return 'wide'
  if (w === 3 && h === 3) return 'square'
  if (w === 3 && h === 4) return 'tall'
  if (w === 4 && h === 4) return 'squareLarge'
  if (w === 6 && h === 4) return 'large'
  return 'small'
}
