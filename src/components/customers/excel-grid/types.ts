// Excel Grid 시스템 타입 정의

export type GridCellType = 'category' | 'label' | 'input' | 'special'
export type InputFieldType = 'text' | 'number' | 'select' | 'date' | 'datetime' | 'checkbox' | 'textarea'
export type SpecialCellType = 'history' | 'duplicates'
export type TextAlign = 'left' | 'center' | 'right'

export interface SelectOption {
  value: string
  label: string
}

// 기본 셀 설정
export interface ExcelGridCell {
  id: string
  type: GridCellType
  colSpan: number // 1-12
  rowSpan?: number // 기본값 1

  // 공통 스타일링
  marginTop?: number
  marginBottom?: number
  marginLeft?: number
  marginRight?: number
  paddingX?: number
  paddingY?: number
  textAlign?: TextAlign
  backgroundColor?: string

  // Category/Label용
  content?: string

  // Input용
  fieldId?: string
  inputType?: InputFieldType
  placeholder?: string
  options?: SelectOption[]

  // Special용 (history, duplicates)
  specialType?: SpecialCellType
}

// 행 설정
export interface ExcelGridRow {
  id: string
  cells: ExcelGridCell[]
  visible: boolean
  height?: number // 기본값은 셀 타입에 따라 결정
}

// 전체 레이아웃
export interface ExcelGridLayout {
  id: string
  name: string
  description?: string
  rows: ExcelGridRow[]
  version: number
}

// 편집 모드 상태
export interface ExcelGridEditorState {
  isEditMode: boolean
  selectedCellId: string | null
  selectedRowId: string | null
  draggedCellId: string | null
  resizingCellId: string | null
}

// 그리드 컨테이너 Props
export interface ExcelGridContainerProps {
  layout: ExcelGridLayout
  isEditMode?: boolean
  onLayoutChange?: (layout: ExcelGridLayout) => void

  // 데이터 바인딩
  data: Record<string, unknown>
  onFieldChange: (fieldId: string, value: unknown) => void

  // 옵션 데이터 (select 필드용)
  fieldOptions?: Record<string, SelectOption[]>

  // 저장 상태
  savingFields?: Set<string>

  // 특수 컴포넌트 (history, duplicates)
  renderSpecialCell?: (cellType: SpecialCellType, cell: ExcelGridCell) => React.ReactNode
}

// 기본 셀 Props
export interface ExcelGridCellProps {
  cell: ExcelGridCell
  isFirstInRow?: boolean
  isFirstRow?: boolean
  isEditMode?: boolean
  isSelected?: boolean
  onClick?: () => void
  onResize?: (newColSpan: number) => void
  children?: React.ReactNode
}

// Category 셀 Props
export interface CategoryCellProps {
  cell: ExcelGridCell
  isEditMode?: boolean
  isSelected?: boolean
  onClick?: () => void
  onContentChange?: (content: string) => void
}

// Label 셀 Props
export interface LabelCellProps {
  cell: ExcelGridCell
  isEditMode?: boolean
  isSelected?: boolean
  onClick?: () => void
  onContentChange?: (content: string) => void
}

// Input 셀 Props
export interface InputCellProps {
  cell: ExcelGridCell
  value: unknown
  onChange: (value: unknown) => void
  options?: SelectOption[]
  isSaving?: boolean
  isEditMode?: boolean
  isSelected?: boolean
  onClick?: () => void
}

// 그리드 스타일 상수
export const GRID_CONSTANTS = {
  columns: 12,
  cellHeight: 36,
  categoryHeight: 32,
  borderWidth: 1,
  borderColor: '#E5E7EB',
  borderColorFocus: '#3B82F6',
  borderColorCategory: '#D1D5DB',

  // 배경색
  bgCategory: '#F9FAFB',
  bgLabel: '#FAFAFA',
  bgInput: '#FFFFFF',
  bgHover: '#F3F4F6',
  bgSelected: '#EFF6FF',

  // 텍스트 색상
  textPrimary: '#111827',
  textLabel: '#6B7280',
  textCategory: '#374151',
  textPlaceholder: '#9CA3AF',

  // 패딩 기본값
  defaultPaddingX: 8,
  defaultPaddingY: 4,
} as const

// 기본 레이아웃 생성 헬퍼
export function createDefaultLayout(): ExcelGridLayout {
  return {
    id: 'default',
    name: '기본 레이아웃',
    description: '표준 고객 정보 레이아웃',
    version: 1,
    rows: [
      // 기본 정보 섹션
      {
        id: 'row-basic-header',
        visible: true,
        cells: [
          { id: 'cat-basic', type: 'category', colSpan: 12, content: '기본 정보' }
        ]
      },
      {
        id: 'row-basic-1',
        visible: true,
        cells: [
          { id: 'lbl-name', type: 'label', colSpan: 2, content: '이름', textAlign: 'right' },
          { id: 'inp-name', type: 'input', colSpan: 2, fieldId: 'name', inputType: 'text' },
          { id: 'lbl-category', type: 'label', colSpan: 2, content: '분류', textAlign: 'right' },
          { id: 'inp-category', type: 'input', colSpan: 2, fieldId: 'category', inputType: 'select' },
          { id: 'lbl-status', type: 'label', colSpan: 2, content: '상태', textAlign: 'right' },
          { id: 'inp-status', type: 'input', colSpan: 2, fieldId: 'status', inputType: 'select' },
        ]
      },
      {
        id: 'row-basic-2',
        visible: true,
        cells: [
          { id: 'lbl-birth', type: 'label', colSpan: 2, content: '생년월일', textAlign: 'right' },
          { id: 'inp-birth', type: 'input', colSpan: 2, fieldId: 'birth_date', inputType: 'date' },
          { id: 'lbl-gender', type: 'label', colSpan: 2, content: '성별', textAlign: 'right' },
          { id: 'inp-gender', type: 'input', colSpan: 2, fieldId: 'gender', inputType: 'select' },
          { id: 'lbl-phone', type: 'label', colSpan: 2, content: '전화번호', textAlign: 'right' },
          { id: 'inp-phone', type: 'input', colSpan: 2, fieldId: 'phone', inputType: 'text' },
        ]
      },
      {
        id: 'row-basic-3',
        visible: true,
        cells: [
          { id: 'lbl-address', type: 'label', colSpan: 2, content: '주소', textAlign: 'right' },
          { id: 'inp-address', type: 'input', colSpan: 10, fieldId: 'address', inputType: 'text' },
        ]
      },

      // 대출 정보 섹션
      {
        id: 'row-loan-header',
        visible: true,
        cells: [
          { id: 'cat-loan', type: 'category', colSpan: 12, content: '대출 정보' }
        ]
      },
      {
        id: 'row-loan-1',
        visible: true,
        cells: [
          { id: 'lbl-existing-loans', type: 'label', colSpan: 2, content: '보유대출(만원)', textAlign: 'right' },
          { id: 'inp-existing-loans', type: 'input', colSpan: 2, fieldId: 'existing_loans', inputType: 'number' },
          { id: 'lbl-credit-score', type: 'label', colSpan: 2, content: '신용점수', textAlign: 'right' },
          { id: 'inp-credit-score', type: 'input', colSpan: 2, fieldId: 'credit_score', inputType: 'number' },
          { id: 'lbl-required-amount', type: 'label', colSpan: 2, content: '필요자금(만원)', textAlign: 'right' },
          { id: 'inp-required-amount', type: 'input', colSpan: 2, fieldId: 'required_amount', inputType: 'number' },
        ]
      },
      {
        id: 'row-loan-2',
        visible: true,
        cells: [
          { id: 'lbl-loan-amount', type: 'label', colSpan: 2, content: '희망금액', textAlign: 'right' },
          { id: 'inp-loan-amount', type: 'input', colSpan: 2, fieldId: 'loan_amount', inputType: 'number' },
          { id: 'lbl-fund-purpose', type: 'label', colSpan: 2, content: '자금용도', textAlign: 'right' },
          { id: 'inp-fund-purpose', type: 'input', colSpan: 6, fieldId: 'fund_purpose', inputType: 'text' },
        ]
      },

      // 배정 정보 섹션
      {
        id: 'row-assignment-header',
        visible: true,
        cells: [
          { id: 'cat-assignment', type: 'category', colSpan: 12, content: '배정 정보' }
        ]
      },
      {
        id: 'row-assignment-1',
        visible: true,
        cells: [
          { id: 'lbl-assigned-to', type: 'label', colSpan: 2, content: '담당자', textAlign: 'right' },
          { id: 'inp-assigned-to', type: 'input', colSpan: 2, fieldId: 'assigned_to', inputType: 'select' },
          { id: 'lbl-branch', type: 'label', colSpan: 2, content: '접수처', textAlign: 'right' },
          { id: 'inp-branch', type: 'input', colSpan: 2, fieldId: 'branch_id', inputType: 'select' },
          { id: 'lbl-callback', type: 'label', colSpan: 2, content: '콜백일시', textAlign: 'right' },
          { id: 'inp-callback', type: 'input', colSpan: 2, fieldId: 'callback_date', inputType: 'datetime' },
        ]
      },

      // 직장 정보 섹션
      {
        id: 'row-employment-header',
        visible: true,
        cells: [
          { id: 'cat-employment', type: 'category', colSpan: 12, content: '직장 정보' }
        ]
      },
      {
        id: 'row-employment-1',
        visible: true,
        cells: [
          { id: 'lbl-occupation', type: 'label', colSpan: 2, content: '직업', textAlign: 'right' },
          { id: 'inp-occupation', type: 'input', colSpan: 2, fieldId: 'occupation', inputType: 'text' },
          { id: 'lbl-income', type: 'label', colSpan: 2, content: '급여(만원)', textAlign: 'right' },
          { id: 'inp-income', type: 'input', colSpan: 2, fieldId: 'income', inputType: 'number' },
          { id: 'lbl-employment-period', type: 'label', colSpan: 2, content: '재직기간', textAlign: 'right' },
          { id: 'inp-employment-period', type: 'input', colSpan: 2, fieldId: 'employment_period', inputType: 'text' },
        ]
      },
      {
        id: 'row-employment-2',
        visible: true,
        cells: [
          { id: 'lbl-loan-purpose', type: 'label', colSpan: 2, content: '대출 목적', textAlign: 'right' },
          { id: 'inp-loan-purpose', type: 'input', colSpan: 10, fieldId: 'loan_purpose', inputType: 'text' },
        ]
      },

      // 보유 현황 섹션
      {
        id: 'row-status-header',
        visible: true,
        cells: [
          { id: 'cat-status', type: 'category', colSpan: 12, content: '보유 현황' }
        ]
      },
      {
        id: 'row-status-1',
        visible: true,
        cells: [
          { id: 'lbl-overdue', type: 'label', colSpan: 2, content: '연체', textAlign: 'right' },
          { id: 'inp-overdue', type: 'input', colSpan: 1, fieldId: 'has_overdue', inputType: 'checkbox' },
          { id: 'lbl-license', type: 'label', colSpan: 2, content: '면허증', textAlign: 'right' },
          { id: 'inp-license', type: 'input', colSpan: 1, fieldId: 'has_license', inputType: 'checkbox' },
          { id: 'lbl-insurance', type: 'label', colSpan: 2, content: '4대보험', textAlign: 'right' },
          { id: 'inp-insurance', type: 'input', colSpan: 1, fieldId: 'has_insurance', inputType: 'checkbox' },
          { id: 'lbl-credit-card', type: 'label', colSpan: 2, content: '신용카드', textAlign: 'right' },
          { id: 'inp-credit-card', type: 'input', colSpan: 1, fieldId: 'has_credit_card', inputType: 'checkbox' },
        ]
      },

      // 메모 섹션
      {
        id: 'row-notes-header',
        visible: true,
        cells: [
          { id: 'cat-notes', type: 'category', colSpan: 12, content: '메모' }
        ]
      },
      {
        id: 'row-notes-1',
        visible: true,
        cells: [
          { id: 'inp-notes', type: 'input', colSpan: 12, fieldId: 'notes', inputType: 'textarea' },
        ]
      },

      // 특수 섹션: 변경 이력
      {
        id: 'row-history',
        visible: true,
        cells: [
          { id: 'special-history', type: 'special', colSpan: 12, specialType: 'history' }
        ]
      },

      // 특수 섹션: 중복 고객
      {
        id: 'row-duplicates',
        visible: true,
        cells: [
          { id: 'special-duplicates', type: 'special', colSpan: 12, specialType: 'duplicates' }
        ]
      },
    ]
  }
}

// 유틸리티: 새 셀 ID 생성
export function generateCellId(): string {
  return `cell-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// 유틸리티: 새 행 ID 생성
export function generateRowId(): string {
  return `row-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// 유틸리티: 행의 총 colSpan 계산
export function getRowTotalColSpan(row: ExcelGridRow): number {
  return row.cells.reduce((sum, cell) => sum + cell.colSpan, 0)
}

// 유틸리티: 행에 셀 추가 가능 여부
export function canAddCellToRow(row: ExcelGridRow, colSpan: number = 1): boolean {
  return getRowTotalColSpan(row) + colSpan <= GRID_CONSTANTS.columns
}
