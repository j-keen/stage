'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { usePermissions } from '@/hooks/use-permissions'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Users,
  Settings,
  Building2,
  Palette,
  Columns3,
  Cog,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface BrandingSettings {
  companyName: string
  logoUrl: string | null
  faviconUrl: string | null
}

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission?: () => boolean
  children?: Omit<NavItem, 'children'>[]
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [branding, setBranding] = useState<BrandingSettings>({ companyName: 'CRM', logoUrl: null, faviconUrl: null })
  const {
    canViewDashboard,
    canViewCustomers,
    canViewSettings,
    canViewUsers,
    canViewTeams,
    canViewBranches,
    isSuperAdmin,
  } = usePermissions()

  useEffect(() => {
    const fetchBranding = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'branding')
        .single()

      if (!error && data) {
        const settings = data.value as BrandingSettings
        setBranding({
          companyName: settings.companyName || 'CRM',
          logoUrl: settings.logoUrl || null,
          faviconUrl: settings.faviconUrl || null,
        })

        // 파비콘 동적 적용
        if (settings.faviconUrl) {
          let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
          if (!favicon) {
            favicon = document.createElement('link')
            favicon.rel = 'icon'
            document.head.appendChild(favicon)
          }
          favicon.href = settings.faviconUrl
        }

        // 탭 제목 적용
        if ((settings as { tabTitle?: string }).tabTitle) {
          document.title = (settings as { tabTitle?: string }).tabTitle!
        }
      }
    }

    fetchBranding()

    // 브랜딩 업데이트 이벤트 수신
    const handleBrandingUpdate = () => {
      fetchBranding()
    }
    window.addEventListener('branding-updated', handleBrandingUpdate)

    return () => {
      window.removeEventListener('branding-updated', handleBrandingUpdate)
    }
  }, [])

  const navItems: NavItem[] = [
    {
      title: '대시보드',
      href: '/dashboard',
      icon: LayoutDashboard,
      permission: () => canViewDashboard,
    },
    {
      title: '고객 관리',
      href: '/customers',
      icon: Users,
      permission: () => canViewCustomers,
    },
    {
      title: '설정',
      href: '/settings',
      icon: Settings,
      permission: () => canViewSettings || isSuperAdmin,
      children: [
        {
          title: '브랜딩',
          href: '/settings/branding',
          icon: Palette,
          permission: () => canViewSettings,
        },
        {
          title: '표시 설정',
          href: '/settings/display',
          icon: Columns3,
          permission: () => canViewSettings,
        },
        {
          title: '인력 관리',
          href: '/settings/members',
          icon: Users,
          permission: () => canViewUsers || canViewTeams || isSuperAdmin,
        },
        {
          title: '접수처 관리',
          href: '/settings/branches',
          icon: Building2,
          permission: () => canViewBranches,
        },
        {
          title: '시스템',
          href: '/settings/system',
          icon: Cog,
          permission: () => isSuperAdmin,
        },
      ],
    },
  ]

  const renderNavItem = (item: NavItem, depth = 0) => {
    if (item.permission && !item.permission()) {
      return null
    }

    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
    const Icon = item.icon

    if (item.children && item.children.length > 0) {
      const visibleChildren = item.children.filter(
        (child) => !child.permission || child.permission()
      )

      if (visibleChildren.length === 0) return null

      return (
        <div key={item.href} className="space-y-1">
          <div
            className={cn(
              'flex items-center px-3 py-2 text-sm font-medium text-muted-foreground',
              isCollapsed && 'justify-center px-2'
            )}
          >
            <Icon className={cn('h-4 w-4', !isCollapsed && 'mr-2')} />
            {!isCollapsed && <span>{item.title}</span>}
          </div>
          {!isCollapsed && (
            <div className="ml-4 space-y-1">
              {visibleChildren.map((child) => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link key={item.href} href={item.href}>
        <Button
          variant={isActive ? 'secondary' : 'ghost'}
          className={cn(
            'w-full justify-start',
            isCollapsed && 'justify-center px-2',
            depth > 0 && 'text-sm'
          )}
        >
          <Icon className={cn('h-4 w-4', !isCollapsed && 'mr-2')} />
          {!isCollapsed && <span>{item.title}</span>}
        </Button>
      </Link>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col border-r bg-background transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            {branding.logoUrl && (
              <img
                src={branding.logoUrl}
                alt={branding.companyName}
                className="h-7 max-w-[100px] object-contain"
              />
            )}
            <span className="font-semibold text-lg">{branding.companyName}</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn('ml-auto', isCollapsed && 'mx-auto')}
          onClick={onToggle}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => renderNavItem(item))}
        </nav>
      </ScrollArea>
    </div>
  )
}
