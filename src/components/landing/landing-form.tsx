'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PhoneInput } from './phone-input'
import { Loader2, CheckCircle } from 'lucide-react'

interface LandingSettings {
  title?: string
  description?: string
  buttonText?: string
  successMessage?: string
  privacyText?: string
}

interface LandingFormProps {
  branch: {
    id: string
    name: string
    slug: string
    description: string | null
    logo_url: string | null
    primary_color: string
    landing_settings?: LandingSettings | null
  }
}

export function LandingForm({ branch }: LandingFormProps) {
  const searchParams = useSearchParams()
  const [phone, setPhone] = useState('')
  const [isDuplicate, setIsDuplicate] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // landing_settings에서 값 가져오기 (없으면 기본값)
  const settings = branch.landing_settings || {}
  const title = settings.title || ''
  const description = settings.description || ''
  const buttonText = settings.buttonText || '상담 신청하기'
  const successMessage = settings.successMessage || '상담 신청이 완료되었습니다'
  const privacyText = settings.privacyText || '개인정보 수집 및 이용에 동의합니다.'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 11) {
      setError('올바른 전화번호를 입력해주세요')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          branchId: branch.id,
          source: 'landing',
          utmSource: searchParams.get('utm_source'),
          utmMedium: searchParams.get('utm_medium'),
          utmCampaign: searchParams.get('utm_campaign'),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '등록 중 오류가 발생했습니다')
      }

      // Set duplicate status from response if available
      if (data.isDuplicate) {
        setIsDuplicate(true)
      }

      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '등록 중 오류가 발생했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
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
              {isDuplicate && (
                <span className="inline-block px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded">
                  중복 접수
                </span>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setPhone('')
                setIsSuccess(false)
                setIsDuplicate(false)
              }}
            >
              새로운 상담 신청
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
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
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <PhoneInput
            value={phone}
            onChange={setPhone}
            onDuplicateCheck={setIsDuplicate}
            branchId={branch.id}
            disabled={isSubmitting}
          />

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || phone.replace(/\D/g, '').length !== 11}
            style={{
              backgroundColor: branch.primary_color,
              borderColor: branch.primary_color,
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                처리 중...
              </>
            ) : (
              buttonText
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            {privacyText}
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
