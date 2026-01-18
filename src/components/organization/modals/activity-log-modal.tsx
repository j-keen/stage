'use client'

import { useState, useEffect } from 'react'
import { History, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { UserActivityLog } from '@/types/database'

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  login: { label: '로그인', color: 'bg-blue-100 text-blue-800' },
  customer_create: { label: '고객 생성', color: 'bg-green-100 text-green-800' },
  customer_update: { label: '고객 수정', color: 'bg-yellow-100 text-yellow-800' },
  customer_assign: { label: '고객 배정', color: 'bg-purple-100 text-purple-800' },
  permission_change: { label: '권한 변경', color: 'bg-orange-100 text-orange-800' },
  team_change: { label: '팀 변경', color: 'bg-cyan-100 text-cyan-800' },
  role_change: { label: '역할 변경', color: 'bg-pink-100 text-pink-800' },
}

interface ActivityLogModalProps {
  open: boolean
  onClose: () => void
  userId: string
  userName: string
}

export function ActivityLogModal({
  open,
  onClose,
  userId,
  userName,
}: ActivityLogModalProps) {
  const [logs, setLogs] = useState<UserActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (open) {
      fetchLogs()
    }
  }, [open, page, userId])

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${userId}/activity?page=${page}&limit=20`)
      const data = await response.json()

      if (response.ok) {
        setLogs(data.logs || [])
        setTotalPages(data.totalPages || 1)
        setTotal(data.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch activity logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getActionInfo = (action: string) => {
    return ACTION_LABELS[action] || { label: action, color: 'bg-gray-100 text-gray-800' }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            활동 로그 - {userName}
          </DialogTitle>
          <DialogDescription>
            총 {total}개의 활동 기록
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">활동 기록이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => {
                const actionInfo = getActionInfo(log.action)
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30"
                  >
                    <Badge className={`${actionInfo.color} text-[10px] shrink-0`}>
                      {actionInfo.label}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      {log.resource_type && (
                        <p className="text-xs text-muted-foreground">
                          {log.resource_type}
                          {log.resource_id && ` (${log.resource_id.slice(0, 8)}...)`}
                        </p>
                      )}
                      {log.details && (
                        <p className="text-xs text-muted-foreground truncate">
                          {JSON.stringify(log.details)}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatDate(log.created_at)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-xs text-muted-foreground">
              {page} / {totalPages} 페이지
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
