'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User } from 'lucide-react'
import Link from 'next/link'

interface AccountInfoWidgetProps {
  userName?: string
  userEmail?: string
  userRole?: string
  totalCustomers?: number
  completedCount?: number
  isLoading?: boolean
  dimensions?: { width: number; height: number }
  gridSize?: { w: number; h: number }
}

export function AccountInfoWidget({
  userName = 'Admin',
  userEmail = 'admin@example.com',
  userRole = '관리자',
  totalCustomers = 0,
  completedCount = 0,
  isLoading,
}: AccountInfoWidgetProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center gap-6 p-4 h-full">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="ml-auto flex gap-8">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full bg-white border-slate-200/60 shadow-sm">
      <CardContent className="flex items-center gap-6 p-4 h-full">
        {/* User Avatar & Info */}
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-slate-100">
            <AvatarFallback className="bg-slate-100 text-slate-600 text-sm font-medium">
              {userName ? getInitials(userName) : <User className="h-5 w-5" />}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-slate-900">{userName}</h3>
            <p className="text-sm text-slate-500">{userEmail}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-10 w-px bg-slate-200 mx-2" />

        {/* Stats Section */}
        <div className="flex items-center gap-8 ml-auto">
          {/* Total Customers */}
          <div className="flex items-center gap-3">
            <div>
              <span className="text-2xl font-bold text-slate-900">
                {totalCustomers.toLocaleString()}
              </span>
            </div>
            <div className="text-sm">
              <p className="text-slate-500">총 접수</p>
              <Link href="/customers" className="text-blue-600 hover:underline text-xs">
                보기
              </Link>
            </div>
          </div>

          {/* Divider */}
          <div className="h-10 w-px bg-slate-200" />

          {/* Completed */}
          <div className="flex items-center gap-3">
            <div>
              <span className="text-2xl font-bold text-slate-900">
                {completedCount.toLocaleString()}
              </span>
            </div>
            <div className="text-sm">
              <p className="text-slate-500">완료</p>
              <Link href="/customers?status=completed" className="text-blue-600 hover:underline text-xs">
                보기
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
