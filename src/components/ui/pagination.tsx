'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  maxVisiblePages?: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
}: PaginationProps) {
  const getPageNumbers = (): (number | 'ellipsis-start' | 'ellipsis-end')[] => {
    const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = []

    if (totalPages <= maxVisiblePages + 2) {
      // 전체 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 항상 1 표시
      pages.push(1)

      // 중간 페이지 계산
      const halfVisible = Math.floor(maxVisiblePages / 2)
      let start = Math.max(2, currentPage - halfVisible)
      let end = Math.min(totalPages - 1, currentPage + halfVisible)

      // 범위 조정
      if (currentPage <= halfVisible + 1) {
        end = maxVisiblePages
      } else if (currentPage >= totalPages - halfVisible) {
        start = totalPages - maxVisiblePages + 1
      }

      // 시작 ellipsis
      if (start > 2) {
        pages.push('ellipsis-start')
      }

      // 중간 페이지
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      // 끝 ellipsis
      if (end < totalPages - 1) {
        pages.push('ellipsis-end')
      }

      // 항상 마지막 페이지 표시
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {getPageNumbers().map((page, idx) =>
        page === 'ellipsis-start' || page === 'ellipsis-end' ? (
          <span key={page} className="px-2 text-muted-foreground">
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            size="sm"
            className="h-8 min-w-[32px] px-2"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage >= totalPages}
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
