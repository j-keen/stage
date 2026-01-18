'use client'

import { useEffect } from 'react'
import { useSettingsStore } from '@/stores/settings-store'
import { cn } from '@/lib/utils'
import type { TableDensity } from '@/stores/table-store'

interface StatusBadgeProps {
  status: string
  className?: string
  density?: TableDensity
}

export function StatusBadge({ status, className, density = 'compact' }: StatusBadgeProps) {
  const { loadSettings, getStatusBadge, isLoaded } = useSettingsStore()

  useEffect(() => {
    if (!isLoaded) {
      loadSettings()
    }
  }, [isLoaded, loadSettings])

  const badgeConfig = getStatusBadge(status)

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full border-0 truncate',
        badgeConfig.bold ? 'font-bold' : 'font-medium',
        density === 'compact' && 'px-2 py-0.5 text-[10px] w-14 min-w-[56px]',
        density === 'normal' && 'px-2.5 py-0.5 text-xs w-16 min-w-[64px]',
        density === 'comfortable' && 'px-3 py-1 text-sm w-20 min-w-[80px]',
        className
      )}
      style={{
        backgroundColor: badgeConfig.bgColor,
        color: badgeConfig.color,
      }}
      title={badgeConfig.label}
    >
      {badgeConfig.label}
    </span>
  )
}
