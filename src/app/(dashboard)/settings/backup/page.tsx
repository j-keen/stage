'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Loader2, Download, Upload, AlertTriangle, Database, Clock, FileText, FileSpreadsheet } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { usePermissions } from '@/hooks/use-permissions'
import { useSettingsStore } from '@/stores/settings-store'

export default function BackupSettingsPage() {
  const [isExporting, setIsExporting] = useState(false)
  const [isExportingCSV, setIsExportingCSV] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [lastBackup, setLastBackup] = useState<Date | null>(null)
  const { canExportCustomers } = usePermissions()
  const { loadSettings, getColumnLabel, isLoaded } = useSettingsStore()

  useEffect(() => {
    if (!isLoaded) {
      loadSettings()
    }
  }, [isLoaded, loadSettings])

  const canExport = canExportCustomers

  const handleExportJSON = async () => {
    setIsExporting(true)

    try {
      const supabase = createClient()

      const [
        customersRes,
        usersRes,
        teamsRes,
        branchesRes,
        rolesRes,
        settingsRes,
      ] = await Promise.all([
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

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json',
      })
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
      console.error('Export error:', error)
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
        .select(`
          *,
          branch:branch_id(name),
          assigned_user:assigned_to(name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Define CSV columns with labels from settings
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

      // Generate CSV header
      const header = columns.map(col => `"${col.label}"`).join(',')

      // Generate CSV rows
      const rows = customers?.map((customer: Record<string, unknown> & {
        assigned_user?: { name?: string } | null
        branch?: { name?: string } | null
      }) => {
        return columns.map(col => {
          let value: string = ''

          switch (col.key) {
            case 'assigned_user':
              value = customer.assigned_user?.name || ''
              break
            case 'branch':
              value = customer.branch?.name || ''
              break
            case 'gender':
              value = customer.gender === 'male' ? '남성' : customer.gender === 'female' ? '여성' : ''
              break
            case 'has_overdue':
            case 'has_license':
            case 'has_insurance':
            case 'has_credit_card':
              value = customer[col.key] ? '있음' : '없음'
              break
            case 'created_at':
            case 'updated_at':
              value = customer[col.key] ? format(new Date(customer[col.key] as string), 'yyyy-MM-dd HH:mm:ss') : ''
              break
            default:
              value = customer[col.key]?.toString() || ''
          }

          // Escape quotes and wrap in quotes
          return `"${value.replace(/"/g, '""')}"`
        }).join(',')
      }) || []

      // Combine header and rows with BOM for Excel Korean support
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
      console.error('CSV Export error:', error)
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

      if (!backupData.version || !backupData.data) {
        throw new Error('유효하지 않은 백업 파일입니다')
      }

      const supabase = createClient()

      if (backupData.data.settings?.length > 0) {
        for (const setting of backupData.data.settings) {
          await supabase
            .from('settings')
            .upsert({ key: setting.key, value: setting.value })
        }
      }

      toast.success('설정이 복원되었습니다')
      toast.info('전체 데이터 복원은 관리자에게 문의하세요')
    } catch (error) {
      console.error('Import error:', error)
      toast.error('복원 중 오류가 발생했습니다')
    } finally {
      setIsImporting(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">백업 및 내보내기</h1>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>주의</AlertTitle>
        <AlertDescription>
          데이터 복원 시 기존 데이터가 영향을 받을 수 있습니다.
          복원 전에 반드시 백업을 먼저 수행해주세요.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="export">
        <TabsList>
          <TabsTrigger value="export">내보내기</TabsTrigger>
          <TabsTrigger value="backup">백업/복원</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  CSV 내보내기
                </CardTitle>
                <CardDescription>
                  고객 데이터를 CSV 파일로 내보냅니다. Excel에서 바로 열 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>내보내기 항목:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>모든 고객 정보</li>
                    <li>분류 및 상태</li>
                    <li>담당자 및 접수처</li>
                    <li>설정된 컬럼 명칭 적용</li>
                  </ul>
                </div>

                {!canExport && (
                  <div className="text-sm text-orange-600">
                    내보내기 권한이 필요합니다.
                  </div>
                )}

                <Button
                  onClick={handleExportCSV}
                  disabled={isExportingCSV || !canExport}
                  className="w-full"
                >
                  {isExportingCSV ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      내보내는 중...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      CSV 다운로드
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  JSON 백업
                </CardTitle>
                <CardDescription>
                  전체 시스템 데이터를 JSON 형식으로 백업합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>백업 항목:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>고객 정보</li>
                    <li>사용자 계정</li>
                    <li>팀/조직 구조</li>
                    <li>시스템 설정</li>
                  </ul>
                </div>

                {lastBackup && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    마지막 백업: {format(lastBackup, 'yyyy-MM-dd HH:mm:ss', { locale: ko })}
                  </div>
                )}

                <Button onClick={handleExportJSON} disabled={isExporting} className="w-full" variant="outline">
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      백업 중...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      JSON 백업 다운로드
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  데이터 백업
                </CardTitle>
                <CardDescription>
                  현재 시스템의 모든 데이터를 JSON 파일로 내보냅니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>백업 항목:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>고객 정보</li>
                    <li>사용자 계정 (비밀번호 제외)</li>
                    <li>팀/조직 구조</li>
                    <li>접수처 설정</li>
                    <li>역할 및 권한</li>
                    <li>시스템 설정</li>
                  </ul>
                </div>

                <Button onClick={handleExportJSON} disabled={isExporting} className="w-full">
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      백업 중...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      백업 다운로드
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  데이터 복원
                </CardTitle>
                <CardDescription>
                  백업 파일에서 데이터를 복원합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>복원 가능 항목:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>시스템 설정 (브랜딩, 컬럼 명칭, 뱃지 등)</li>
                  </ul>
                  <p className="mt-4 text-orange-600">
                    고객 및 사용자 데이터 복원은 관리자에게 문의하세요.
                  </p>
                </div>

                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    disabled={isImporting}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" disabled={isImporting} className="w-full">
                    {isImporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        복원 중...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        백업 파일 선택
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                데이터베이스 정보
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>
                  이 CRM 시스템은 Supabase를 사용하여 데이터를 관리합니다.
                  대규모 데이터 복원이나 마이그레이션은 Supabase 대시보드에서 직접 수행하는 것을 권장합니다.
                </p>
                <p className="mt-2">
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Supabase 대시보드 열기
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
