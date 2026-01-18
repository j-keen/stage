'use client'

import { Header } from '@/components/layout/header'
import { Toaster } from '@/components/ui/sonner'

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden flex-col bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      <Header />
      <main className="flex-1 overflow-hidden p-6">
        <div className="h-full overflow-auto">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  )
}
