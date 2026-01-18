'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDashboardStore, type WidgetConfig } from '@/stores/dashboard-store'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { Save, FolderOpen, ChevronDown, Trash2, Layout, Loader2, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { BUILT_IN_PRESETS, type BuiltInPreset } from '@/lib/dashboard-presets'

interface DashboardPreset {
  id: string
  user_id: string
  name: string
  widgets: WidgetConfig[]
  created_at: string
}

interface PresetManagerProps {
  saveDialogOpen?: boolean
  onSaveDialogOpenChange?: (open: boolean) => void
  loadDialogOpen?: boolean
  onLoadDialogOpenChange?: (open: boolean) => void
  mode?: 'standalone' | 'controlled'
}

export function PresetManager({
  saveDialogOpen,
  onSaveDialogOpenChange,
  loadDialogOpen,
  onLoadDialogOpenChange,
  mode = 'standalone',
}: PresetManagerProps = {}) {
  const { widgets, setWidgets } = useDashboardStore()
  const [presets, setPresets] = useState<DashboardPreset[]>([])
  const [internalSaveOpen, setInternalSaveOpen] = useState(false)
  const [internalLoadOpen, setInternalLoadOpen] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Use controlled or internal state based on mode
  const isSaveOpen = mode === 'controlled' ? saveDialogOpen : internalSaveOpen
  const setIsSaveOpen = mode === 'controlled' ? onSaveDialogOpenChange : setInternalSaveOpen
  const isLoadOpen = mode === 'controlled' ? loadDialogOpen : internalLoadOpen
  const setIsLoadOpen = mode === 'controlled' ? onLoadDialogOpenChange : setInternalLoadOpen

  // Load presets from Supabase
  const loadPresets = useCallback(async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setPresets([])
        return
      }

      const { data, error } = await supabase
        .from('dashboard_presets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading presets:', error)
        toast.error('프리셋을 불러오는데 실패했습니다')
        return
      }

      setPresets(data || [])
    } catch (error) {
      console.error('Error loading presets:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPresets()
  }, [loadPresets])

  const handleSave = async () => {
    if (!presetName.trim()) {
      toast.error('프리셋 이름을 입력해주세요')
      return
    }

    setIsSaving(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('로그인이 필요합니다')
        return
      }

      const { error } = await supabase
        .from('dashboard_presets')
        .insert({
          user_id: user.id,
          name: presetName.trim(),
          widgets: widgets,
        })

      if (error) {
        console.error('Error saving preset:', error)
        toast.error('프리셋 저장에 실패했습니다')
        return
      }

      setPresetName('')
      setIsSaveOpen?.(false)
      toast.success('프리셋이 저장되었습니다')
      loadPresets()
    } catch (error) {
      console.error('Error saving preset:', error)
      toast.error('프리셋 저장에 실패했습니다')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLoad = (preset: DashboardPreset) => {
    setWidgets(JSON.parse(JSON.stringify(preset.widgets)))
    setIsLoadOpen?.(false)
    toast.success(`"${preset.name}" 프리셋을 불러왔습니다`)
  }

  const handleLoadBuiltIn = (preset: BuiltInPreset) => {
    setWidgets(JSON.parse(JSON.stringify(preset.widgets)))
    setIsLoadOpen?.(false)
    toast.success(`"${preset.name}" 레이아웃을 적용했습니다`)
  }

  const handleDelete = async (preset: DashboardPreset) => {
    if (!confirm(`"${preset.name}" 프리셋을 삭제하시겠습니까?`)) {
      return
    }

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('dashboard_presets')
        .delete()
        .eq('id', preset.id)

      if (error) {
        console.error('Error deleting preset:', error)
        toast.error('프리셋 삭제에 실패했습니다')
        return
      }

      toast.success('프리셋이 삭제되었습니다')
      loadPresets()
    } catch (error) {
      console.error('Error deleting preset:', error)
      toast.error('프리셋 삭제에 실패했습니다')
    }
  }

  // In controlled mode, render dialogs only
  if (mode === 'controlled') {
    return (
      <>
        {/* Save Preset Dialog */}
        <Dialog open={isSaveOpen} onOpenChange={(open) => setIsSaveOpen?.(open)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>대시보드 레이아웃 저장</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="레이아웃 이름 (예: 영업팀 대시보드)"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isSaving && handleSave()}
                  disabled={isSaving}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsSaveOpen?.(false)} disabled={isSaving}>
                  취소
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    '저장'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Load Preset Dialog */}
        <Dialog open={isLoadOpen} onOpenChange={(open) => setIsLoadOpen?.(open)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>레이아웃 불러오기</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* 추천 레이아웃 섹션 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">추천 레이아웃</span>
                </div>
                <div className="space-y-1.5">
                  {BUILT_IN_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleLoadBuiltIn(preset)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Layout className="h-4 w-4 text-amber-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{preset.name}</p>
                          <p className="text-xs text-muted-foreground">{preset.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 구분선 */}
              <div className="border-t" />

              {/* 내 레이아웃 섹션 */}
              <div>
                <span className="text-sm font-medium text-muted-foreground">내 레이아웃</span>
                <div className="space-y-1.5 mt-2">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : presets.length === 0 ? (
                    <div className="py-6 text-sm text-muted-foreground text-center">
                      저장된 레이아웃이 없습니다
                    </div>
                  ) : (
                    presets.map((preset) => (
                      <div
                        key={preset.id}
                        className="relative group flex items-center p-2.5 rounded-lg border cursor-pointer transition-colors"
                        onClick={() => handleLoad(preset)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Layout className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{preset.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(preset.created_at), 'yyyy.MM.dd HH:mm', { locale: ko })}
                            </p>
                          </div>
                        </div>
                        {/* 호버 시 표시되는 삭제 오버레이 */}
                        <div className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-destructive/10 rounded-lg transition-all">
                          <button
                            className="flex items-center justify-center h-10 w-10 rounded-full bg-destructive/20 hover:bg-destructive/30 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(preset)
                            }}
                          >
                            <Trash2 className="h-5 w-5 text-destructive" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Standalone mode - original behavior with buttons
  return (
    <div className="flex items-center gap-2">
      {/* Save Preset Dialog */}
      <Dialog open={isSaveOpen} onOpenChange={(open) => setIsSaveOpen?.(open)}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            프리셋 저장
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>대시보드 프리셋 저장</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="프리셋 이름 (예: 영업팀 대시보드)"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isSaving && handleSave()}
                disabled={isSaving}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsSaveOpen?.(false)} disabled={isSaving}>
                취소
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  '저장'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Preset Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FolderOpen className="h-4 w-4 mr-2" />
            )}
            프리셋 불러오기
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {/* 추천 레이아웃 */}
          <div className="px-2 py-1.5 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-medium">추천 레이아웃</span>
          </div>
          {BUILT_IN_PRESETS.map((preset) => (
            <DropdownMenuItem
              key={preset.id}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleLoadBuiltIn(preset)}
            >
              <Layout className="h-4 w-4 text-amber-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium">{preset.name}</p>
                <p className="text-xs text-muted-foreground">{preset.description}</p>
              </div>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          {/* 내 레이아웃 */}
          <div className="px-2 py-1.5">
            <span className="text-xs font-medium text-muted-foreground">내 레이아웃</span>
          </div>
          {presets.length === 0 ? (
            <div className="px-2 py-2 text-xs text-muted-foreground text-center">
              저장된 레이아웃이 없습니다
            </div>
          ) : (
            <>
              {presets.map((preset) => (
                <DropdownMenuItem
                  key={preset.id}
                  className="relative group flex items-center cursor-pointer"
                  onClick={() => handleLoad(preset)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Layout className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{preset.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(preset.created_at), 'MM/dd HH:mm', { locale: ko })}
                      </p>
                    </div>
                  </div>
                  {/* 호버 시 표시되는 삭제 오버레이 */}
                  <div className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-destructive/10 rounded-sm transition-all">
                    <button
                      className="flex items-center justify-center h-8 w-8 rounded-full bg-destructive/20 hover:bg-destructive/30 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(preset)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
