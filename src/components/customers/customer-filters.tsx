'use client'

import { useEffect, useState } from 'react'
import { useFilterStore } from '@/stores/filter-store'
import { useSettingsStore } from '@/stores/settings-store'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, subDays } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CalendarIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Branch {
  id: string
  name: string
}

interface User {
  id: string
  name: string
}

type DatePreset = 'today' | 'yesterday' | 'week' | 'month' | 'lastMonth' | 'custom'

export function CustomerFilters() {
  const {
    values,
    setValue,
    clearFilters,
  } = useFilterStore()

  const { getStatusBadge, getCategoryBadge, getVisibleStatuses, getVisibleCategories, loadSettings, isLoaded } = useSettingsStore()

  const [branches, setBranches] = useState<Branch[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [datePreset, setDatePreset] = useState<DatePreset | null>(null)

  useEffect(() => {
    if (!isLoaded) {
      loadSettings()
    }
  }, [isLoaded, loadSettings])

  useEffect(() => {
    const fetchFilterData = async () => {
      const supabase = createClient()

      const [branchesRes, usersRes] = await Promise.all([
        supabase.from('branches').select('id, name').eq('is_active', true),
        supabase.from('users').select('id, name').eq('is_active', true),
      ])

      if (branchesRes.data) setBranches(branchesRes.data)
      if (usersRes.data) setUsers(usersRes.data)
    }

    fetchFilterData()
  }, [])

  const handleStatusToggle = (statusId: string) => {
    const current = values.statuses || []
    const updated = current.includes(statusId)
      ? current.filter(s => s !== statusId)
      : [...current, statusId]
    setValue('statuses', updated)
  }

  const handleCategoryToggle = (categoryId: string) => {
    const current = values.categories || []
    const updated = current.includes(categoryId)
      ? current.filter(c => c !== categoryId)
      : [...current, categoryId]
    setValue('categories', updated)
  }

  // Get visible statuses and categories
  const visibleStatuses = getVisibleStatuses()
  const visibleCategories = getVisibleCategories()

  const handleDatePreset = (preset: DatePreset) => {
    const now = new Date()
    setDatePreset(preset)

    switch (preset) {
      case 'today':
        setValue('dateFrom', startOfDay(now).toISOString())
        setValue('dateTo', endOfDay(now).toISOString())
        break
      case 'yesterday':
        const yesterday = subDays(now, 1)
        setValue('dateFrom', startOfDay(yesterday).toISOString())
        setValue('dateTo', endOfDay(yesterday).toISOString())
        break
      case 'week':
        setValue('dateFrom', startOfWeek(now, { locale: ko }).toISOString())
        setValue('dateTo', endOfWeek(now, { locale: ko }).toISOString())
        break
      case 'month':
        setValue('dateFrom', startOfMonth(now).toISOString())
        setValue('dateTo', endOfMonth(now).toISOString())
        break
      case 'lastMonth':
        const lastMonth = subMonths(now, 1)
        setValue('dateFrom', startOfMonth(lastMonth).toISOString())
        setValue('dateTo', endOfMonth(lastMonth).toISOString())
        break
      case 'custom':
        break
    }
  }

  const hasActiveFilters =
    (values.statuses && values.statuses.length > 0) ||
    (values.categories && values.categories.length > 0) ||
    values.branchId ||
    values.assignedTo ||
    values.search ||
    values.dateFrom ||
    values.dateTo ||
    values.hasLicense !== null ||
    values.hasInsurance !== null ||
    values.hasCreditCard !== null

  // Collect active filter tags for display
  const activeFilterTags: { key: string; label: string; color?: string; bgColor?: string }[] = []

  if (values.statuses && values.statuses.length > 0) {
    values.statuses.forEach(s => {
      const badge = getStatusBadge(s)
      activeFilterTags.push({
        key: `status-${s}`,
        label: badge.label,
        color: badge.color,
        bgColor: badge.bgColor,
      })
    })
  }
  if (values.categories && values.categories.length > 0) {
    values.categories.forEach(c => {
      const badge = getCategoryBadge(c)
      activeFilterTags.push({
        key: `category-${c}`,
        label: badge.label,
        color: badge.color,
        bgColor: badge.bgColor,
      })
    })
  }
  if (values.branchId) {
    const branch = branches.find(b => b.id === values.branchId)
    if (branch) activeFilterTags.push({ key: 'branch', label: `접수처: ${branch.name}` })
  }
  if (values.assignedTo) {
    if (values.assignedTo === 'unassigned') {
      activeFilterTags.push({ key: 'assigned', label: '담당자: 미배정' })
    } else {
      const user = users.find(u => u.id === values.assignedTo)
      if (user) activeFilterTags.push({ key: 'assigned', label: `담당자: ${user.name}` })
    }
  }
  if (values.dateFrom || values.dateTo) {
    const from = values.dateFrom ? format(new Date(values.dateFrom), 'MM/dd') : ''
    const to = values.dateTo ? format(new Date(values.dateTo), 'MM/dd') : ''
    activeFilterTags.push({ key: 'date', label: `기간: ${from} ~ ${to}` })
  }
  if (values.hasLicense !== null) {
    activeFilterTags.push({ key: 'license', label: `면허증: ${values.hasLicense ? 'O' : 'X'}` })
  }
  if (values.hasInsurance !== null) {
    activeFilterTags.push({ key: 'insurance', label: `4대보험: ${values.hasInsurance ? 'O' : 'X'}` })
  }
  if (values.hasCreditCard !== null) {
    activeFilterTags.push({ key: 'creditCard', label: `신용카드: ${values.hasCreditCard ? 'O' : 'X'}` })
  }

  return (
    <Card className="py-0 gap-0">
      <CardContent className="py-3 px-4 space-y-2">
        {/* First Row - Main Filters */}
        <div className="flex gap-3 items-center">
          {/* Category */}
          <div className="bg-white/70 rounded-lg px-3 py-2 shadow-md border border-white/80 flex gap-1.5 items-center flex-wrap max-w-[248px]">
            <span className="text-xs text-foreground font-semibold shrink-0">분류</span>
            {visibleCategories.map((badge) => {
              const isSelected = (values.categories || []).includes(badge.id)
              return (
                <button
                  key={badge.id}
                  onClick={() => handleCategoryToggle(badge.id)}
                  className={cn(
                    'flex items-center px-2.5 py-1 cursor-pointer border-2 text-[11px] font-medium transition-all rounded border-l-4',
                    isSelected ? 'border-current shadow-sm' : 'bg-background border-border hover:bg-muted hover:border-primary/30'
                  )}
                  style={isSelected ? {
                    backgroundColor: badge.bgColor,
                    color: badge.color,
                    borderLeftColor: badge.color,
                  } : undefined}
                >
                  {badge.label}
                </button>
              )
            })}
          </div>

          {/* Status */}
          <div className="bg-white/70 rounded-lg px-3 py-2 shadow-md border border-white/80 flex gap-1.5 items-center flex-wrap max-w-[239px]">
            <span className="text-xs text-foreground font-semibold shrink-0">상태</span>
            {visibleStatuses.map((badge) => {
              const isSelected = (values.statuses || []).includes(badge.id)
              return (
                <button
                  key={badge.id}
                  onClick={() => handleStatusToggle(badge.id)}
                  className={cn(
                    'flex items-center px-2.5 py-1 rounded-full cursor-pointer border-2 text-[11px] font-medium transition-all',
                    isSelected ? 'border-current shadow-sm' : 'bg-background border-border hover:bg-muted hover:border-primary/30'
                  )}
                  style={isSelected ? {
                    backgroundColor: badge.bgColor,
                    color: badge.color,
                  } : undefined}
                >
                  {badge.label}
                </button>
              )
            })}
          </div>

          {/* Date Range with Presets */}
          <div className="bg-white/70 rounded-lg px-3 py-2 shadow-md border border-white/80 flex gap-1.5 items-center flex-wrap max-w-[300px]">
            <span className="text-xs text-foreground font-semibold shrink-0">기간</span>
            {[
              { value: 'today' as const, label: '오늘' },
              { value: 'yesterday' as const, label: '어제' },
              { value: 'week' as const, label: '최근7일' },
              { value: 'month' as const, label: '이번달' },
              { value: 'lastMonth' as const, label: '지난달' },
            ].map((preset) => (
              <Button
                key={preset.value}
                variant={datePreset === preset.value ? 'default' : 'outline'}
                size="sm"
                className="h-6 px-2.5 text-xs font-medium"
                onClick={() => handleDatePreset(preset.value)}
              >
                {preset.label}
              </Button>
            ))}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'h-6 w-20 justify-start text-left font-normal text-xs px-1.5',
                    !values.dateFrom && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-0.5 h-3 w-3" />
                  {values.dateFrom ? format(new Date(values.dateFrom), 'MM.dd') : '시작'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={values.dateFrom ? new Date(values.dateFrom) : undefined}
                  onSelect={(date) => setValue('dateFrom', date ? date.toISOString() : null)}
                  locale={ko}
                />
              </PopoverContent>
            </Popover>
            <span className="text-muted-foreground text-xs">~</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'h-6 w-20 justify-start text-left font-normal text-xs px-1.5',
                    !values.dateTo && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-0.5 h-3 w-3" />
                  {values.dateTo ? format(new Date(values.dateTo), 'MM.dd') : '종료'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={values.dateTo ? new Date(values.dateTo) : undefined}
                  onSelect={(date) => setValue('dateTo', date ? date.toISOString() : null)}
                  locale={ko}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Checkboxes */}
          <div className="bg-white/40 rounded-lg px-2.5 py-1.5 shadow-sm flex gap-2 items-center">
            <label className="flex items-center gap-0.5 cursor-pointer">
              <Checkbox
                checked={values.hasLicense === true}
                onCheckedChange={(checked) => setValue('hasLicense', checked ? true : null)}
                className="h-3 w-3"
              />
              <span className="text-xs">면허</span>
            </label>
            <label className="flex items-center gap-0.5 cursor-pointer">
              <Checkbox
                checked={values.hasInsurance === true}
                onCheckedChange={(checked) => setValue('hasInsurance', checked ? true : null)}
                className="h-3 w-3"
              />
              <span className="text-xs">보험</span>
            </label>
            <label className="flex items-center gap-0.5 cursor-pointer">
              <Checkbox
                checked={values.hasCreditCard === true}
                onCheckedChange={(checked) => setValue('hasCreditCard', checked ? true : null)}
                className="h-3 w-3"
              />
              <span className="text-xs">카드</span>
            </label>
          </div>

          {/* Selects */}
          <div className="bg-white/40 rounded-lg px-2.5 py-1.5 shadow-sm flex gap-1.5 items-center">
            <Select value={values.branchId || 'all'} onValueChange={(value) => setValue('branchId', value === 'all' ? null : value)}>
              <SelectTrigger className="w-auto min-w-[140px] h-6 text-xs px-2">
                <SelectValue placeholder="접수처" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">접수처</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={values.assignedTo || 'all'} onValueChange={(value) => setValue('assignedTo', value === 'all' ? null : value)}>
              <SelectTrigger className="w-auto min-w-[140px] h-6 text-xs px-2">
                <SelectValue placeholder="담당자" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">담당자</SelectItem>
                <SelectItem value="unassigned">미배정</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Second Row - Applied Filters */}
        <div className="flex items-center gap-1.5 pt-1 border-t">
          <span className="text-[11px] text-muted-foreground font-medium">적용:</span>
          {activeFilterTags.length > 0 ? (
            <>
              {activeFilterTags.map((tag) => (
                <Badge
                  key={tag.key}
                  variant="secondary"
                  className="text-[10px] px-1 py-0 h-5"
                  style={tag.color && tag.bgColor ? { backgroundColor: tag.bgColor, color: tag.color } : undefined}
                >
                  {tag.label}
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-5 px-1.5 text-[10px] ml-auto">
                <X className="h-3 w-3 mr-0.5" />
                초기화
              </Button>
            </>
          ) : (
            <span className="text-[10px] text-muted-foreground">없음</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
