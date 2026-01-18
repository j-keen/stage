'use client'

import { useEffect } from 'react'
import { useSettingsStore } from '@/stores/settings-store'
import { cn } from '@/lib/utils'
import type { TableDensity } from '@/stores/table-store'

interface CategoryBadgeProps {
  category: string
  className?: string
  density?: TableDensity
}

export function CategoryBadge({ category, className, density = 'compact' }: CategoryBadgeProps) {
  const { loadSettings, getCategoryBadge, isLoaded } = useSettingsStore()

  useEffect(() => {
    if (!isLoaded) {
      loadSettings()
    }
  }, [isLoaded, loadSettings])

  const badgeConfig = getCategoryBadge(category)

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded border-l-4 truncate',
        badgeConfig.bold ? 'font-bold' : 'font-medium',
        density === 'compact' && 'px-1.5 py-0.5 text-[10px] w-16 min-w-[64px]',
        density === 'normal' && 'px-2 py-0.5 text-xs w-20 min-w-[80px]',
        density === 'comfortable' && 'px-2.5 py-1 text-sm w-24 min-w-[96px]',
        className
      )}
      style={{
        borderLeftColor: badgeConfig.color,
        backgroundColor: `${badgeConfig.bgColor}`,
        color: badgeConfig.color,
      }}
      title={badgeConfig.label}
    >
      {badgeConfig.label}
    </span>
  )
}
