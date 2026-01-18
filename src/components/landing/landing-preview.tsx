'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle } from 'lucide-react'
import { useState } from 'react'

interface LandingSettings {
  title?: string
  description?: string
  buttonText?: string
  successMessage?: string
  privacyText?: string
}

interface PreviewBranch {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  primary_color: string
  is_active: boolean
  landing_settings: LandingSettings | null
}

interface LandingPreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  branch: PreviewBranch
}

export function LandingPreview({ open, onOpenChange, branch }: LandingPreviewProps) {
  const [showSuccess, setShowSuccess] = useState(false)

  // landing_settings에서 값 가져오기 (없으면 기본값)
  const settings = branch.landing_settings || {}
  const title = settings.title || ''
  const description = settings.description || ''
  const buttonText = settings.buttonText || '상담 신청하기'
  const successMessage = settings.successMessage || '상담 신청이 완료되었습니다'
  const privacyText = settings.privacyText || '개인정보 수집 및 이용에 동의합니다.'

  const handleReset = () => {
    setShowSuccess(false)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen)
      if (!isOpen) setShowSuccess(false)
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>랜딩페이지 미리보기</DialogTitle>
        </DialogHeader>

        <div
          className="rounded-lg p-4 -mx-2"
          style={{
            background: `linear-gradient(135deg, ${branch.primary_color}10 0%, ${branch.primary_color}05 100%)`,
          }}
        >
          {showSuccess ? (
            <Card className="w-full">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div
                    className="h-16 w-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${branch.primary_color}20` }}
                  >
                    <CheckCircle
                      className="h-8 w-8"
                      style={{ color: branch.primary_color }}
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{successMessage}</h3>
                  </div>
                  <Button variant="outline" onClick={handleReset}>
                    새로운 상담 신청
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="w-full">
              <CardHeader className="text-center">
                {branch.logo_url && (
                  <div className="flex justify-center mb-4">
                    <img
                      src={branch.logo_url}
                      alt="로고"
                      className="h-12 object-contain"
                    />
                  </div>
                )}
                {title && (
                  <CardTitle style={{ color: branch.primary_color }}>
                    {title}
                  </CardTitle>
                )}
                {description && (
                  <CardDescription>{description}</CardDescription>
                )}
                {!title && !description && (
                  <p className="text-sm text-muted-foreground">
                    표시 제목/설명을 입력하세요
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>
                      전화번호 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="010-0000-0000"
                      disabled
                    />
                  </div>

                  <Button
                    className="w-full"
                    style={{
                      backgroundColor: branch.primary_color,
                      borderColor: branch.primary_color,
                    }}
                    onClick={() => setShowSuccess(true)}
                  >
                    {buttonText}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    {privacyText}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
