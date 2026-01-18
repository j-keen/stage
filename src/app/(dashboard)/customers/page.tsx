'use client'

import { useState, useMemo, useCallback } from 'react'
import { useCustomers, useUpdateCustomer } from '@/hooks/use-customers'
import { useFilterStore } from '@/stores/filter-store'
import { useTableStore } from '@/stores/table-store'
import { useSettingsStore } from '@/stores/settings-store'
import { CustomerTable } from '@/components/customers/customer-table'
import { CustomerFilters } from '@/components/customers/customer-filters'
import { CustomerModal } from '@/components/customers/customer-modal'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { RefreshCw, Columns3, Download, Settings2, Search, LayoutGrid } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'
import type { Customer } from '@/types/database'

export default function CustomersPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)

  const { values, setValue } = useFilterStore()
  const { columns, updateColumnVisibility, sortBy, sortOrder, isColumnEditMode, setColumnEditMode, density, setDensity } = useTableStore()
  const { getAllCustomColumns, toggleCustomColumnVisibility } = useSettingsStore()

  const { data, isLoading, refetch, isFetching } = useCustomers({
    page,
    limit,
    status: values.status,
    statuses: values.statuses,
    categories: values.categories,
    branchId: values.branchId,
    assignedTo: values.assignedTo === 'unassigned' ? null : values.assignedTo,
    search: values.search,
    dateFrom: values.dateFrom,
    dateTo: values.dateTo,
    sortBy,
    sortOrder,
    hasLicense: values.hasLicense,
    hasInsurance: values.hasInsurance,
    hasCreditCard: values.hasCreditCard,
  })

  // Handle navigation to a customer from duplicate history
  const handleNavigateToCustomer = async (customerId: string) => {
    // First fetch the customer data
    const supabase = (await import('@/lib/supabase/client')).createClient()
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single()

    if (customer) {
      setSelectedCustomer(customer as Customer)
    }
  }

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
  }

  const handleCloseModal = () => {
    setSelectedCustomer(null)
    refetch()
  }

  const handleExport = () => {
    // TODO: Implement CSV export
    console.log('Export clicked')
  }

  const { mutate: updateCustomer } = useUpdateCustomer()

  const handleToggleOverdue = useCallback((customerId: string, newValue: boolean) => {
    updateCustomer(
      { id: customerId, data: { has_overdue: newValue } },
      { onSuccess: () => refetch() }
    )
  }, [updateCustomer, refetch])

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit)
    setPage(1)
  }, [])

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">고객 관리</h1>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="이름, 전화번호, 주소..."
              value={values.search}
              onChange={(e) => setValue('search', e.target.value)}
              className="pl-8 h-7 w-48 text-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-7 w-7"
            title="새로고침"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>

          {/* Column edit mode toggle */}
          <Button
            variant={isColumnEditMode ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setColumnEditMode(!isColumnEditMode)}
            className="h-7 w-7"
            title={isColumnEditMode ? '편집 완료' : '컬럼 편집'}
          >
            <Settings2 className="h-3.5 w-3.5" />
          </Button>

          {/* Table density */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" title="밀도">
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={density === 'compact'}
                onCheckedChange={() => setDensity('compact')}
              >
                좁게
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={density === 'normal'}
                onCheckedChange={() => setDensity('normal')}
              >
                보통
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={density === 'comfortable'}
                onCheckedChange={() => setDensity('comfortable')}
              >
                넓게
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" title="컬럼">
                <Columns3 className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 max-h-80 overflow-y-auto">
              <DropdownMenuLabel>기본 컬럼</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.visible}
                  onCheckedChange={(checked) =>
                    updateColumnVisibility(column.id, checked)
                  }
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
              {getAllCustomColumns().length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>커스텀 컬럼</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {getAllCustomColumns().map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={!column.hidden}
                      onCheckedChange={() => toggleCustomColumnVisibility(column.id)}
                    >
                      {column.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" onClick={handleExport} className="h-7 w-7" title="내보내기">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <CustomerFilters />

      {/* Table */}
      <div className="flex-1 min-h-0">
        <CustomerTable
          customers={data?.customers || []}
          isLoading={isLoading}
          selectedCustomerId={selectedCustomer?.id || null}
          onSelectCustomer={handleSelectCustomer}
          onToggleOverdue={handleToggleOverdue}
        />
      </div>

      {/* Pagination Info */}
      {data && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">표시</span>
            <Select
              value={limit.toString()}
              onValueChange={(value) => handleLimitChange(Number(value))}
            >
              <SelectTrigger className="w-20 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="200">200</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Pagination
            currentPage={page}
            totalPages={data.pagination.totalPages || 1}
            onPageChange={setPage}
          />
          <div className="text-xs text-muted-foreground">
            총 {data.pagination.total.toLocaleString()}건 중{' '}
            {((page - 1) * limit + 1).toLocaleString()} -{' '}
            {Math.min(page * limit, data.pagination.total).toLocaleString()}건
          </div>
        </div>
      )}

      {/* Customer Modal */}
      <CustomerModal
        customerId={selectedCustomer?.id || null}
        open={!!selectedCustomer}
        onClose={handleCloseModal}
        onNavigateToCustomer={handleNavigateToCustomer}
      />
    </div>
  )
}
