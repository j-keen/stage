'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FieldRowProps {
  title?: string
  icon?: ReactNode
  children: ReactNode
  className?: string
  columns?: 2 | 3 | 4 | 5 | 6
}

export function FieldRow({
  title,
  icon,
  children,
  className,
  columns = 4,
}: FieldRowProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  }

  return (
    <div className={cn('space-y-1', className)}>
      {title && (
        <div className="flex items-center gap-2 pb-1 border-b">
          {icon}
          <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
        </div>
      )}
      <div className={cn('grid gap-2', gridCols[columns])}>
        {children}
      </div>
    </div>
  )
}

interface FieldItemProps {
  label: string
  children: ReactNode
  className?: string
  span?: 1 | 2
}

export function FieldItem({ label, children, className, span = 1 }: FieldItemProps) {
  return (
    <div className={cn(
      'space-y-0.5',
      span === 2 && 'sm:col-span-2',
      className
    )}>
      <label className="text-xs text-muted-foreground font-medium">{label}</label>
      <div>{children}</div>
    </div>
  )
}
