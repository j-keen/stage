'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import {
  type ConditionalColorRule,
  type ComparisonOperator,
  OPERATOR_LABELS,
  COLOR_PRESETS,
  ALERT_COLORS,
} from '@/lib/widget-colors'

interface ColorConfigPanelProps {
  rules: ConditionalColorRule[]
  onChange: (rules: ConditionalColorRule[]) => void
}

export function ColorConfigPanel({ rules, onChange }: ColorConfigPanelProps) {
  const addRule = () => {
    const newRule: ConditionalColorRule = {
      id: `rule-${Date.now()}`,
      field: 'value',
      operator: 'gte',
      value: 0,
      color: ALERT_COLORS.info.color,
      bgColor: ALERT_COLORS.info.bgColor,
    }
    onChange([...rules, newRule])
  }

  const updateRule = (id: string, updates: Partial<ConditionalColorRule>) => {
    onChange(
      rules.map((rule) =>
        rule.id === id ? { ...rule, ...updates } : rule
      )
    )
  }

  const removeRule = (id: string) => {
    onChange(rules.filter((rule) => rule.id !== id))
  }

  const applyColorPreset = (id: string, preset: typeof ALERT_COLORS[keyof typeof ALERT_COLORS]) => {
    updateRule(id, {
      color: preset.color,
      bgColor: preset.bgColor,
      label: preset.label,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">조건부 색상 규칙</Label>
        <Button type="button" variant="outline" size="sm" onClick={addRule}>
          <Plus className="h-4 w-4 mr-1" />
          규칙 추가
        </Button>
      </div>

      {rules.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          조건부 색상 규칙이 없습니다. 규칙을 추가하면 값에 따라 위젯 색상이 변경됩니다.
        </p>
      ) : (
        <div className="space-y-3">
          {rules.map((rule, index) => (
            <Card key={rule.id}>
              <CardContent className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">규칙 {index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRule(rule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">필드</Label>
                    <Select
                      value={rule.field}
                      onValueChange={(v) => updateRule(rule.id, { field: v as 'value' | 'changePercent' })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="value">값</SelectItem>
                        <SelectItem value="changePercent">변화율</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">조건</Label>
                    <Select
                      value={rule.operator}
                      onValueChange={(v) => updateRule(rule.id, { operator: v as ComparisonOperator })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(OPERATOR_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">값</Label>
                    <Input
                      type="number"
                      value={rule.value}
                      onChange={(e) => updateRule(rule.id, { value: Number(e.target.value) })}
                      className="h-8"
                    />
                  </div>
                </div>

                {rule.operator === 'between' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">최소값</Label>
                      <Input
                        type="number"
                        value={rule.value}
                        onChange={(e) => updateRule(rule.id, { value: Number(e.target.value) })}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">최대값</Label>
                      <Input
                        type="number"
                        value={rule.value2 || 0}
                        onChange={(e) => updateRule(rule.id, { value2: Number(e.target.value) })}
                        className="h-8"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-xs">색상 프리셋</Label>
                  <div className="flex gap-1 mt-1">
                    {Object.entries(ALERT_COLORS).map(([key, preset]) => (
                      <button
                        key={key}
                        type="button"
                        className="px-2 py-1 text-xs rounded border transition-all hover:scale-105"
                        style={{
                          backgroundColor: preset.bgColor,
                          color: preset.color,
                          borderColor: rule.color === preset.color ? preset.color : 'transparent',
                        }}
                        onClick={() => applyColorPreset(rule.id, preset)}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">글자 색상</Label>
                    <div className="flex gap-1">
                      <Input
                        type="color"
                        value={rule.color}
                        onChange={(e) => updateRule(rule.id, { color: e.target.value })}
                        className="w-10 h-8 p-1"
                      />
                      <Input
                        value={rule.color}
                        onChange={(e) => updateRule(rule.id, { color: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">배경 색상</Label>
                    <div className="flex gap-1">
                      <Input
                        type="color"
                        value={rule.bgColor}
                        onChange={(e) => updateRule(rule.id, { bgColor: e.target.value })}
                        className="w-10 h-8 p-1"
                      />
                      <Input
                        value={rule.bgColor}
                        onChange={(e) => updateRule(rule.id, { bgColor: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">라벨 (선택)</Label>
                    <Input
                      value={rule.label || ''}
                      onChange={(e) => updateRule(rule.id, { label: e.target.value || undefined })}
                      placeholder="양호, 주의..."
                      className="h-8"
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <span className="text-xs text-muted-foreground">미리보기:</span>
                  <span
                    className="px-2 py-0.5 text-xs rounded"
                    style={{
                      backgroundColor: rule.bgColor,
                      color: rule.color,
                    }}
                  >
                    {rule.label || '123'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
