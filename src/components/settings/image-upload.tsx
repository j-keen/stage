'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  accept?: string
  maxWidth?: number
  maxHeight?: number
  aspectRatio?: string
  label?: string
  description?: string
  className?: string
  compact?: boolean
}

export function ImageUpload({
  value,
  onChange,
  accept = 'image/png,image/svg+xml',
  maxWidth = 200,
  maxHeight = 50,
  aspectRatio,
  label = '이미지 업로드',
  description,
  className,
  compact = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'branding')

      const response = await fetch('/api/upload/branding', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '업로드에 실패했습니다')
      }

      onChange(data.url)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : '이미지 업로드에 실패했습니다')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleRemove = () => {
    onChange(null)
  }

  if (compact) {
    return (
      <div className={className}>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileSelect(file)
          }}
          className="hidden"
        />

        {value ? (
          <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
            <div
              className="relative bg-background rounded p-1 border"
              style={{ maxWidth: `${maxWidth}px`, maxHeight: `${maxHeight}px` }}
            >
              <img
                src={value}
                alt={label}
                className="max-w-full max-h-full object-contain"
                style={{ maxWidth: `${maxWidth}px`, maxHeight: `${maxHeight}px` }}
              />
            </div>
            <div className="flex gap-1 ml-auto">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="h-7 px-2 text-xs"
              >
                {isUploading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  '변경'
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="h-7 w-7 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              'border border-dashed rounded-md p-3 cursor-pointer transition-colors flex items-center gap-3',
              isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/50',
              isUploading && 'pointer-events-none opacity-50'
            )}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="p-1.5 rounded bg-muted">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium">{label}</p>
                  {description && (
                    <p className="text-[10px] text-muted-foreground">{description}</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileSelect(file)
        }}
        className="hidden"
      />

      {value ? (
        <div className="relative overflow-hidden border rounded-lg p-3">
          <div className="flex items-center justify-between gap-4">
            <div
              className="relative bg-muted rounded p-2"
              style={{
                maxWidth: `${maxWidth}px`,
                maxHeight: `${maxHeight}px`,
              }}
            >
              <img
                src={value}
                alt={label}
                className="max-w-full max-h-full object-contain"
                style={{
                  maxWidth: `${maxWidth}px`,
                  maxHeight: `${maxHeight}px`,
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    변경
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors flex flex-col items-center justify-center gap-2',
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/50',
            isUploading && 'pointer-events-none opacity-50'
          )}
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <>
              <div className="p-2 rounded-full bg-muted">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-medium text-sm">{label}</p>
                {description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
