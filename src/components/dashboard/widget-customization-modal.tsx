'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type WidgetConfig, type StyleOverrides, type TitleSizeOption, type ValueSizeOption, type IconSizeOption, type SpacingOption } from '@/stores/dashboard-store'
import type { ConditionalColorRule } from '@/lib/widget-colors'
import { getColorForValue } from '@/lib/widget-colors'
import {
  STYLE_PRESETS,
  CONDITIONAL_PRESETS,
  applyStylePreset,
  applyConditionalPreset,
  getPresetIdFromStyle,
} from '@/lib/widget-style-presets'
import {
  // 기본 아이콘
  Users, UserPlus, Clock, CheckCircle, Percent, Phone, UserMinus, XCircle,
  // 추가 사용자 아이콘
  User, UserCheck, UserX, Users2,
  // 상태 아이콘
  Circle, CircleDot, AlertCircle, Info, Star, Heart,
  // 비즈니스 아이콘
  Briefcase, Building, Wallet, CreditCard, DollarSign, TrendingUp, TrendingDown,
  // 커뮤니케이션 아이콘
  Mail, MessageSquare, Bell,
  // 기타 아이콘
  Target, Zap,
  // UI 아이콘
  Plus, Trash2, Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts'

interface WidgetCustomizationModalProps {
  widget: WidgetConfig | null
  open: boolean
  onClose: () => void
  onSave: (updates: Partial<WidgetConfig>) => void
}

const DEFAULT_COLOR_RULES: ConditionalColorRule[] = [
  { id: 'rule-1', field: 'value', operator: 'gte', value: 80, color: '#16A34A', bgColor: '#DCFCE7', label: '양호' },
  { id: 'rule-2', field: 'value', operator: 'lt', value: 50, color: '#DC2626', bgColor: '#FEE2E2', label: '주의' },
]

const OPERATOR_LABELS: Record<string, string> = {
  'gt': '>',
  'gte': '≥',
  'lt': '<',
  'lte': '≤',
  'eq': '=',
}

const ICON_OPTIONS = [
  // 기본 아이콘 (8개)
  { id: 'users', icon: Users, label: '사용자들' },
  { id: 'userPlus', icon: UserPlus, label: '추가' },
  { id: 'clock', icon: Clock, label: '시계' },
  { id: 'checkCircle', icon: CheckCircle, label: '체크' },
  { id: 'percent', icon: Percent, label: '퍼센트' },
  { id: 'phone', icon: Phone, label: '전화' },
  { id: 'userMinus', icon: UserMinus, label: '제거' },
  { id: 'xCircle', icon: XCircle, label: '취소' },
  // 사용자 (4개)
  { id: 'user', icon: User, label: '사용자' },
  { id: 'userCheck', icon: UserCheck, label: '확인' },
  { id: 'userX', icon: UserX, label: '탈퇴' },
  { id: 'users2', icon: Users2, label: '그룹' },
  // 상태 (6개)
  { id: 'circle', icon: Circle, label: '원' },
  { id: 'circleDot', icon: CircleDot, label: '점' },
  { id: 'alertCircle', icon: AlertCircle, label: '경고' },
  { id: 'info', icon: Info, label: '정보' },
  { id: 'star', icon: Star, label: '별' },
  { id: 'heart', icon: Heart, label: '하트' },
  // 비즈니스 (7개)
  { id: 'briefcase', icon: Briefcase, label: '업무' },
  { id: 'building', icon: Building, label: '빌딩' },
  { id: 'wallet', icon: Wallet, label: '지갑' },
  { id: 'creditCard', icon: CreditCard, label: '카드' },
  { id: 'dollarSign', icon: DollarSign, label: '달러' },
  { id: 'trendingUp', icon: TrendingUp, label: '상승' },
  { id: 'trendingDown', icon: TrendingDown, label: '하락' },
  // 커뮤니케이션 (3개)
  { id: 'mail', icon: Mail, label: '메일' },
  { id: 'messageSquare', icon: MessageSquare, label: '메시지' },
  { id: 'bell', icon: Bell, label: '알림' },
  // 기타 (2개)
  { id: 'target', icon: Target, label: '타겟' },
  { id: 'zap', icon: Zap, label: '번개' },
]

const COLOR_PRESETS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#14B8A6', // Teal
]

const CHART_COLOR_SETS = [
  { name: '기본', colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'] },
  { name: '파스텔', colors: ['#93C5FD', '#86EFAC', '#FDE047', '#FCA5A5', '#C4B5FD', '#FDBA74'] },
  { name: '비비드', colors: ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED', '#EA580C'] },
  { name: '모노톤', colors: ['#1F2937', '#374151', '#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB'] },
]

// Icon map for preview rendering
const ICON_MAP: Record<string, typeof Users> = {
  users: Users, userPlus: UserPlus, clock: Clock, checkCircle: CheckCircle,
  percent: Percent, phone: Phone, userMinus: UserMinus, xCircle: XCircle,
  user: User, userCheck: UserCheck, userX: UserX, users2: Users2,
  circle: Circle, circleDot: CircleDot, alertCircle: AlertCircle, info: Info,
  star: Star, heart: Heart, briefcase: Briefcase, building: Building,
  wallet: Wallet, creditCard: CreditCard, dollarSign: DollarSign,
  trendingUp: TrendingUp, trendingDown: TrendingDown,
  mail: Mail, messageSquare: MessageSquare, bell: Bell, target: Target, zap: Zap,
}

// Sample data for preview
const PREVIEW_SAMPLE_VALUE = 123
const PREVIEW_SAMPLE_CHANGE = 12.5
const PREVIEW_CHART_DATA = [
  { name: '항목1', value: 35 },
  { name: '항목2', value: 25 },
  { name: '항목3', value: 20 },
  { name: '항목4', value: 20 },
]

// Size maps for preview rendering
const PREVIEW_TITLE_SIZE_MAP: Record<string, string> = {
  auto: 'text-xs', xs: 'text-[10px]', sm: 'text-xs', base: 'text-sm', lg: 'text-base',
}
const PREVIEW_VALUE_SIZE_MAP: Record<string, string> = {
  auto: 'text-lg', lg: 'text-base', xl: 'text-lg', '2xl': 'text-xl', '3xl': 'text-2xl', '4xl': 'text-3xl', '5xl': 'text-4xl',
}
const PREVIEW_ICON_SIZE_MAP: Record<string, string> = {
  auto: 'h-3.5 w-3.5', sm: 'h-3 w-3', md: 'h-3.5 w-3.5', lg: 'h-4 w-4', xl: 'h-5 w-5',
}
const PREVIEW_SPACING_MAP: Record<string, { header: string; content: string }> = {
  compact: { header: 'pb-0 pt-1 px-2', content: 'pb-1.5 px-2' },
  normal: { header: 'pb-1 pt-1.5 px-2', content: 'pb-2 px-2' },
  spacious: { header: 'pb-1.5 pt-2 px-3', content: 'pb-2.5 px-3' },
}

const TITLE_SIZE_OPTIONS: { value: TitleSizeOption; label: string }[] = [
  { value: 'auto', label: '자동' },
  { value: 'xs', label: '아주 작게' },
  { value: 'sm', label: '작게' },
  { value: 'base', label: '보통' },
  { value: 'lg', label: '크게' },
]

const VALUE_SIZE_OPTIONS: { value: ValueSizeOption; label: string }[] = [
  { value: 'auto', label: '자동' },
  { value: 'lg', label: '작게' },
  { value: 'xl', label: '보통' },
  { value: '2xl', label: '크게' },
  { value: '3xl', label: '더 크게' },
  { value: '4xl', label: '아주 크게' },
  { value: '5xl', label: '최대' },
]

const ICON_SIZE_OPTIONS: { value: IconSizeOption; label: string }[] = [
  { value: 'auto', label: '자동' },
  { value: 'sm', label: '작게' },
  { value: 'md', label: '보통' },
  { value: 'lg', label: '크게' },
  { value: 'xl', label: '아주 크게' },
]

const SPACING_OPTIONS: { value: SpacingOption; label: string; desc: string }[] = [
  { value: 'compact', label: '좁게', desc: '여백 최소화' },
  { value: 'normal', label: '보통', desc: '기본 여백' },
  { value: 'spacious', label: '넓게', desc: '여유로운 여백' },
]

export function WidgetCustomizationModal({
  widget,
  open,
  onClose,
  onSave,
}: WidgetCustomizationModalProps) {
  const [title, setTitle] = useState('')
  const [icon, setIcon] = useState('users')
  const [iconColor, setIconColor] = useState('')
  const [valueColor, setValueColor] = useState('')
  const [chartColors, setChartColors] = useState<string[]>([])
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'line' | 'area' | 'donut' | 'stacked-bar'>('pie')
  const [activeTab, setActiveTab] = useState('basic')
  const [enableConditionalColors, setEnableConditionalColors] = useState(false)
  const [colorRules, setColorRules] = useState<ConditionalColorRule[]>(DEFAULT_COLOR_RULES)
  // Style overrides state
  const [titleSize, setTitleSize] = useState<TitleSizeOption>('auto')
  const [valueSize, setValueSize] = useState<ValueSizeOption>('auto')
  const [iconSize, setIconSize] = useState<IconSizeOption>('auto')
  const [spacing, setSpacing] = useState<SpacingOption>('normal')

  useEffect(() => {
    if (widget) {
      setTitle(widget.title)
      setIcon((widget.config.icon as string) || 'users')
      setIconColor((widget.config.iconColor as string) || '')
      setValueColor((widget.config.valueColor as string) || '')
      setChartColors((widget.config.colors as string[]) || [])
      setChartType((widget.config.chartType as 'pie' | 'bar' | 'line' | 'area' | 'donut' | 'stacked-bar') || 'pie')
      setActiveTab('basic')

      // Load conditional color rules
      const existingRules = widget.config.colorRules as ConditionalColorRule[] | undefined
      if (existingRules && existingRules.length > 0) {
        setEnableConditionalColors(true)
        setColorRules(existingRules)
      } else {
        setEnableConditionalColors(false)
        setColorRules(DEFAULT_COLOR_RULES)
      }

      // Load style overrides
      const existingStyles = widget.config.styleOverrides as StyleOverrides | undefined
      if (existingStyles) {
        setTitleSize(existingStyles.titleSize || 'auto')
        setValueSize(existingStyles.valueSize || 'auto')
        setIconSize(existingStyles.iconSize || 'auto')
        setSpacing(existingStyles.spacing || 'normal')
      } else {
        setTitleSize('auto')
        setValueSize('auto')
        setIconSize('auto')
        setSpacing('normal')
      }
    }
  }, [widget])

  const isChartWidget = widget?.type === 'chart'
  const isStatWidget = widget?.type === 'stat'

  const updateColorRule = (index: number, updates: Partial<ConditionalColorRule>) => {
    setColorRules(rules => rules.map((rule, i) => i === index ? { ...rule, ...updates } : rule))
  }

  const addColorRule = () => {
    const newRule: ConditionalColorRule = {
      id: `rule-${Date.now()}`,
      field: 'value',
      operator: 'gte',
      value: 0,
      color: '#3B82F6',
      bgColor: '#DBEAFE',
      label: '조건',
    }
    setColorRules(rules => [...rules, newRule])
  }

  const removeColorRule = (index: number) => {
    setColorRules(rules => rules.filter((_, i) => i !== index))
  }

  // Get current style preset ID
  const currentStylePresetId = useMemo(() => {
    return getPresetIdFromStyle(titleSize, valueSize, iconSize, spacing, iconColor, valueColor)
  }, [titleSize, valueSize, iconSize, spacing, iconColor, valueColor])

  // Apply style preset
  const handleApplyStylePreset = (presetId: string) => {
    const preset = STYLE_PRESETS.find(p => p.id === presetId)
    if (preset) {
      const applied = applyStylePreset(preset)
      setTitleSize(applied.titleSize)
      setValueSize(applied.valueSize)
      setIconSize(applied.iconSize)
      setSpacing(applied.spacing)
      setIconColor(applied.iconColor)
      setValueColor(applied.valueColor)
    }
  }

  // Apply conditional preset
  const handleApplyConditionalPreset = (presetId: string, mode: 'replace' | 'add') => {
    const preset = CONDITIONAL_PRESETS.find(p => p.id === presetId)
    if (preset) {
      const newRules = applyConditionalPreset(preset)
      if (mode === 'replace') {
        setColorRules(newRules)
      } else {
        setColorRules(prev => [...prev, ...newRules])
      }
      setEnableConditionalColors(true)
    }
  }

  // Preview conditional color
  const previewConditionalColor = useMemo(() => {
    if (enableConditionalColors && colorRules.length > 0) {
      return getColorForValue(PREVIEW_SAMPLE_VALUE, PREVIEW_SAMPLE_CHANGE, colorRules)
    }
    return null
  }, [enableConditionalColors, colorRules])

  const handleSave = () => {
    // Build styleOverrides only if any value is not 'auto' or 'normal'
    const hasStyleOverrides = titleSize !== 'auto' || valueSize !== 'auto' || iconSize !== 'auto' || spacing !== 'normal'
    const styleOverrides: StyleOverrides | undefined = hasStyleOverrides ? {
      titleSize: titleSize !== 'auto' ? titleSize : undefined,
      valueSize: valueSize !== 'auto' ? valueSize : undefined,
      iconSize: iconSize !== 'auto' ? iconSize : undefined,
      spacing: spacing !== 'normal' ? spacing : undefined,
    } : undefined

    const updates: Partial<WidgetConfig> = {
      title,
      config: {
        ...widget?.config,
        icon,
        iconColor: iconColor || undefined,
        valueColor: valueColor || undefined,
        colors: chartColors.length > 0 ? chartColors : undefined,
        chartType: isChartWidget ? chartType : widget?.config.chartType,
        colorRules: enableConditionalColors && colorRules.length > 0 ? colorRules : undefined,
        styleOverrides,
      },
    }
    onSave(updates)
  }

  // Render preview widget
  const renderPreview = () => {
    const PreviewIcon = ICON_MAP[icon] || Users
    const spacingTokens = PREVIEW_SPACING_MAP[spacing] || PREVIEW_SPACING_MAP.normal

    if (isChartWidget) {
      const previewColors = chartColors.length > 0 ? chartColors : CHART_COLOR_SETS[0].colors
      return (
        <Card className="h-full flex flex-col overflow-hidden">
          <CardHeader className={cn(spacingTokens.header, 'flex-shrink-0')}>
            <CardTitle className={cn(PREVIEW_TITLE_SIZE_MAP[titleSize], 'font-medium truncate')}>
              {title || '차트 제목'}
            </CardTitle>
          </CardHeader>
          <CardContent className={cn(spacingTokens.content, 'flex-1 min-h-0')}>
            <ResponsiveContainer width="100%" height={60}>
              <PieChart>
                <Pie
                  data={PREVIEW_CHART_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={15}
                  outerRadius={28}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {PREVIEW_CHART_DATA.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={previewColors[index % previewColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )
    }

    // Stat widget preview
    return (
      <Card
        className="h-full overflow-hidden"
        style={previewConditionalColor ? {
          borderColor: previewConditionalColor.color,
          borderWidth: '2px',
        } : undefined}
      >
        <CardHeader className={cn('flex flex-row items-center justify-between space-y-0', spacingTokens.header)}>
          <CardTitle className={cn(PREVIEW_TITLE_SIZE_MAP[titleSize], 'font-medium text-muted-foreground truncate')}>
            {title || '통계 제목'}
          </CardTitle>
          <div className="flex items-center gap-1 flex-shrink-0">
            {previewConditionalColor?.label && (
              <Badge
                style={{
                  backgroundColor: previewConditionalColor.bgColor,
                  color: previewConditionalColor.color,
                }}
                className="text-[8px] px-1 py-0"
              >
                {previewConditionalColor.label}
              </Badge>
            )}
            <PreviewIcon
              className={cn(PREVIEW_ICON_SIZE_MAP[iconSize], !iconColor && 'text-muted-foreground')}
              style={iconColor ? { color: iconColor } : undefined}
            />
          </div>
        </CardHeader>
        <CardContent className={spacingTokens.content}>
          <div
            className={cn(PREVIEW_VALUE_SIZE_MAP[valueSize], 'font-bold')}
            style={valueColor ? { color: valueColor } : previewConditionalColor ? { color: previewConditionalColor.color } : undefined}
          >
            {PREVIEW_SAMPLE_VALUE}건
          </div>
          <p
            className="text-[10px] flex items-center gap-0.5 mt-0.5 text-green-600"
            style={previewConditionalColor ? { color: previewConditionalColor.color } : undefined}
          >
            <TrendingUp className="h-2.5 w-2.5" />
            +{PREVIEW_SAMPLE_CHANGE}%
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>위젯 커스터마이징</DialogTitle>
        </DialogHeader>

        {/* Preview Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            <span>미리보기</span>
          </div>
          <div className="border rounded-lg bg-muted/30 p-3">
            <div className="w-48 h-24 mx-auto">
              {renderPreview()}
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={cn('grid w-full', isChartWidget ? 'grid-cols-4' : isStatWidget ? 'grid-cols-4' : 'grid-cols-3')}>
            <TabsTrigger value="basic">기본</TabsTrigger>
            <TabsTrigger value="colors">색상</TabsTrigger>
            <TabsTrigger value="style">스타일</TabsTrigger>
            {isChartWidget && <TabsTrigger value="chart">차트</TabsTrigger>}
            {isStatWidget && <TabsTrigger value="conditional">조건부</TabsTrigger>}
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>위젯 제목</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="위젯 제목"
              />
            </div>

            {!isChartWidget && (
              <div className="space-y-2">
                <Label>아이콘</Label>
                <div className="grid grid-cols-6 gap-1.5 max-h-48 overflow-y-auto p-1">
                  {ICON_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setIcon(opt.id)}
                      className={cn(
                        'flex flex-col items-center gap-0.5 p-1.5 rounded-md border transition-colors',
                        icon === opt.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      )}
                      title={opt.label}
                    >
                      <opt.icon className="h-4 w-4" style={iconColor ? { color: iconColor } : undefined} />
                      <span className="text-[8px] text-muted-foreground truncate w-full text-center">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="colors" className="space-y-4 mt-4">
            {!isChartWidget && (
              <>
                <div className="space-y-2">
                  <Label>아이콘 색상</Label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setIconColor(color)}
                        className={cn(
                          'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110',
                          iconColor === color ? 'border-foreground ring-2 ring-offset-2 ring-primary' : 'border-transparent'
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <button
                      onClick={() => setIconColor('')}
                      className={cn(
                        'h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs bg-muted',
                        !iconColor ? 'border-foreground' : 'border-border'
                      )}
                    >
                      초기화
                    </button>
                  </div>
                  <Input
                    type="color"
                    value={iconColor || '#3B82F6'}
                    onChange={(e) => setIconColor(e.target.value)}
                    className="h-8 w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>값 색상</Label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setValueColor(color)}
                        className={cn(
                          'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110',
                          valueColor === color ? 'border-foreground ring-2 ring-offset-2 ring-primary' : 'border-transparent'
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <button
                      onClick={() => setValueColor('')}
                      className={cn(
                        'h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs bg-muted',
                        !valueColor ? 'border-foreground' : 'border-border'
                      )}
                    >
                      초기화
                    </button>
                  </div>
                </div>
              </>
            )}

            {isChartWidget && (
              <div className="space-y-3">
                <Label>차트 색상 세트</Label>
                {CHART_COLOR_SETS.map((set) => (
                  <button
                    key={set.name}
                    onClick={() => setChartColors(set.colors)}
                    className={cn(
                      'w-full p-3 rounded-lg border transition-colors',
                      JSON.stringify(chartColors) === JSON.stringify(set.colors)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{set.name}</span>
                      <div className="flex gap-1">
                        {set.colors.map((color, i) => (
                          <div
                            key={i}
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => setChartColors([])}
                  className={cn(
                    'w-full p-3 rounded-lg border text-sm',
                    chartColors.length === 0
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  기본값 사용
                </button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="style" className="space-y-3 mt-4">
            {/* Style Presets */}
            <div className="space-y-2">
              <Label className="text-xs">스타일 프리셋</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {STYLE_PRESETS.slice(0, 4).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyStylePreset(preset.id)}
                    className={cn(
                      'px-2 py-1.5 text-xs rounded-md border transition-colors',
                      currentStylePresetId === preset.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {STYLE_PRESETS.slice(4).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyStylePreset(preset.id)}
                    className={cn(
                      'px-2 py-1.5 text-xs rounded-md border transition-colors',
                      currentStylePresetId === preset.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50',
                      preset.id === 'success' && 'text-green-600',
                      preset.id === 'warning' && 'text-amber-600',
                      preset.id === 'danger' && 'text-red-600'
                    )}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
              {!currentStylePresetId && (
                <p className="text-[10px] text-muted-foreground">커스텀 설정 적용중</p>
              )}
            </div>

            <div className="border-t pt-3" />

            {/* 2열 그리드로 컴팩트하게 배치 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">제목 크기</Label>
                <Select value={titleSize} onValueChange={(v) => setTitleSize(v as TitleSizeOption)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TITLE_SIZE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!isChartWidget && (
                <div className="space-y-1.5">
                  <Label className="text-xs">값 크기</Label>
                  <Select value={valueSize} onValueChange={(v) => setValueSize(v as ValueSizeOption)}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VALUE_SIZE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {!isChartWidget && (
                <div className="space-y-1.5">
                  <Label className="text-xs">아이콘 크기</Label>
                  <Select value={iconSize} onValueChange={(v) => setIconSize(v as IconSizeOption)}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_SIZE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs">여백</Label>
                <Select value={spacing} onValueChange={(v) => setSpacing(v as SpacingOption)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SPACING_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-xs text-muted-foreground pt-1">
              &apos;자동&apos;으로 설정하면 위젯 크기에 맞춰 자동으로 조절됩니다.
            </p>
          </TabsContent>

          {isChartWidget && (
            <TabsContent value="chart" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>차트 유형</Label>
                <Select
                  value={chartType}
                  onValueChange={(value) => setChartType(value as 'pie' | 'bar' | 'line' | 'area' | 'donut' | 'stacked-bar')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pie">파이 차트</SelectItem>
                    <SelectItem value="donut">도넛 차트</SelectItem>
                    <SelectItem value="bar">막대 차트</SelectItem>
                    <SelectItem value="stacked-bar">누적 막대</SelectItem>
                    <SelectItem value="line">라인 차트</SelectItem>
                    <SelectItem value="area">영역 차트</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <p className="text-xs text-muted-foreground">
                차트 유형 변경은 데이터와의 호환성을 확인한 후 적용하세요.
              </p>
            </TabsContent>
          )}

          {isStatWidget && (
            <TabsContent value="conditional" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>조건부 색상 활성화</Label>
                  <p className="text-xs text-muted-foreground mt-1">값에 따라 자동으로 색상이 변경됩니다</p>
                </div>
                <Switch
                  checked={enableConditionalColors}
                  onCheckedChange={setEnableConditionalColors}
                />
              </div>

              {/* Conditional Presets */}
              <div className="space-y-2">
                <Label className="text-xs">조건부 프리셋 (빠른 추가)</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {CONDITIONAL_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyConditionalPreset(preset.id, 'replace')}
                      className="px-2 py-2 text-left rounded-md border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="text-xs font-medium">{preset.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{preset.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {enableConditionalColors && (
                <div className="space-y-3">
                  <div className="border-t pt-3">
                    <Label className="text-xs text-muted-foreground">현재 규칙 ({colorRules.length}개)</Label>
                  </div>
                  {colorRules.map((rule, index) => (
                    <Card key={rule.id}>
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">규칙 {index + 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => removeColorRule(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs">조건</Label>
                            <Select
                              value={rule.operator}
                              onValueChange={(value) => updateColorRule(index, { operator: value as ConditionalColorRule['operator'] })}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="gt">&gt; (초과)</SelectItem>
                                <SelectItem value="gte">≥ (이상)</SelectItem>
                                <SelectItem value="lt">&lt; (미만)</SelectItem>
                                <SelectItem value="lte">≤ (이하)</SelectItem>
                                <SelectItem value="eq">= (같음)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">값</Label>
                            <Input
                              type="number"
                              value={rule.value}
                              onChange={(e) => updateColorRule(index, { value: Number(e.target.value) })}
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">라벨</Label>
                            <Input
                              value={rule.label || ''}
                              onChange={(e) => updateColorRule(index, { label: e.target.value })}
                              className="h-8"
                              placeholder="양호"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">텍스트 색상</Label>
                            <div className="flex gap-1">
                              <Input
                                type="color"
                                value={rule.color}
                                onChange={(e) => updateColorRule(index, { color: e.target.value })}
                                className="h-8 w-12 p-1"
                              />
                              <Input
                                value={rule.color}
                                onChange={(e) => updateColorRule(index, { color: e.target.value })}
                                className="h-8 flex-1 font-mono text-xs"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">배경 색상</Label>
                            <div className="flex gap-1">
                              <Input
                                type="color"
                                value={rule.bgColor}
                                onChange={(e) => updateColorRule(index, { bgColor: e.target.value })}
                                className="h-8 w-12 p-1"
                              />
                              <Input
                                value={rule.bgColor}
                                onChange={(e) => updateColorRule(index, { bgColor: e.target.value })}
                                className="h-8 flex-1 font-mono text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={addColorRule}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    규칙 추가
                  </Button>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSave}>
            저장
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
