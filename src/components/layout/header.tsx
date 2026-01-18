'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useUser } from '@/hooks/use-user'
import { usePermissions } from '@/hooks/use-permissions'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Users,
  Settings,
  Building2,
  Palette,
  Columns3,
  Cog,
  LogOut,
  User,
  Bell,
  ChevronDown,
} from 'lucide-react'

interface BrandingSettings {
  companyName: string
  logoUrl: string | null
  faviconUrl: string | null
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission?: () => boolean
  children?: Omit<NavItem, 'children'>[]
}

export function Header() {
  const { user, role, signOut } = useUser()
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

        if (settings.faviconUrl) {
          let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
          if (!favicon) {
            favicon = document.createElement('link')
            favicon.rel = 'icon'
            document.head.appendChild(favicon)
          }
          favicon.href = settings.faviconUrl
        }

        if ((settings as { tabTitle?: string }).tabTitle) {
          document.title = (settings as { tabTitle?: string }).tabTitle!
        }
      }
    }

    fetchBranding()

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const renderNavItem = (item: NavItem) => {
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
        <DropdownMenu key={item.href}>
          <DropdownMenuTrigger asChild>
            <Button
              variant={isActive ? 'secondary' : 'ghost'}
              size="sm"
              className="gap-1"
            >
              <Icon className="h-4 w-4" />
              <span>{item.title}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {visibleChildren.map((child) => {
              const ChildIcon = child.icon
              const isChildActive = pathname === child.href || pathname.startsWith(`${child.href}/`)
              return (
                <DropdownMenuItem key={child.href} asChild>
                  <Link href={child.href} className={cn(isChildActive && 'bg-secondary')}>
                    <ChildIcon className="h-4 w-4 mr-2" />
                    <span>{child.title}</span>
                  </Link>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    return (
      <Link key={item.href} href={item.href}>
        <Button
          variant={isActive ? 'secondary' : 'ghost'}
          size="sm"
          className="gap-1"
        >
          <Icon className="h-4 w-4" />
          <span>{item.title}</span>
        </Button>
      </Link>
    )
  }

  return (
    <header className="flex h-16 items-center border-b bg-white/80 backdrop-blur-xl px-6 gap-6 shadow-sm">
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

      <nav className="flex items-center gap-1">
        {navItems.map((item) => renderNavItem(item))}
      </nav>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.name ? getInitials(user.name) : <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {role?.name === 'super_admin' && '시스템 관리자'}
                  {role?.name === 'manager' && '매니저'}
                  {role?.name === 'consultant' && '상담사'}
                  {role?.name === 'agent' && '에이전트'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>로그아웃</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
