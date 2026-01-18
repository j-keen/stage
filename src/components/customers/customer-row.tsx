'use client'

import { memo } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { StatusBadge } from './status-badge'
import { CategoryBadge } from './category-badge'
import { Check, X } from 'lucide-react'
import type { Customer, CustomerStatus, CustomerCategory } from '@/types/database'
import type { ColumnConfig, TableDensity } from '@/stores/table-store'

interface CustomerRowProps {
  customer: Customer & {
    branch?: { id: string; name: string } | null
    assigned_user?: { id: string; name: string } | null
  }
  columns: ColumnConfig[]
  isSelected: boolean
  onClick: () => void
  style?: React.CSSProperties
  onToggleOverdue?: (customerId: string, newValue: boolean) => void
  density?: TableDensity
}

function CustomerRowComponent({
  customer,
  columns,
  isSelected,
  onClick,
  style,
  onToggleOverdue,
  density = 'compact',
}: CustomerRowProps) {
  const visibleColumns = columns.filter((col) => col.visible)

  const formatPhone = (phone: string) => {
    if (phone.length === 11) {
      return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`
    }
    return phone
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-'
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return format(new Date(dateStr), 'yyyy-MM-dd HH:mm', { locale: ko })
  }

  const formatShortDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return format(new Date(dateStr), 'MM/dd HH:mm', { locale: ko })
  }

  const renderBooleanIndicator = (value: boolean | undefined | null) => {
    if (value === true) {
      return <Check className="h-4 w-4 text-green-600" />
    }
    return <X className="h-4 w-4 text-gray-400" />
  }

  const renderCell = (column: ColumnConfig) => {
    switch (column.id) {
      case 'category':
        if (customer.is_duplicate) {
          return <CategoryBadge category="duplicate" density={density} />
        }
        return (
          <CategoryBadge
            category={(customer.category as CustomerCategory) || 'new_customer'}
            density={density}
          />
        )
      case 'status':
        return <StatusBadge status={(customer.status as CustomerStatus) || 'prospect'} density={density} />
      case 'name':
        return customer.name || '-'
      case 'phone':
        return formatPhone(customer.phone)
      case 'existing_loans':
        return formatCurrency(customer.existing_loans)
      case 'income':
        return formatCurrency(customer.income)
      case 'employment_period':
        return customer.employment_period || '-'
      case 'required_amount':
        return formatCurrency(customer.required_amount)
      case 'has_license':
        return (
          <div className="flex justify-center">
            {renderBooleanIndicator(customer.has_license)}
          </div>
        )
      case 'has_insurance':
        return (
          <div className="flex justify-center">
            {renderBooleanIndicator(customer.has_insurance)}
          </div>
        )
      case 'has_credit_card':
        return (
          <div className="flex justify-center">
            {renderBooleanIndicator(customer.has_credit_card)}
          </div>
        )
      case 'has_overdue':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleOverdue?.(customer.id, !customer.has_overdue)
            }}
            className="flex justify-center w-full cursor-pointer hover:opacity-70 transition-opacity"
            title={customer.has_overdue ? '클릭하여 연체 해제' : '클릭하여 연체 설정'}
          >
            {customer.has_overdue ? (
              <span className="text-red-600 font-medium">있음</span>
            ) : (
              <span className="text-gray-400">없음</span>
            )}
          </button>
        )
      case 'assigned_to':
        return customer.assigned_user?.name || '-'
      case 'updated_at':
        return formatShortDate(customer.updated_at)
      case 'created_at':
        return formatShortDate(customer.created_at)
      case 'address':
        return (
          <span className="truncate block" title={customer.address || ''}>
            {customer.address || '-'}
          </span>
        )
      case 'branch_id':
        return customer.branch?.name || '-'
      case 'callback_date':
        return formatDate(customer.callback_date)
      case 'loan_amount':
        return formatCurrency(customer.loan_amount)
      case 'credit_score':
        return customer.credit_score || '-'
      case 'occupation':
        return customer.occupation || '-'
      case 'birth_date':
        return customer.birth_date || '-'
      case 'gender':
        return customer.gender === 'male'
          ? '남'
          : customer.gender === 'female'
          ? '여'
          : '-'
      case 'fund_purpose':
        return customer.fund_purpose || '-'
      case 'notes':
        return (
          <span className="truncate max-w-[200px] block" title={customer.notes || ''}>
            {customer.notes || '-'}
          </span>
        )
      default:
        // Handle custom columns (columns starting with 'custom_' or 'custom1-5')
        if (column.id.startsWith('custom_') || /^custom[1-5]$/.test(column.id)) {
          const customFields = (customer.custom_fields as Record<string, unknown>) || {}
          const value = customFields[column.id]
          return renderCustomFieldValue(value, column.type)
        }
        return '-'
    }
  }

  const renderCustomFieldValue = (
    value: unknown,
    type?: 'text' | 'number' | 'date' | 'select' | 'boolean'
  ) => {
    if (value === null || value === undefined || value === '') return '-'

    switch (type) {
      case 'number':
        if (typeof value === 'number') {
          return formatCurrency(value)
        }
        return String(value)
      case 'date':
        if (typeof value === 'string') {
          return formatShortDate(value)
        }
        return '-'
      case 'boolean':
        return (
          <div className="flex justify-center">
            {renderBooleanIndicator(Boolean(value))}
          </div>
        )
      case 'select':
      case 'text':
      default:
        return (
          <span className="truncate block" title={String(value)}>
            {String(value)}
          </span>
        )
    }
  }

  return (
    <div
      style={style}
      className={cn(
        'flex items-center border-b cursor-pointer hover:bg-muted/50 transition-colors',
        isSelected && 'bg-primary/10 hover:bg-primary/15'
      )}
      onClick={onClick}
    >
      {visibleColumns.map((column) => (
        <div
          key={column.id}
          className={cn(
            "truncate border-r text-center",
            density === 'compact' && "px-1.5 py-1 text-xs",
            density === 'normal' && "px-2 py-1.5 text-xs",
            density === 'comfortable' && "px-3 py-2 text-sm"
          )}
          style={{
            width: column.width,
            minWidth: column.width,
            maxWidth: column.width,
          }}
        >
          {renderCell(column)}
        </div>
      ))}
    </div>
  )
}

export const CustomerRow = memo(CustomerRowComponent)
