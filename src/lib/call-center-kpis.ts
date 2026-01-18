// Call Center KPI Definitions
// 콜센터 관리에서 학술적으로 검증된 핵심 성과 지표

export type KPICategory = 'efficiency' | 'quality' | 'productivity' | 'wellbeing'
export type KPIUnit = 'percent' | 'number' | 'time' | 'score'
export type UserRole = 'manager' | 'team_leader' | 'agent'

export interface KPIBenchmark {
  industry: number      // 업계 평균
  good: number         // 양호 기준
  warning: number      // 주의 기준
  danger: number       // 위험 기준
  isLowerBetter?: boolean  // 낮을수록 좋은 지표 (예: 포기율, AHT)
}

export interface CallCenterKPI {
  id: string
  name: string
  nameEn: string
  description: string
  formula: string
  unit: KPIUnit
  benchmark: KPIBenchmark
  applicableRoles: UserRole[]
  category: KPICategory
  icon: string
  priority: number  // 1-5, 높을수록 중요
}

// 콜센터 핵심 KPI 정의
export const CALL_CENTER_KPIS: CallCenterKPI[] = [
  // === 효율성 지표 ===
  {
    id: 'fcr',
    name: '첫 통화 해결률',
    nameEn: 'First Call Resolution',
    description: '첫 번째 통화에서 고객 문제가 해결된 비율',
    formula: '(첫 통화 해결 건수 / 총 문의 건수) × 100',
    unit: 'percent',
    benchmark: {
      industry: 75,
      good: 80,
      warning: 70,
      danger: 60,
    },
    applicableRoles: ['manager', 'team_leader', 'agent'],
    category: 'efficiency',
    icon: 'checkCircle',
    priority: 5,
  },
  {
    id: 'aht',
    name: '평균 처리 시간',
    nameEn: 'Average Handle Time',
    description: '통화 시작부터 후처리 완료까지 평균 소요 시간 (초)',
    formula: '(총 통화시간 + 대기시간 + 후처리시간) / 총 통화수',
    unit: 'time',
    benchmark: {
      industry: 360,  // 6분
      good: 300,      // 5분
      warning: 420,   // 7분
      danger: 540,    // 9분
      isLowerBetter: true,
    },
    applicableRoles: ['manager', 'team_leader', 'agent'],
    category: 'efficiency',
    icon: 'clock',
    priority: 4,
  },
  {
    id: 'occupancy',
    name: '점유율',
    nameEn: 'Occupancy Rate',
    description: '상담사가 실제 업무에 투입된 시간 비율',
    formula: '(처리시간 / (처리시간 + 유휴시간)) × 100',
    unit: 'percent',
    benchmark: {
      industry: 75,
      good: 80,
      warning: 60,
      danger: 50,
    },
    applicableRoles: ['manager', 'team_leader'],
    category: 'efficiency',
    icon: 'percent',
    priority: 3,
  },
  {
    id: 'answer_rate',
    name: '응대율',
    nameEn: 'Answer Rate',
    description: '수신 전화 중 실제 응대한 비율',
    formula: '(응대 건수 / 총 수신 건수) × 100',
    unit: 'percent',
    benchmark: {
      industry: 92,
      good: 95,
      warning: 88,
      danger: 80,
    },
    applicableRoles: ['manager', 'team_leader'],
    category: 'efficiency',
    icon: 'phone',
    priority: 4,
  },
  {
    id: 'abandon_rate',
    name: '포기율',
    nameEn: 'Abandon Rate',
    description: '상담 연결 전 고객이 끊은 비율',
    formula: '(포기 건수 / 총 수신 건수) × 100',
    unit: 'percent',
    benchmark: {
      industry: 5,
      good: 3,
      warning: 7,
      danger: 10,
      isLowerBetter: true,
    },
    applicableRoles: ['manager', 'team_leader'],
    category: 'efficiency',
    icon: 'xCircle',
    priority: 4,
  },

  // === 품질 지표 ===
  {
    id: 'csat',
    name: '고객 만족도',
    nameEn: 'Customer Satisfaction',
    description: '고객 설문 기반 만족도 점수',
    formula: '(만족 응답 / 총 응답) × 100',
    unit: 'percent',
    benchmark: {
      industry: 78,
      good: 85,
      warning: 70,
      danger: 60,
    },
    applicableRoles: ['manager', 'team_leader', 'agent'],
    category: 'quality',
    icon: 'star',
    priority: 5,
  },
  {
    id: 'qa_score',
    name: '품질 평가',
    nameEn: 'QA Score',
    description: '모니터링 기반 상담 품질 점수',
    formula: '품질 평가 점수 평균',
    unit: 'score',
    benchmark: {
      industry: 82,
      good: 90,
      warning: 75,
      danger: 65,
    },
    applicableRoles: ['manager', 'team_leader', 'agent'],
    category: 'quality',
    icon: 'target',
    priority: 4,
  },

  // === 생산성 지표 ===
  {
    id: 'calls_per_hour',
    name: '시간당 처리 건수',
    nameEn: 'Calls Per Hour',
    description: '상담사 1인 시간당 처리량',
    formula: '처리 건수 / 근무 시간',
    unit: 'number',
    benchmark: {
      industry: 10,
      good: 12,
      warning: 8,
      danger: 5,
    },
    applicableRoles: ['manager', 'team_leader', 'agent'],
    category: 'productivity',
    icon: 'zap',
    priority: 3,
  },
  {
    id: 'conversion_rate',
    name: '전환율',
    nameEn: 'Conversion Rate',
    description: '상담 후 목표 달성 비율 (계약, 판매 등)',
    formula: '(전환 건수 / 총 상담 건수) × 100',
    unit: 'percent',
    benchmark: {
      industry: 25,
      good: 35,
      warning: 20,
      danger: 10,
    },
    applicableRoles: ['manager', 'team_leader', 'agent'],
    category: 'productivity',
    icon: 'trendingUp',
    priority: 5,
  },
  {
    id: 'callback_rate',
    name: '재통화율',
    nameEn: 'Callback Rate',
    description: '동일 건으로 재통화가 필요한 비율',
    formula: '(재통화 건수 / 총 건수) × 100',
    unit: 'percent',
    benchmark: {
      industry: 15,
      good: 10,
      warning: 20,
      danger: 30,
      isLowerBetter: true,
    },
    applicableRoles: ['manager', 'team_leader', 'agent'],
    category: 'productivity',
    icon: 'phone',
    priority: 3,
  },
  {
    id: 'completion_rate',
    name: '완료율',
    nameEn: 'Completion Rate',
    description: '할당된 업무 중 완료된 비율',
    formula: '(완료 건수 / 총 할당 건수) × 100',
    unit: 'percent',
    benchmark: {
      industry: 85,
      good: 90,
      warning: 75,
      danger: 60,
    },
    applicableRoles: ['manager', 'team_leader', 'agent'],
    category: 'productivity',
    icon: 'checkCircle',
    priority: 4,
  },

  // === 상담사 웰빙 지표 (관리자/팀장용) ===
  {
    id: 'absence_rate',
    name: '부재율',
    nameEn: 'Absence Rate',
    description: '상담 시도 중 부재 비율',
    formula: '(부재 건수 / 총 시도 건수) × 100',
    unit: 'percent',
    benchmark: {
      industry: 20,
      good: 15,
      warning: 30,
      danger: 40,
      isLowerBetter: true,
    },
    applicableRoles: ['manager', 'team_leader'],
    category: 'wellbeing',
    icon: 'userMinus',
    priority: 3,
  },
  {
    id: 'cancel_rate',
    name: '취소율',
    nameEn: 'Cancel Rate',
    description: '상담 후 취소/철회된 비율',
    formula: '(취소 건수 / 총 계약 건수) × 100',
    unit: 'percent',
    benchmark: {
      industry: 10,
      good: 5,
      warning: 15,
      danger: 25,
      isLowerBetter: true,
    },
    applicableRoles: ['manager', 'team_leader'],
    category: 'wellbeing',
    icon: 'xCircle',
    priority: 3,
  },
]

// 카테고리별 라벨
export const KPI_CATEGORY_LABELS: Record<KPICategory, string> = {
  efficiency: '효율성',
  quality: '품질',
  productivity: '생산성',
  wellbeing: '운영 건전성',
}

// 역할별 라벨
export const ROLE_LABELS: Record<UserRole, string> = {
  manager: '관리자',
  team_leader: '팀장',
  agent: '상담사',
}

// 역할별 핵심 KPI ID 목록
export const ROLE_PRIMARY_KPIS: Record<UserRole, string[]> = {
  manager: ['fcr', 'csat', 'conversion_rate', 'completion_rate', 'occupancy', 'abandon_rate'],
  team_leader: ['fcr', 'completion_rate', 'aht', 'callback_rate', 'absence_rate', 'cancel_rate'],
  agent: ['completion_rate', 'fcr', 'conversion_rate', 'aht', 'callback_rate'],
}

// KPI ID로 KPI 정보 가져오기
export function getKPIById(id: string): CallCenterKPI | undefined {
  return CALL_CENTER_KPIS.find(kpi => kpi.id === id)
}

// 역할에 해당하는 KPI 목록 가져오기
export function getKPIsForRole(role: UserRole): CallCenterKPI[] {
  return CALL_CENTER_KPIS.filter(kpi => kpi.applicableRoles.includes(role))
    .sort((a, b) => b.priority - a.priority)
}

// 값에 대한 상태 평가
export function evaluateKPIStatus(
  kpiId: string,
  value: number
): 'good' | 'warning' | 'danger' | 'neutral' {
  const kpi = getKPIById(kpiId)
  if (!kpi) return 'neutral'

  const { benchmark } = kpi
  const isLowerBetter = benchmark.isLowerBetter

  if (isLowerBetter) {
    if (value <= benchmark.good) return 'good'
    if (value <= benchmark.warning) return 'warning'
    return 'danger'
  } else {
    if (value >= benchmark.good) return 'good'
    if (value >= benchmark.warning) return 'warning'
    return 'danger'
  }
}

// 시간(초)을 분:초 형식으로 변환
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}분 ${secs}초`
}

// KPI 값 포맷팅
export function formatKPIValue(kpiId: string, value: number): string {
  const kpi = getKPIById(kpiId)
  if (!kpi) return String(value)

  switch (kpi.unit) {
    case 'percent':
      return `${value.toFixed(1)}%`
    case 'time':
      return formatTime(value)
    case 'score':
      return `${value.toFixed(0)}점`
    case 'number':
    default:
      return value.toLocaleString()
  }
}
