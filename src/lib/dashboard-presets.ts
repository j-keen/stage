import type { WidgetConfig } from '@/stores/dashboard-store'

export interface BuiltInPreset {
  id: string
  name: string
  description: string
  widgets: WidgetConfig[]
}

// ===== 역할별 프리셋 =====

// 관리자용: 전체 현황 + 팀 성과 + 정체건 관리
const managerPreset: BuiltInPreset = {
  id: 'preset-manager',
  name: '관리자용',
  description: '전체 현황 + 팀 성과 + 정체건 관리',
  widgets: [
    // Row 1: 핵심 KPI (y=0, h=2)
    {
      id: 'mgr-total',
      type: 'stat',
      title: '총 접수',
      x: 0, y: 0, w: 2, h: 2,
      config: { metric: 'totalCustomers', icon: 'users' },
    },
    {
      id: 'mgr-completed',
      type: 'stat',
      title: '완료',
      x: 2, y: 0, w: 2, h: 2,
      config: { metric: 'completedCount', icon: 'checkCircle' },
    },
    {
      id: 'mgr-rate',
      type: 'stat',
      title: '성공률',
      x: 4, y: 0, w: 2, h: 2,
      config: { metric: 'successRate', icon: 'percent', isPercentage: true },
    },
    {
      id: 'mgr-goal',
      type: 'gauge',
      title: '월 목표 달성률',
      x: 6, y: 0, w: 3, h: 3,
      config: { goalType: 'previous_month', targetMetric: 'completed' },
    },
    {
      id: 'mgr-callback-count',
      type: 'statusCount',
      title: '재통화',
      x: 9, y: 0, w: 1, h: 1,
      config: { status: 'callback' },
    },
    {
      id: 'mgr-absent-count',
      type: 'statusCount',
      title: '부재',
      x: 10, y: 0, w: 1, h: 1,
      config: { status: 'absent' },
    },
    {
      id: 'mgr-inprogress-count',
      type: 'statusCount',
      title: '진행중',
      x: 11, y: 0, w: 1, h: 1,
      config: { status: 'in_progress' },
    },
    {
      id: 'mgr-stale-stat',
      type: 'stat',
      title: '정체건',
      x: 9, y: 1, w: 3, h: 2,
      config: { metric: 'staleCount', icon: 'alertCircle' },
    },
    // Row 2: 분포 차트 + 담당자 성과 (y=3, h=4)
    {
      id: 'mgr-status-dist',
      type: 'chart',
      title: '상태별 분포',
      x: 0, y: 3, w: 4, h: 4,
      config: { chartType: 'donut' },
    },
    {
      id: 'mgr-performance',
      type: 'table',
      title: '담당자별 실적',
      x: 4, y: 3, w: 5, h: 4,
      config: { tableType: 'assignee', sortBy: 'completedCount' },
    },
    {
      id: 'mgr-stale-list',
      type: 'list',
      title: '정체건 목록',
      x: 9, y: 3, w: 3, h: 4,
      config: { listType: 'stale', maxItems: 8 },
    },
    // Row 3: 추이 + 타임라인 (y=7, h=3)
    {
      id: 'mgr-trend',
      type: 'chart',
      title: '일별 추이',
      x: 0, y: 7, w: 6, h: 3,
      config: { chartType: 'area' },
    },
    {
      id: 'mgr-timeline',
      type: 'timeline',
      title: '실시간 활동',
      x: 6, y: 7, w: 6, h: 3,
      config: { maxItems: 10, autoRefresh: false },
    },
  ],
}

// 상담사용: 내 업무 중심 + 재통화 관리
const consultantPreset: BuiltInPreset = {
  id: 'preset-consultant',
  name: '상담사용',
  description: '내 업무 현황 + 재통화 관리',
  widgets: [
    // Row 1: 내 현황 (y=0, h=2)
    {
      id: 'con-my-total',
      type: 'stat',
      title: '내 총 건수',
      x: 0, y: 0, w: 3, h: 2,
      config: { metric: 'totalCustomers', icon: 'users', filterByCurrentUser: true },
    },
    {
      id: 'con-my-progress',
      type: 'stat',
      title: '진행중',
      x: 3, y: 0, w: 3, h: 2,
      config: { metric: 'inProgressCount', icon: 'clock', filterByCurrentUser: true },
    },
    {
      id: 'con-my-completed',
      type: 'stat',
      title: '내 완료',
      x: 6, y: 0, w: 3, h: 2,
      config: { metric: 'completedCount', icon: 'checkCircle', filterByCurrentUser: true },
    },
    {
      id: 'con-my-rate',
      type: 'stat',
      title: '내 성공률',
      x: 9, y: 0, w: 3, h: 2,
      config: { metric: 'successRate', icon: 'percent', isPercentage: true, filterByCurrentUser: true },
    },
    // Row 2: 재통화 + 신규 알림 (y=2, h=4)
    {
      id: 'con-callbacks',
      type: 'list',
      title: '오늘 재통화 예정',
      x: 0, y: 2, w: 6, h: 4,
      config: { listType: 'callback', maxItems: 10, filterByCurrentUser: true },
    },
    {
      id: 'con-new',
      type: 'list',
      title: '신규 유입 (미처리)',
      x: 6, y: 2, w: 6, h: 4,
      config: { listType: 'new_incomplete', maxItems: 10, filterByCurrentUser: true },
    },
    // Row 3: 상태별 카운트 + 목표 게이지 (y=6, h=3)
    {
      id: 'con-prospect',
      type: 'statusCount',
      title: '가망',
      x: 0, y: 6, w: 2, h: 2,
      config: { status: 'prospect', filterByCurrentUser: true },
    },
    {
      id: 'con-callback',
      type: 'statusCount',
      title: '재통화',
      x: 2, y: 6, w: 2, h: 2,
      config: { status: 'callback', filterByCurrentUser: true },
    },
    {
      id: 'con-absent',
      type: 'statusCount',
      title: '부재',
      x: 4, y: 6, w: 2, h: 2,
      config: { status: 'absent', filterByCurrentUser: true },
    },
    {
      id: 'con-goal',
      type: 'gauge',
      title: '오늘 목표',
      x: 6, y: 6, w: 3, h: 3,
      config: { goalType: 'manual', goalValue: 10, targetMetric: 'completed', filterByCurrentUser: true },
    },
    {
      id: 'con-timeline',
      type: 'timeline',
      title: '내 활동',
      x: 9, y: 6, w: 3, h: 3,
      config: { maxItems: 5, filterByCurrentUser: true },
    },
  ],
}

// 접수담당용: 신규 유입 모니터링
const agentPreset: BuiltInPreset = {
  id: 'preset-agent',
  name: '접수담당용',
  description: '신규 유입 모니터링',
  widgets: [
    // Row 1: 오늘 현황 (y=0, h=2)
    {
      id: 'ag-today-total',
      type: 'stat',
      title: '오늘 접수',
      x: 0, y: 0, w: 4, h: 2,
      config: { metric: 'totalCustomers', icon: 'users' },
    },
    {
      id: 'ag-today-prospect',
      type: 'stat',
      title: '오늘 가망',
      x: 4, y: 0, w: 4, h: 2,
      config: { metric: 'prospectCustomers', icon: 'userPlus' },
    },
    {
      id: 'ag-incomplete',
      type: 'stat',
      title: '미입력건',
      x: 8, y: 0, w: 4, h: 2,
      config: { metric: 'incompleteCount', icon: 'alertCircle' },
    },
    // Row 2: 신규 유입 리스트 (y=2, h=5)
    {
      id: 'ag-new-list',
      type: 'list',
      title: '신규 유입 알림',
      x: 0, y: 2, w: 6, h: 5,
      config: { listType: 'new_incomplete', maxItems: 12 },
    },
    {
      id: 'ag-timeline',
      type: 'timeline',
      title: '실시간 접수 현황',
      x: 6, y: 2, w: 6, h: 5,
      config: { maxItems: 15, autoRefresh: true, refreshInterval: 30000 },
    },
    // Row 3: 상태별 카운트 (y=7, h=2)
    {
      id: 'ag-prospect-count',
      type: 'statusCount',
      title: '가망',
      x: 0, y: 7, w: 2, h: 2,
      config: { status: 'prospect' },
    },
    {
      id: 'ag-progress-count',
      type: 'statusCount',
      title: '진행중',
      x: 2, y: 7, w: 2, h: 2,
      config: { status: 'in_progress' },
    },
    {
      id: 'ag-completed-count',
      type: 'statusCount',
      title: '완료',
      x: 4, y: 7, w: 2, h: 2,
      config: { status: 'completed' },
    },
    {
      id: 'ag-callback-count',
      type: 'statusCount',
      title: '재통화',
      x: 6, y: 7, w: 2, h: 2,
      config: { status: 'callback' },
    },
    {
      id: 'ag-absent-count',
      type: 'statusCount',
      title: '부재',
      x: 8, y: 7, w: 2, h: 2,
      config: { status: 'absent' },
    },
    {
      id: 'ag-cancelled-count',
      type: 'statusCount',
      title: '취소',
      x: 10, y: 7, w: 2, h: 2,
      config: { status: 'cancelled' },
    },
  ],
}

// IoT Admin Panel 스타일 프리셋
const iotAdminPreset: BuiltInPreset = {
  id: 'preset-iot-admin',
  name: 'IoT Admin Panel',
  description: 'IoT 스타일 관리 대시보드',
  widgets: [
    // Row 1: 계정 정보 (y=0, h=2)
    {
      id: 'iot-account',
      type: 'account',
      title: 'Account information',
      x: 0,
      y: 0,
      w: 12,
      h: 2,
      config: {},
    },

    // Row 2: 라이브러리 통계 (y=2, h=2)
    {
      id: 'iot-total',
      type: 'libraryQuota',
      title: '총 고객',
      x: 0,
      y: 2,
      w: 3,
      h: 2,
      config: { metric: 'totalCustomers' },
    },
    {
      id: 'iot-prospect',
      type: 'libraryQuota',
      title: '가망고객',
      x: 3,
      y: 2,
      w: 3,
      h: 2,
      config: { metric: 'prospectCustomers' },
    },
    {
      id: 'iot-inprogress',
      type: 'libraryQuota',
      title: '진행중',
      x: 6,
      y: 2,
      w: 3,
      h: 2,
      config: { metric: 'inProgressCount' },
    },
    {
      id: 'iot-success-rate',
      type: 'successRate',
      title: 'Success rate',
      x: 9,
      y: 2,
      w: 3,
      h: 2,
      config: {},
    },

    // Row 3: 중간 위젯들 (y=4, h=4)
    {
      id: 'iot-donut',
      type: 'donutStats',
      title: '상태 현황',
      x: 0,
      y: 4,
      w: 3,
      h: 4,
      config: {},
    },
    {
      id: 'iot-callbacks',
      type: 'list',
      title: '재통화 예정',
      x: 3,
      y: 4,
      w: 3,
      h: 4,
      config: { listType: 'callback', maxItems: 6 },
    },
    {
      id: 'iot-category',
      type: 'categoryStats',
      title: '담당자별 현황',
      x: 6,
      y: 4,
      w: 3,
      h: 4,
      config: {},
    },
    {
      id: 'iot-traffic',
      type: 'dataTraffic',
      title: '일별 추이',
      x: 9,
      y: 4,
      w: 3,
      h: 4,
      config: {},
    },

    // Row 4: 쿼터 카드들 (y=8, h=3)
    {
      id: 'iot-quota-1',
      type: 'circularQuota',
      title: '가망 전환',
      x: 0,
      y: 8,
      w: 2,
      h: 3,
      config: { targetMetric: 'prospect' },
    },
    {
      id: 'iot-quota-2',
      type: 'circularQuota',
      title: '진행중 처리',
      x: 2,
      y: 8,
      w: 2,
      h: 3,
      config: { targetMetric: 'in_progress' },
    },
    {
      id: 'iot-quota-3',
      type: 'circularQuota',
      title: '완료율',
      x: 4,
      y: 8,
      w: 2,
      h: 3,
      config: { targetMetric: 'completed' },
    },
    {
      id: 'iot-quota-4',
      type: 'circularQuota',
      title: '재통화 처리',
      x: 6,
      y: 8,
      w: 2,
      h: 3,
      config: { targetMetric: 'callback' },
    },
    {
      id: 'iot-quota-5',
      type: 'circularQuota',
      title: '부재 처리',
      x: 8,
      y: 8,
      w: 2,
      h: 3,
      config: { targetMetric: 'absent' },
    },
    {
      id: 'iot-quota-6',
      type: 'circularQuota',
      title: '취소 현황',
      x: 10,
      y: 8,
      w: 2,
      h: 3,
      config: { targetMetric: 'cancelled' },
    },
  ],
}

// 역할별 프리셋 그룹
export const ROLE_PRESETS: BuiltInPreset[] = [
  iotAdminPreset,
  managerPreset,
  consultantPreset,
  agentPreset,
]

export const BUILT_IN_PRESETS: BuiltInPreset[] = [
  iotAdminPreset,
  managerPreset,
  consultantPreset,
  agentPreset,
]
