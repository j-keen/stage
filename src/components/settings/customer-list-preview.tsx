'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  CUSTOMER_STATUS_LABELS,
  CUSTOMER_CATEGORY_LABELS,
  type CustomerStatus,
  type CustomerCategory,
} from '@/types/database'
import { Eye } from 'lucide-react'

interface BadgeConfig {
  label: string
  color: string
  bgColor: string
}

interface CustomerListPreviewProps {
  columnLabels?: Record<string, string>
  statusBadges?: Record<CustomerStatus, BadgeConfig>
  categoryBadges?: Record<CustomerCategory, BadgeConfig>
}

// Sample data for preview
const SAMPLE_CUSTOMERS = [
  {
    id: '1',
    name: '김철수',
    phone: '010-1234-5678',
    category: 'new_customer' as CustomerCategory,
    status: 'prospect' as CustomerStatus,
    created_at: '2024-01-15',
  },
  {
    id: '2',
    name: '이영희',
    phone: '010-9876-5432',
    category: 'existing' as CustomerCategory,
    status: 'in_progress' as CustomerStatus,
    created_at: '2024-01-14',
  },
  {
    id: '3',
    name: '박민수',
    phone: '010-5555-1234',
    category: 'vip' as CustomerCategory,
    status: 'completed' as CustomerStatus,
    created_at: '2024-01-13',
  },
  {
    id: '4',
    name: '최지현',
    phone: '010-2222-3333',
    category: 'blacklist' as CustomerCategory,
    status: 'cancelled' as CustomerStatus,
    created_at: '2024-01-12',
  },
]

const DEFAULT_COLUMN_LABELS: Record<string, string> = {
  name: '이름',
  phone: '전화번호',
  category: '분류',
  status: '상태',
  created_at: '등록일',
}

const DEFAULT_STATUS_BADGES: Record<CustomerStatus, BadgeConfig> = {
  prospect: { label: '가망고객', color: '#1E40AF', bgColor: '#DBEAFE' },
  in_progress: { label: '진행중', color: '#B45309', bgColor: '#FEF3C7' },
  completed: { label: '완료', color: '#047857', bgColor: '#D1FAE5' },
  callback: { label: '재통화', color: '#6D28D9', bgColor: '#EDE9FE' },
  absent: { label: '부재', color: '#C2410C', bgColor: '#FFEDD5' },
  cancelled: { label: '취소', color: '#DC2626', bgColor: '#FEE2E2' },
}

const DEFAULT_CATEGORY_BADGES: Record<CustomerCategory, BadgeConfig> = {
  new_customer: { label: '신규고객', color: '#0369A1', bgColor: '#E0F2FE' },
  existing: { label: '기존고객', color: '#4B5563', bgColor: '#F3F4F6' },
  blacklist: { label: '사고자(블랙)', color: '#DC2626', bgColor: '#FEE2E2' },
  vip: { label: 'VIP', color: '#B45309', bgColor: '#FEF3C7' },
}

export function CustomerListPreview({
  columnLabels = DEFAULT_COLUMN_LABELS,
  statusBadges = DEFAULT_STATUS_BADGES,
  categoryBadges = DEFAULT_CATEGORY_BADGES,
}: CustomerListPreviewProps) {
  const getStatusBadge = (status: CustomerStatus) => {
    return statusBadges[status] || DEFAULT_STATUS_BADGES[status]
  }

  const getCategoryBadge = (category: CustomerCategory) => {
    return categoryBadges[category] || DEFAULT_CATEGORY_BADGES[category]
  }

  const getColumnLabel = (key: string) => {
    return columnLabels[key] || DEFAULT_COLUMN_LABELS[key] || key
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Eye className="h-4 w-4" />
          미리보기
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border-t">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">{getColumnLabel('name')}</TableHead>
                <TableHead className="text-xs">{getColumnLabel('phone')}</TableHead>
                <TableHead className="text-xs">{getColumnLabel('category')}</TableHead>
                <TableHead className="text-xs">{getColumnLabel('status')}</TableHead>
                <TableHead className="text-xs">{getColumnLabel('created_at')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SAMPLE_CUSTOMERS.map((customer) => {
                const statusConfig = getStatusBadge(customer.status)
                const categoryConfig = getCategoryBadge(customer.category)

                return (
                  <TableRow key={customer.id}>
                    <TableCell className="text-sm font-medium">{customer.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{customer.phone}</TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: categoryConfig.bgColor,
                          color: categoryConfig.color,
                        }}
                        className="text-xs"
                      >
                        {categoryConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: statusConfig.bgColor,
                          color: statusConfig.color,
                        }}
                        className="text-xs"
                      >
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(customer.created_at)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
