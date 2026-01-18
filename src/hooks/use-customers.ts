'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Customer } from '@/types/database'

interface CustomersQuery {
  page?: number
  limit?: number
  status?: string | null
  statuses?: string[]
  categories?: string[]
  branchId?: string | null
  assignedTo?: string | null
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  dateFrom?: string | null
  dateTo?: string | null
  isDuplicate?: boolean | null
  hasLicense?: boolean | null
  hasInsurance?: boolean | null
  hasCreditCard?: boolean | null
}

interface CustomersResponse {
  customers: Customer[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function useCustomers(query: CustomersQuery = {}) {
  return useQuery<CustomersResponse>({
    queryKey: ['customers', query],
    queryFn: async () => {
      const {
        page = 1,
        limit = 50,
        status,
        statuses,
        categories,
        branchId,
        assignedTo,
        search,
        sortBy = 'created_at',
        sortOrder = 'desc',
        dateFrom,
        dateTo,
        isDuplicate,
        hasLicense,
        hasInsurance,
        hasCreditCard,
      } = query

      // Build query params
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', limit.toString())
      params.set('sortBy', sortBy)
      params.set('sortOrder', sortOrder)

      if (statuses && statuses.length > 0) {
        params.set('statuses', statuses.join(','))
      } else if (status) {
        params.set('status', status)
      }
      if (categories && categories.length > 0) {
        params.set('categories', categories.join(','))
      }
      if (branchId) {
        params.set('branchId', branchId)
      }
      if (assignedTo) {
        params.set('assignedTo', assignedTo)
      }
      if (search) {
        params.set('search', search)
      }
      if (dateFrom) {
        params.set('dateFrom', dateFrom)
      }
      if (dateTo) {
        params.set('dateTo', dateTo)
      }
      if (isDuplicate !== null && isDuplicate !== undefined) {
        params.set('isDuplicate', isDuplicate.toString())
      }
      if (hasLicense !== null && hasLicense !== undefined) {
        params.set('hasLicense', hasLicense.toString())
      }
      if (hasInsurance !== null && hasInsurance !== undefined) {
        params.set('hasInsurance', hasInsurance.toString())
      }
      if (hasCreditCard !== null && hasCreditCard !== undefined) {
        params.set('hasCreditCard', hasCreditCard.toString())
      }

      const response = await fetch(`/api/customers?${params.toString()}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || '고객 목록 조회 중 오류가 발생했습니다')
      }

      const data = await response.json()

      return {
        customers: (data.customers || []) as Customer[],
        pagination: data.pagination || {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      }
    },
    enabled: typeof window !== 'undefined',
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
  })
}

export function useCustomer(id: string) {
  return useQuery<Customer>({
    queryKey: ['customer', id],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('customers')
        .select(
          `
          *,
          branch:branches(id, name),
          assigned_user:users!customers_assigned_to_fkey(id, name)
        `
        )
        .eq('id', id)
        .single()

      if (error) {
        throw error
      }

      return data as Customer
    },
    enabled: !!id && typeof window !== 'undefined',
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<Customer>
    }) => {
      const supabase = createClient()
      const { data: updated, error } = await supabase
        .from('customers')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return updated as Customer
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['customer', data.id] })
    },
  })
}

export function useCustomerHistory(customerId: string) {
  return useQuery({
    queryKey: ['customer-history', customerId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('customer_histories')
        .select(
          `
          *,
          user:users(id, name)
        `
        )
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return data
    },
    enabled: !!customerId && typeof window !== 'undefined',
  })
}
