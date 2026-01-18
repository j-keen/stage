'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Loader2,
  Download,
  Upload,
  Clock,
  FileSpreadsheet,
  Building2,
  Save,
  Pencil,
  X
} from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { usePermissions } from '@/hooks/use-permissions'
import { useSettingsStore } from '@/stores/settings-store'
import { ImageUpload } from '@/components/settings/image-upload'

interface BrandingSettings {
  companyName: string
  tabTitle: string
  logoUrl: string | null
  faviconUrl: string | null
}

const DEFAULT_BRANDING: BrandingSettings = {
  companyName: 'CRM',
  tabTitle: 'CRM',
  logoUrl: null,
  faviconUrl: null,
}

export default function SystemSettingsPage() {
  const [lastBackup, setLastBackup] = useState<Date | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isExportingCSV, setIsExportingCSV] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const { canExportCustomers } = usePermissions()
  const { loadSettings, getColumnLabel, isLoaded } = useSettingsStore()

  const [branding, setBranding] = useState<BrandingSettings>(DEFAULT_BRANDING)
  const [originalBranding, setOriginalBranding] = useState<BrandingSettings | null>(null)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!isLoaded) loadSettings()
  }, [isLoaded, loadSettings])

  useEffect(() => {
    const fetchSettings = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'branding')
        .single()

      if (!error && data) {
        setBranding({ ...DEFAULT_BRANDING, ...(data.value as Partial<BrandingSettings>) })
      }
      setIsLoadingSettings(false)
    }

    fetchSettings()
  }, [])

  const canExport = canExportCustomers

  // 변경사항 있는지 확인
  const hasChanges = isEditing && originalBranding && JSON.stringify(branding) !== JSON.stringify(originalBranding)

  // 페이지 이탈 경고
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasChanges])

  const handleStartEdit = () => {
    setOriginalBranding(branding)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    if (originalBranding) setBranding(originalBranding)
    setIsEditing(false)
    setOriginalBranding(null)
  }

  const handleSaveBranding = async () => {
    setIsSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('settings').upsert(
      { key: 'branding', value: branding },
      { onConflict: 'key' }
    )

    if (error) {
      toast.error('저장 중 오류가 발생했습니다')
    } else {
      toast.success('저장되었습니다')
      if (branding.tabTitle) document.title = branding.tabTitle
      window.dispatchEvent(new Event('branding-updated'))
      setIsEditing(false)
      setOriginalBranding(null)
    }
    setIsSaving(false)
  }

  const handleExportJSON = async () => {
    setIsExporting(true)
    try {
      const supabase = createClient()
      const [customersRes, usersRes, teamsRes, branchesRes, rolesRes, settingsRes] = await Promise.all([
        supabase.from('customers').select('*'),
        supabase.from('users').select('*'),
        supabase.from('teams').select('*'),
        supabase.from('branches').select('*'),
        supabase.from('roles').select('*'),
        supabase.from('settings').select('*'),
      ])

      const backupData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        data: {
          customers: customersRes.data || [],
          users: usersRes.data || [],
          teams: teamsRes.data || [],
          branches: branchesRes.data || [],
          roles: rolesRes.data || [],
          settings: settingsRes.data || [],
        },
      }

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `crm-backup-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setLastBackup(new Date())
      toast.success('백업이 완료되었습니다')
    } catch (error) {
      toast.error('백업 중 오류가 발생했습니다')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportCSV = async () => {
    if (!canExport) {
      toast.error('내보내기 권한이 없습니다')
      return
    }

    setIsExportingCSV(true)
    try {
      const supabase = createClient()
      const { data: customers, error } = await supabase
        .from('customers')
        .select(`*, branch:branch_id(name), assigned_user:assigned_to(name)`)
        .order('created_at', { ascending: false })

      if (error) throw error

      const columns = [
        { key: 'category', label: getColumnLabel('category') },
        { key: 'status', label: getColumnLabel('status') },
        { key: 'name', label: getColumnLabel('name') },
        { key: 'phone', label: getColumnLabel('phone') },
        { key: 'birth_date', label: getColumnLabel('birth_date') },
        { key: 'gender', label: getColumnLabel('gender') },
        { key: 'address', label: getColumnLabel('address') },
        { key: 'occupation', label: getColumnLabel('occupation') },
        { key: 'income', label: getColumnLabel('income') },
        { key: 'employment_period', label: getColumnLabel('employment_period') },
        { key: 'existing_loans', label: getColumnLabel('existing_loans') },
        { key: 'credit_score', label: getColumnLabel('credit_score') },
        { key: 'required_amount', label: getColumnLabel('required_amount') },
        { key: 'fund_purpose', label: getColumnLabel('fund_purpose') },
        { key: 'has_overdue', label: getColumnLabel('has_overdue') },
        { key: 'has_license', label: getColumnLabel('has_license') },
        { key: 'has_insurance', label: getColumnLabel('has_insurance') },
        { key: 'has_credit_card', label: getColumnLabel('has_credit_card') },
        { key: 'assigned_user', label: getColumnLabel('assigned_to') },
        { key: 'branch', label: getColumnLabel('branch_id') },
        { key: 'notes', label: getColumnLabel('notes') },
        { key: 'created_at', label: getColumnLabel('created_at') },
        { key: 'updated_at', label: getColumnLabel('updated_at') },
      ]

      const header = columns.map(col => `"${col.label}"`).join(',')
      const rows = customers?.map((customer: Record<string, unknown> & { assigned_user?: { name?: string } | null; branch?: { name?: string } | null }) => {
        return columns.map(col => {
          let value = ''
          switch (col.key) {
            case 'assigned_user': value = customer.assigned_user?.name || ''; break
            case 'branch': value = customer.branch?.name || ''; break
            case 'gender': value = customer.gender === 'male' ? '남성' : customer.gender === 'female' ? '여성' : ''; break
            case 'has_overdue':
            case 'has_license':
            case 'has_insurance':
            case 'has_credit_card': value = customer[col.key] ? '있음' : '없음'; break
            case 'created_at':
            case 'updated_at': value = customer[col.key] ? format(new Date(customer[col.key] as string), 'yyyy-MM-dd HH:mm:ss') : ''; break
            default: value = customer[col.key]?.toString() || ''
          }
          return `"${value.replace(/"/g, '""')}"`
        }).join(',')
      }) || []

      const BOM = '\uFEFF'
      const csvContent = BOM + [header, ...rows].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `customers-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('CSV 내보내기가 완료되었습니다')
    } catch (error) {
      toast.error('CSV 내보내기 중 오류가 발생했습니다')
    } finally {
      setIsExportingCSV(false)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!confirm('기존 데이터가 덮어씌워질 수 있습니다. 계속하시겠습니까?')) {
      e.target.value = ''
      return
    }

    setIsImporting(true)
    try {
      const text = await file.text()
      const backupData = JSON.parse(text)
      if (!backupData.version || !backupData.data) throw new Error('유효하지 않은 백업 파일입니다')

      const supabase = createClient()
      if (backupData.data.settings?.length > 0) {
        for (const setting of backupData.data.settings) {
          await supabase.from('settings').upsert({ key: setting.key, value: setting.value })
        }
      }
      toast.success('설정이 복원되었습니다')
      toast.info('전체 데이터 복원은 관리자에게 문의하세요')
    } catch (error) {
      toast.error('복원 중 오류가 발생했습니다')
    } finally {
      setIsImporting(false)
      e.target.value = ''
    }
  }

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">시스템 설정</h1>

      {/* 브랜딩 섹션 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" />
              브랜딩
            </CardTitle>
            {isEditing ? (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                  <X className="h-3.5 w-3.5 mr-1" />
                  취소
                </Button>
                <Button size="sm" onClick={handleSaveBranding} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                  저장
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={handleStartEdit}>
                <Pencil className="h-3.5 w-3.5 mr-1" />
                수정
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">회사명</Label>
                  <Input
                    value={branding.companyName}
                    onChange={(e) => setBranding({ ...branding, companyName: e.target.value })}
                    placeholder="회사명"
                    className="h-8"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">브라우저 탭 이름</Label>
                  <Input
                    value={branding.tabTitle}
                    onChange={(e) => setBranding({ ...branding, tabTitle: e.target.value })}
                    placeholder="CRM"
                    className="h-8"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">로고</Label>
                  <ImageUpload
                    value={branding.logoUrl}
                    onChange={(url) => setBranding({ ...branding, logoUrl: url })}
                    accept="image/png,image/svg+xml"
                    maxWidth={180}
                    maxHeight={40}
                    label="로고"
                    description="PNG/SVG"
                    compact
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">파비콘</Label>
                  <ImageUpload
                    value={branding.faviconUrl}
                    onChange={(url) => setBranding({ ...branding, faviconUrl: url })}
                    accept="image/png,image/x-icon"
                    maxWidth={32}
                    maxHeight={32}
                    label="파비콘"
                    description="ICO/PNG"
                    compact
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">회사명</p>
                  <p className="text-sm font-medium">{branding.companyName || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">브라우저 탭 이름</p>
                  <p className="text-sm font-medium">{branding.tabTitle || '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">로고</p>
                  {branding.logoUrl ? (
                    <img src={branding.logoUrl} alt="로고" className="h-8 max-w-[140px] object-contain" />
                  ) : (
                    <p className="text-sm text-muted-foreground">설정 안됨</p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">파비콘</p>
                  {branding.faviconUrl ? (
                    <img src={branding.faviconUrl} alt="파비콘" className="h-6 w-6 object-contain" />
                  ) : (
                    <p className="text-sm text-muted-foreground">설정 안됨</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 백업/복원 섹션 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Download className="h-4 w-4" />
            백업 / 복원
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* CSV 내보내기 */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">CSV 내보내기</p>
                <p className="text-xs text-muted-foreground">고객 데이터를 CSV로 다운로드</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportCSV}
              disabled={isExportingCSV || !canExport}
            >
              {isExportingCSV ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : '내보내기'}
            </Button>
          </div>

          <Separator />

          {/* JSON 백업 */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Download className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">JSON 백업</p>
                <p className="text-xs text-muted-foreground">
                  전체 시스템 데이터 백업
                  {lastBackup && (
                    <span className="ml-1 inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(lastBackup, 'HH:mm', { locale: ko })}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportJSON}
              disabled={isExporting}
            >
              {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : '백업'}
            </Button>
          </div>

          <Separator />

          {/* 데이터 복원 */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">데이터 복원</p>
                <p className="text-xs text-muted-foreground">백업 파일에서 설정 복원</p>
              </div>
            </div>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button size="sm" variant="outline" disabled={isImporting}>
                {isImporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : '복원'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
