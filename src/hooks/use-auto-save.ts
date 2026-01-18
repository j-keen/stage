'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import { useUpdateCustomer } from './use-customers'
import { toast } from 'sonner'
import type { Customer } from '@/types/database'

interface UseAutoSaveOptions {
  customerId: string
  debounceMs?: number
  onSaveStart?: () => void
  onSaveEnd?: () => void
  onError?: (error: Error) => void
}

export function useAutoSave({
  customerId,
  debounceMs = 300,
  onSaveStart,
  onSaveEnd,
  onError,
}: UseAutoSaveOptions) {
  const pendingChanges = useRef<Record<string, unknown>>({})
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isSavingRef = useRef(false)
  const [isSaving, setIsSaving] = useState(false)

  // Refs for callbacks to avoid dependency issues
  const onSaveStartRef = useRef(onSaveStart)
  const onSaveEndRef = useRef(onSaveEnd)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onSaveStartRef.current = onSaveStart
    onSaveEndRef.current = onSaveEnd
    onErrorRef.current = onError
  }, [onSaveStart, onSaveEnd, onError])

  const { mutateAsync: updateCustomer } = useUpdateCustomer()

  const save = useCallback(async () => {
    // Guard: don't save if customerId is empty
    if (!customerId || Object.keys(pendingChanges.current).length === 0 || isSavingRef.current) {
      return
    }

    isSavingRef.current = true
    setIsSaving(true)
    onSaveStartRef.current?.()

    const dataToSave = { ...pendingChanges.current }
    pendingChanges.current = {}

    try {
      await updateCustomer({
        id: customerId,
        data: dataToSave as Partial<Customer>,
      })
      toast.success('저장되었습니다', { duration: 1500 })
    } catch (error) {
      // Don't restore pending changes - prevents infinite retry
      const err = error instanceof Error ? error : new Error('저장 실패')
      onErrorRef.current?.(err)
      toast.error('저장 중 오류가 발생했습니다')
    } finally {
      isSavingRef.current = false
      setIsSaving(false)
      onSaveEndRef.current?.()
    }
  }, [customerId, updateCustomer])

  const queueChange = useCallback(
    (field: keyof Customer, value: Customer[keyof Customer]) => {
      // Guard: don't queue if customerId is empty
      if (!customerId) return

      pendingChanges.current[field] = value

      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current)
      }

      saveTimeout.current = setTimeout(save, debounceMs)
    },
    [customerId, save, debounceMs]
  )

  const saveImmediately = useCallback(async () => {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current)
      saveTimeout.current = null
    }
    await save()
  }, [save])

  const cancelPending = useCallback(() => {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current)
      saveTimeout.current = null
    }
    pendingChanges.current = {}
  }, [])

  // Cleanup on unmount - just clear timeout, don't try to save
  useEffect(() => {
    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current)
      }
      pendingChanges.current = {}
    }
  }, [])

  return {
    queueChange,
    saveImmediately,
    cancelPending,
    hasPendingChanges: () => Object.keys(pendingChanges.current).length > 0,
    isSaving,
  }
}
