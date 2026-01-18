'use client'

import { useState, useEffect } from 'react'
import { useModalLayoutStore, type FieldConfig, type SectionConfig } from '@/stores/modal-layout-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  GripVertical,
  Pencil,
  Check,
  X,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalLayoutEditorProps {
  open: boolean
  onClose: () => void
}

export function ModalLayoutEditor({ open, onClose }: ModalLayoutEditorProps) {
  const {
    layout,
    loadLayout,
    saveLayout,
    resetLayout,
    updateFieldLabel,
    updateFieldVisibility,
    reorderFields,
    updateSectionTitle,
    updateSectionVisibility,
    isLoaded,
  } = useModalLayoutStore()

  const [editingField, setEditingField] = useState<{ sectionId: string; fieldId: string } | null>(null)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [draggedField, setDraggedField] = useState<{ sectionId: string; fieldId: string } | null>(null)
  const [dragOverField, setDragOverField] = useState<{ sectionId: string; fieldId: string } | null>(null)

  useEffect(() => {
    if (open && !isLoaded) {
      loadLayout()
    }
  }, [open, isLoaded, loadLayout])

  const handleSave = async () => {
    setIsSaving(true)
    await saveLayout()
    setIsSaving(false)
    onClose()
  }

  const handleReset = () => {
    if (confirm('레이아웃을 기본값으로 초기화하시겠습니까?')) {
      resetLayout()
    }
  }

  const startEditingField = (sectionId: string, fieldId: string, currentLabel: string) => {
    setEditingField({ sectionId, fieldId })
    setEditValue(currentLabel)
  }

  const saveFieldEdit = () => {
    if (editingField && editValue.trim()) {
      updateFieldLabel(editingField.sectionId, editingField.fieldId, editValue.trim())
    }
    setEditingField(null)
    setEditValue('')
  }

  const cancelEdit = () => {
    setEditingField(null)
    setEditingSection(null)
    setEditValue('')
  }

  const startEditingSection = (sectionId: string, currentTitle: string) => {
    setEditingSection(sectionId)
    setEditValue(currentTitle)
  }

  const saveSectionEdit = () => {
    if (editingSection && editValue.trim()) {
      updateSectionTitle(editingSection, editValue.trim())
    }
    setEditingSection(null)
    setEditValue('')
  }

  const handleDragStart = (sectionId: string, fieldId: string) => {
    setDraggedField({ sectionId, fieldId })
  }

  const handleDragOver = (e: React.DragEvent, sectionId: string, fieldId: string) => {
    e.preventDefault()
    if (draggedField && draggedField.sectionId === sectionId) {
      setDragOverField({ sectionId, fieldId })
    }
  }

  const handleDragEnd = () => {
    if (draggedField && dragOverField && draggedField.sectionId === dragOverField.sectionId) {
      const section = layout.sections.find((s) => s.id === draggedField.sectionId)
      if (section) {
        const fieldIds = section.fields.map((f) => f.id)
        const fromIndex = fieldIds.indexOf(draggedField.fieldId)
        const toIndex = fieldIds.indexOf(dragOverField.fieldId)

        if (fromIndex !== -1 && toIndex !== -1) {
          const newFieldIds = [...fieldIds]
          newFieldIds.splice(fromIndex, 1)
          newFieldIds.splice(toIndex, 0, draggedField.fieldId)
          reorderFields(draggedField.sectionId, newFieldIds)
        }
      }
    }
    setDraggedField(null)
    setDragOverField(null)
  }

  const renderField = (section: SectionConfig, field: FieldConfig) => {
    const isEditing = editingField?.sectionId === section.id && editingField?.fieldId === field.id
    const isDragging = draggedField?.sectionId === section.id && draggedField?.fieldId === field.id
    const isDragOver = dragOverField?.sectionId === section.id && dragOverField?.fieldId === field.id

    return (
      <div
        key={field.id}
        draggable
        onDragStart={() => handleDragStart(section.id, field.id)}
        onDragOver={(e) => handleDragOver(e, section.id, field.id)}
        onDragEnd={handleDragEnd}
        className={cn(
          'flex items-center gap-2 p-2 rounded border bg-background transition-all',
          isDragging && 'opacity-50',
          isDragOver && 'border-primary border-2',
          !field.visible && 'opacity-50 bg-muted'
        )}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab flex-shrink-0" />

        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="h-8 text-sm flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveFieldEdit()
                if (e.key === 'Escape') cancelEdit()
              }}
            />
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-green-300 hover:bg-green-50 hover:border-green-400"
                onClick={saveFieldEdit}
                title="저장"
              >
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-red-300 hover:bg-red-50 hover:border-red-400"
                onClick={cancelEdit}
                title="취소"
              >
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <span className="flex-1 text-sm">{field.label}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => startEditingField(section.id, field.id, field.label)}
            >
              <Pencil className="h-3 w-3 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => updateFieldVisibility(section.id, field.id, !field.visible)}
            >
              {field.visible ? (
                <Eye className="h-3 w-3 text-muted-foreground" />
              ) : (
                <EyeOff className="h-3 w-3 text-muted-foreground" />
              )}
            </Button>
          </>
        )}
      </div>
    )
  }

  const renderSection = (section: SectionConfig) => {
    const isEditing = editingSection === section.id

    return (
      <AccordionItem key={section.id} value={section.id} className="border rounded-lg px-3 mb-2">
        <AccordionTrigger className="py-2 text-sm hover:no-underline">
          <div className="flex items-center gap-2 flex-1">
            {isEditing ? (
              <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="h-8 text-sm w-40"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveSectionEdit()
                    if (e.key === 'Escape') cancelEdit()
                  }}
                />
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 border-green-300 hover:bg-green-50 hover:border-green-400"
                    onClick={saveSectionEdit}
                    title="저장"
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 border-red-300 hover:bg-red-50 hover:border-red-400"
                    onClick={cancelEdit}
                    title="취소"
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <span className="font-medium">{section.title}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    startEditingSection(section.id, section.title)
                  }}
                >
                  <Pencil className="h-3 w-3 text-muted-foreground" />
                </Button>
                <div className="flex items-center gap-1 ml-auto mr-2" onClick={(e) => e.stopPropagation()}>
                  <Switch
                    checked={section.visible}
                    onCheckedChange={(checked) => updateSectionVisibility(section.id, checked)}
                    className="h-4 w-7"
                  />
                  <span className="text-xs text-muted-foreground">표시</span>
                </div>
              </>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-3">
          <div className="space-y-1">
            {section.fields
              .sort((a, b) => a.order - b.order)
              .map((field) => renderField(section, field))}
          </div>
        </AccordionContent>
      </AccordionItem>
    )
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>모달 레이아웃 편집</SheetTitle>
          <SheetDescription>
            필드 순서를 드래그하여 변경하고, 연필 아이콘을 클릭하여 라벨을 수정하세요.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <Accordion type="multiple" defaultValue={layout.sections.map((s) => s.id)} className="w-full">
            {layout.sections
              .sort((a, b) => a.order - b.order)
              .map((section) => renderSection(section))}
          </Accordion>
        </ScrollArea>

        <SheetFooter className="px-6 py-4 border-t bg-muted/30">
          <div className="flex items-center justify-between w-full gap-2">
            <Button variant="outline" onClick={handleReset} className="gap-2 text-muted-foreground hover:text-foreground">
              <RotateCcw className="h-4 w-4" />
              초기화
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground min-w-[100px]"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                저장하기
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
