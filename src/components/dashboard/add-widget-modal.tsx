'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  PRESET_FORMULAS,
  FORMULA_CATEGORY_LABELS,
  isChartViewType,
  getChartType,
  getWidgetIcon,
  type FormulaCategory,
} from '@/lib/widget-formulas'
import { useDashboardStore, type WidgetConfig } from '@/stores/dashboard-store'
import type { ConditionalColorRule } from '@/lib/widget-colors'
import { Users, UserPlus, Clock, CheckCircle, Phone, UserMinus, XCircle, Hash, Percent, TrendingUp, PieChart, BarChart3, LineChart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AddWidgetModalProps {
  open: boolean
  onClose: () => void
}

const iconComponents = {
  users: Users,
  userPlus: UserPlus,
  clock: Clock,
  checkCircle: CheckCircle,
  phone: Phone,
  userMinus: UserMinus,
  xCircle: XCircle,
}

const viewTypeIcons = {
  number: Hash,
  percent: Percent,
  trend: TrendingUp,
  pie: PieChart,
  bar: BarChart3,
  line: LineChart,
}

// Default color rules for ratio presets
const RATIO_COLOR_RULES: Record<string, { colorRules: ConditionalColorRule[] }> = {
  'success-rate': {
    colorRules: [
      { id: 'success-high', field: 'value', operator: 'gte', value: 70, color: '#16A34A', bgColor: '#DCFCE7', label: '높음' },
      { id: 'success-low', field: 'value', operator: 'lt', value: 50, color: '#DC2626', bgColor: '#FEE2E2', label: '낮음' },
    ],
  },
  'completion-rate': {
    colorRules: [
      { id: 'completion-high', field: 'value', operator: 'gte', value: 80, color: '#16A34A', bgColor: '#DCFCE7', label: '우수' },
      { id: 'completion-low', field: 'value', operator: 'lt', value: 60, color: '#DC2626', bgColor: '#FEE2E2', label: '미달' },
    ],
  },
  'absent-rate': {
    colorRules: [
      { id: 'absent-high', field: 'value', operator: 'gte', value: 30, color: '#DC2626', bgColor: '#FEE2E2', label: '높음' },
      { id: 'absent-low', field: 'value', operator: 'lt', value: 10, color: '#16A34A', bgColor: '#DCFCE7', label: '낮음' },
    ],
  },
  'cancel-rate': {
    colorRules: [
      { id: 'cancel-high', field: 'value', operator: 'gte', value: 20, color: '#DC2626', bgColor: '#FEE2E2', label: '높음' },
      { id: 'cancel-low', field: 'value', operator: 'lt', value: 5, color: '#16A34A', bgColor: '#DCFCE7', label: '낮음' },
    ],
  },
  'callback-rate': {
    colorRules: [
      { id: 'callback-high', field: 'value', operator: 'gte', value: 25, color: '#F59E0B', bgColor: '#FEF3C7', label: '많음' },
    ],
  },
  'progress-rate': {
    colorRules: [
      { id: 'progress-high', field: 'value', operator: 'gte', value: 40, color: '#3B82F6', bgColor: '#DBEAFE', label: '활발' },
    ],
  },
}

// Chart type mapping for specific presets
const PRESET_CHART_TYPES: Record<string, 'pie' | 'donut' | 'bar' | 'line' | 'area' | 'stacked-bar'> = {
  'status-distribution-pie': 'pie',
  'status-distribution-donut': 'donut',
  'status-distribution-bar': 'bar',
  'assignee-stats': 'bar',
  'daily-trend-line': 'line',
  'daily-trend-area': 'area',
  'assignee-stacked': 'stacked-bar',
  'category-distribution': 'pie',
}

const CATEGORIES: FormulaCategory[] = ['status-count', 'ratio', 'distribution', 'trend']

export function AddWidgetModal({ open, onClose }: AddWidgetModalProps) {
  const { widgets, addWidget } = useDashboardStore()
  const [activeTab, setActiveTab] = useState<FormulaCategory>('status-count')

  const handleAddPreset = (presetId: string) => {
    const preset = PRESET_FORMULAS.find(p => p.id === presetId)
    if (!preset) return

    const maxY = Math.max(...widgets.map(w => w.y + w.h), 0)
    const isChart = isChartViewType(preset.viewType)

    // Get chart type from mapping or default
    const chartType = PRESET_CHART_TYPES[presetId] || getChartType(preset.viewType) || undefined

    // Get color rules for ratio presets
    const colorRules = RATIO_COLOR_RULES[presetId]?.colorRules

    const newWidget: WidgetConfig = {
      id: `${preset.id}-${Date.now()}`,
      type: isChart ? 'chart' : 'stat',
      title: preset.name,
      x: 0,
      y: maxY,
      w: isChart ? 6 : 3,
      h: isChart ? 4 : 2,
      config: {
        metric: preset.id,
        formula: preset.formula,
        viewType: preset.viewType,
        icon: getWidgetIcon(preset.formula.dataSource),
        chartType: chartType,
        isPercentage: preset.viewType === 'percent',
        colorRules: colorRules,
      },
    }

    addWidget(newWidget)
    onClose()
  }

  const getPresetsForCategory = (category: FormulaCategory) => {
    return PRESET_FORMULAS.filter(p => p.category === category)
  }

  const renderPresetPreview = (preset: typeof PRESET_FORMULAS[0]) => {
    const chartType = PRESET_CHART_TYPES[preset.id]

    if (preset.category === 'status-count') {
      return (
        <div className="text-2xl font-bold text-primary">123</div>
      )
    }

    if (preset.category === 'ratio') {
      return (
        <div className="text-2xl font-bold text-primary">45.2%</div>
      )
    }

    // Chart previews
    if (chartType === 'pie' || chartType === 'donut') {
      return (
        <div className="relative w-10 h-10">
          <div
            className="w-10 h-10 rounded-full"
            style={{
              background: `conic-gradient(#3B82F6 0% 35%, #10B981 35% 60%, #F59E0B 60% 80%, #EF4444 80% 100%)`
            }}
          />
          {chartType === 'donut' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-card rounded-full" />
            </div>
          )}
        </div>
      )
    }

    if (chartType === 'bar' || chartType === 'stacked-bar') {
      return (
        <div className="flex items-end gap-0.5 h-10">
          <div className="w-2 bg-blue-500 rounded-t" style={{ height: '60%' }} />
          <div className="w-2 bg-green-500 rounded-t" style={{ height: '100%' }} />
          <div className="w-2 bg-amber-500 rounded-t" style={{ height: '40%' }} />
          <div className="w-2 bg-red-500 rounded-t" style={{ height: '75%' }} />
        </div>
      )
    }

    if (chartType === 'line' || chartType === 'area') {
      return (
        <svg viewBox="0 0 50 25" className="w-12 h-6">
          <polyline
            fill={chartType === 'area' ? 'rgba(59, 130, 246, 0.3)' : 'none'}
            stroke="#3B82F6"
            strokeWidth="2"
            points="2,20 12,12 22,17 32,7 42,10 48,5"
          />
          {chartType === 'area' && (
            <polyline
              fill="rgba(59, 130, 246, 0.3)"
              stroke="none"
              points="2,20 12,12 22,17 32,7 42,10 48,5 48,25 2,25"
            />
          )}
        </svg>
      )
    }

    // Default for distribution presets
    return (
      <div className="relative w-10 h-10">
        <div
          className="w-10 h-10 rounded-full"
          style={{
            background: `conic-gradient(#3B82F6 0% 35%, #10B981 35% 60%, #F59E0B 60% 80%, #EF4444 80% 100%)`
          }}
        />
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>위젯 추가</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FormulaCategory)}>
          <TabsList className="grid w-full grid-cols-4">
            {CATEGORIES.map((category) => (
              <TabsTrigger key={category} value={category} className="text-xs sm:text-sm">
                {FORMULA_CATEGORY_LABELS[category]}
              </TabsTrigger>
            ))}
          </TabsList>

          {CATEGORIES.map((category) => (
            <TabsContent key={category} value={category} className="mt-4">
              <div className="grid grid-cols-2 gap-3">
                {getPresetsForCategory(category).map((preset) => {
                  const IconComponent = iconComponents[getWidgetIcon(preset.formula.dataSource) as keyof typeof iconComponents] || Users
                  const ViewIcon = viewTypeIcons[preset.viewType]
                  const isRegistered = widgets.some(w => w.id.startsWith(preset.id))

                  return (
                    <Card
                      key={preset.id}
                      className={cn(
                        'transition-colors relative overflow-hidden',
                        isRegistered
                          ? 'cursor-not-allowed border-muted'
                          : 'cursor-pointer hover:border-primary'
                      )}
                      onClick={() => !isRegistered && handleAddPreset(preset.id)}
                    >
                      {isRegistered && (
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                          <Badge className="bg-primary/10 text-primary border-primary/30 text-sm px-3 py-1">
                            등록됨
                          </Badge>
                        </div>
                      )}
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-sm">{preset.name}</CardTitle>
                          </div>
                          <ViewIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardDescription className="text-xs">
                            {preset.description}
                          </CardDescription>
                          <div className="flex-shrink-0 ml-2">
                            {renderPresetPreview(preset)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
