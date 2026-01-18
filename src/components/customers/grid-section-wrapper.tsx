'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { GripVertical, Eye, EyeOff } from 'lucide-react'
import {
  User,
  Wallet,
  Building,
  Briefcase,
  Shield,
  FileText,
  PlusSquare,
} from 'lucide-react'

interface GridSectionWrapperProps {
  sectionId: string
  title: string
  icon?: string
  isEditMode: boolean
  isVisible: boolean
  onToggleVisibility?: () => void
  children: ReactNode
  className?: string
}

const iconMap: Record<string, ReactNode> = {
  user: <User className="h-4 w-4" />,
  wallet: <Wallet className="h-4 w-4" />,
  building: <Building className="h-4 w-4" />,
  briefcase: <Briefcase className="h-4 w-4" />,
  shield: <Shield className="h-4 w-4" />,
  'file-text': <FileText className="h-4 w-4" />,
  'plus-square': <PlusSquare className="h-4 w-4" />,
}

export function GridSectionWrapper({
  sectionId,
  title,
  icon,
  isEditMode,
  isVisible,
  onToggleVisibility,
  children,
  className,
}: GridSectionWrapperProps) {
  const IconComponent = icon ? iconMap[icon] : null

  return (
    <div
      className={cn(
        'h-full border rounded-lg bg-background overflow-hidden flex flex-col',
        isEditMode && 'border-dashed border-2',
        isEditMode && !isVisible && 'opacity-50 bg-muted/30',
        className
      )}
    >
      {/* 헤더 */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 border-b bg-muted/30',
          isEditMode && 'cursor-move drag-handle'
        )}
      >
        {isEditMode && (
          <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
        {IconComponent && (
          <span className="text-muted-foreground flex-shrink-0">{IconComponent}</span>
        )}
        <h4 className="text-sm font-medium flex-1 truncate">{title}</h4>
        {isEditMode && onToggleVisibility && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation()
              onToggleVisibility()
            }}
          >
            {isVisible ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
      </div>

      {/* 콘텐츠 */}
      <ScrollArea className="flex-1">
        <div className="p-3">{children}</div>
      </ScrollArea>
    </div>
  )
}
