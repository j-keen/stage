'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Check, Circle } from 'lucide-react'

interface TaskItem {
  label: string
  completed: boolean
}

interface TaskProgressWidgetProps {
  title: string
  tasks: TaskItem[]
  completedCount?: number
  totalCount?: number
  isLoading?: boolean
  dimensions?: { width: number; height: number }
  gridSize?: { w: number; h: number }
}

export function TaskProgressWidget({
  title,
  tasks,
  completedCount,
  totalCount,
  isLoading,
  gridSize,
}: TaskProgressWidgetProps) {
  const isCompact = gridSize && (gridSize.w <= 3 || gridSize.h <= 2)

  // Calculate counts from tasks if not provided
  const completed = completedCount ?? tasks.filter((t) => t.completed).length
  const total = totalCount ?? tasks.length
  const percent = total > 0 ? (completed / total) * 100 : 0

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <Skeleton className="h-2 w-full rounded-full mb-3" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2 py-1.5">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full bg-white border-slate-200/60 shadow-sm flex flex-col">
      <CardHeader className="pb-2 pt-3 px-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-700">{title}</CardTitle>
          <span className="text-sm font-medium text-slate-500">
            {completed}/{total} completed
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3 flex-1 min-h-0 flex flex-col">
        {/* Progress Bar */}
        <div className="mb-3 flex-shrink-0">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-slate-400">
            <span>Progress</span>
            <span>{percent.toFixed(0)}%</span>
          </div>
        </div>

        {/* Task List */}
        {!isCompact && tasks.length > 0 && (
          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-0.5">
              {tasks.map((task, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 py-1.5 px-2 rounded-md transition-colors ${
                    task.completed ? 'bg-emerald-50/50' : 'hover:bg-slate-50'
                  }`}
                >
                  {task.completed ? (
                    <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  )}
                  <span
                    className={`text-sm truncate ${
                      task.completed ? 'text-slate-400 line-through' : 'text-slate-700'
                    }`}
                  >
                    {task.label}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Compact Summary */}
        {isCompact && (
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="w-2 h-2 text-white" />
              </div>
              <span className="text-slate-600">{completed} done</span>
            </div>
            <div className="flex items-center gap-1">
              <Circle className="w-3 h-3 text-slate-300" />
              <span className="text-slate-600">{total - completed} remaining</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
