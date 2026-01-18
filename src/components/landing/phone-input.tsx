'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  onDuplicateCheck?: (isDuplicate: boolean) => void
  branchId?: string
  className?: string
  disabled?: boolean
}

export function PhoneInput({
  value,
  onChange,
  onDuplicateCheck,
  branchId,
  className,
  disabled,
}: PhoneInputProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [isDuplicate, setIsDuplicate] = useState<boolean | null>(null)
  const [checkError, setCheckError] = useState<string | null>(null)

  // Format phone number as 010-0000-0000
  const formatPhoneNumber = (input: string): string => {
    const digits = input.replace(/\D/g, '')

    if (digits.length <= 3) {
      return digits
    } else if (digits.length <= 7) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`
    } else {
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    onChange(formatted)
    setIsDuplicate(null)
    setCheckError(null)
  }

  // Debounced duplicate check
  const checkDuplicate = useCallback(async (phone: string) => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 11) {
      setIsDuplicate(null)
      return
    }

    setIsChecking(true)
    setCheckError(null)

    try {
      const response = await fetch('/api/customers/duplicate-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, branchId }),
      })

      if (!response.ok) {
        throw new Error('Failed to check duplicate')
      }

      const data = await response.json()
      setIsDuplicate(data.isDuplicate)
      onDuplicateCheck?.(data.isDuplicate)
    } catch (error) {
      setCheckError('중복 확인 실패')
      console.error('Duplicate check error:', error)
    } finally {
      setIsChecking(false)
    }
  }, [branchId, onDuplicateCheck])

  // Debounce effect
  useEffect(() => {
    const digits = value.replace(/\D/g, '')
    if (digits.length !== 11) {
      setIsDuplicate(null)
      return
    }

    const timer = setTimeout(() => {
      checkDuplicate(value)
    }, 500)

    return () => clearTimeout(timer)
  }, [value, checkDuplicate])

  const getStatusIcon = () => {
    if (isChecking) {
      return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
    }
    if (isDuplicate === true) {
      return (
        <div className="relative">
          <div className="absolute inset-0 bg-orange-200 rounded-full animate-ping opacity-75" />
          <AlertCircle className="h-6 w-6 text-orange-500 relative" />
        </div>
      )
    }
    if (isDuplicate === false) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return null
  }

  const getStatusMessage = () => {
    if (isChecking) return '확인 중...'
    if (checkError) return checkError
    if (isDuplicate === true) return '이미 등록된 번호입니다'
    if (isDuplicate === false) return '등록 가능합니다'
    return null
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor="phone">전화번호 *</Label>
      <div className="relative">
        <Input
          id="phone"
          type="tel"
          placeholder="010-0000-0000"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          maxLength={13}
          className={cn(
            'pr-10',
            isDuplicate === true && 'border-orange-500 focus:border-orange-500',
            isDuplicate === false && 'border-green-500 focus:border-green-500'
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {getStatusIcon()}
        </div>
      </div>
      {getStatusMessage() && (
        <p
          className={cn(
            'text-sm',
            isDuplicate === true && 'text-orange-500',
            isDuplicate === false && 'text-green-500',
            checkError && 'text-red-500'
          )}
        >
          {getStatusMessage()}
        </p>
      )}
    </div>
  )
}
