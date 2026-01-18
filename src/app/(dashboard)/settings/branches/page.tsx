'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Loader2, Plus, Pencil, Copy, Eye } from 'lucide-react'
import type { Branch } from '@/types/database'
import { LandingPreview } from '@/components/landing/landing-preview'

interface LandingSettings {
  title?: string
  description?: string
  buttonText?: string
  successMessage?: string
  privacyText?: string
}

export default function BranchesSettingsPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true,
    landingSettings: {
      title: '',
      description: '',
      buttonText: '',
      successMessage: '',
      privacyText: '',
    } as LandingSettings,
  })

  const fetchData = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('branches')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setBranches(data)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleOpenDialog = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch)
      const settings = branch.landing_settings || {}
      setFormData({
        name: branch.name,
        slug: branch.slug,
        description: branch.description || '',
        isActive: branch.is_active,
        landingSettings: {
          title: settings.title || '',
          description: settings.description || '',
          buttonText: settings.buttonText || '',
          successMessage: settings.successMessage || '',
          privacyText: settings.privacyText || '',
        },
      })
    } else {
      setEditingBranch(null)
      setFormData({
        name: '',
        slug: '',
        description: '',
        isActive: true,
        landingSettings: {
          title: '',
          description: '',
          buttonText: '',
          successMessage: '',
          privacyText: '',
        },
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug) {
      toast.error('필수 항목을 입력해주세요')
      return
    }

    // slug 검증: 영문, 숫자, 하이픈만 허용
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      toast.error('URL 슬러그는 영문 소문자, 숫자, 하이픈(-)만 사용 가능합니다')
      return
    }

    const supabase = createClient()

    // landing_settings에서 빈 값 제거
    const cleanedSettings: LandingSettings = {}
    if (formData.landingSettings.title) cleanedSettings.title = formData.landingSettings.title
    if (formData.landingSettings.description) cleanedSettings.description = formData.landingSettings.description
    if (formData.landingSettings.buttonText) cleanedSettings.buttonText = formData.landingSettings.buttonText
    if (formData.landingSettings.successMessage) cleanedSettings.successMessage = formData.landingSettings.successMessage
    if (formData.landingSettings.privacyText) cleanedSettings.privacyText = formData.landingSettings.privacyText

    const data = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      is_active: formData.isActive,
      landing_settings: Object.keys(cleanedSettings).length > 0 ? cleanedSettings : null,
    }

    const { error } = editingBranch
      ? await supabase.from('branches').update(data).eq('id', editingBranch.id)
      : await supabase.from('branches').insert(data)

    if (error) {
      if (error.code === '23505') {
        toast.error('이미 사용 중인 슬러그입니다')
      } else {
        toast.error('저장 실패')
      }
    } else {
      toast.success(editingBranch ? '수정되었습니다' : '생성되었습니다')
      setIsDialogOpen(false)
      fetchData()
    }
  }

  const copyLandingUrl = (slug: string) => {
    const url = `${window.location.origin}/landing/${slug}`
    navigator.clipboard.writeText(url)
    toast.success('URL이 복사되었습니다')
  }

  const toggleBranchActive = async (branch: Branch) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('branches')
      .update({ is_active: !branch.is_active })
      .eq('id', branch.id)

    if (error) {
      toast.error('상태 변경 실패')
    } else {
      toast.success(branch.is_active ? '비활성화되었습니다' : '활성화되었습니다')
      fetchData()
    }
  }

  // 미리보기용 데이터 생성
  const getPreviewBranch = () => ({
    id: editingBranch?.id || 'preview',
    name: formData.name || '접수처',
    slug: formData.slug || 'preview',
    description: formData.description || null,
    logo_url: null,
    primary_color: '#3b82f6',
    is_active: formData.isActive,
    landing_settings: {
      title: formData.landingSettings.title || undefined,
      description: formData.landingSettings.description || undefined,
      buttonText: formData.landingSettings.buttonText || undefined,
      successMessage: formData.landingSettings.successMessage || undefined,
      privacyText: formData.landingSettings.privacyText || undefined,
    },
    created_at: '',
    updated_at: '',
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">접수처 관리</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-1" />
              추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBranch ? '접수처 수정' : '접수처 추가'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* 기본 정보 섹션 */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">기본 정보</h3>

                <div className="space-y-2">
                  <Label>내부 이름 *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="네이버광고_A (내부 관리용)"
                  />
                  <p className="text-xs text-muted-foreground">랜딩페이지에 표시되지 않습니다</p>
                </div>

                <div className="space-y-2">
                  <Label>URL 슬러그 *</Label>
                  <div className="flex gap-2 items-center">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      /landing/
                    </span>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                      placeholder="naver-a"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">영문 소문자, 숫자, 하이픈(-)만 사용</p>
                </div>

                <div className="space-y-2">
                  <Label>내부 메모</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="마케팅팀 담당, 예산 100만원 등"
                    rows={2}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>활성 상태</Label>
                    <p className="text-xs text-muted-foreground">비활성화하면 랜딩페이지 접근 불가</p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>
              </div>

              <Separator />

              {/* 랜딩페이지 설정 섹션 */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">랜딩페이지 설정</h3>

                <div className="space-y-2">
                  <Label>표시 제목</Label>
                  <Input
                    value={formData.landingSettings.title}
                    onChange={(e) => setFormData({
                      ...formData,
                      landingSettings: { ...formData.landingSettings, title: e.target.value }
                    })}
                    placeholder="무료 상담 신청"
                  />
                </div>

                <div className="space-y-2">
                  <Label>표시 설명</Label>
                  <Textarea
                    value={formData.landingSettings.description}
                    onChange={(e) => setFormData({
                      ...formData,
                      landingSettings: { ...formData.landingSettings, description: e.target.value }
                    })}
                    placeholder="지금 바로 무료 상담 받으세요"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>버튼 텍스트</Label>
                  <Input
                    value={formData.landingSettings.buttonText}
                    onChange={(e) => setFormData({
                      ...formData,
                      landingSettings: { ...formData.landingSettings, buttonText: e.target.value }
                    })}
                    placeholder="상담 신청하기 (기본값)"
                  />
                </div>

                <div className="space-y-2">
                  <Label>성공 메시지</Label>
                  <Input
                    value={formData.landingSettings.successMessage}
                    onChange={(e) => setFormData({
                      ...formData,
                      landingSettings: { ...formData.landingSettings, successMessage: e.target.value }
                    })}
                    placeholder="상담 신청이 완료되었습니다 (기본값)"
                  />
                </div>

                <div className="space-y-2">
                  <Label>안내문</Label>
                  <Input
                    value={formData.landingSettings.privacyText}
                    onChange={(e) => setFormData({
                      ...formData,
                      landingSettings: { ...formData.landingSettings, privacyText: e.target.value }
                    })}
                    placeholder="개인정보 수집 및 이용에 동의합니다. (기본값)"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex justify-between gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsPreviewOpen(true)}
                  type="button"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  미리보기
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    취소
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editingBranch ? '수정' : '생성'}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {branches.map((branch) => (
          <Card
            key={branch.id}
            className={`p-3 ${!branch.is_active ? 'opacity-50' : ''}`}
          >
            <CardContent className="p-0 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-sm truncate">{branch.name}</span>
                  {!branch.is_active && (
                    <Badge variant="secondary" className="text-[10px] px-1 py-0">
                      비활성
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 flex-shrink-0"
                  onClick={() => handleOpenDialog(branch)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </div>
              <code className="text-xs text-muted-foreground block">
                /{branch.slug}
              </code>
              {branch.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {branch.description}
                </p>
              )}
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-7 text-xs"
                  onClick={() => copyLandingUrl(branch.slug)}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  URL 복사
                </Button>
                <Button
                  variant={branch.is_active ? "ghost" : "default"}
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() => toggleBranchActive(branch)}
                >
                  {branch.is_active ? '끄기' : '켜기'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 미리보기 모달 */}
      <LandingPreview
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        branch={getPreviewBranch()}
      />
    </div>
  )
}
