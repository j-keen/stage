// Badge color presets for status and category badges

export interface BadgeColorPreset {
  name: string
  fg: string   // foreground (text) color
  bg: string   // background color
}

export const BADGE_COLOR_PRESETS: BadgeColorPreset[] = [
  // Blues
  { name: '파랑', fg: '#1E40AF', bg: '#DBEAFE' },
  { name: '진한 파랑', fg: '#1E3A8A', bg: '#BFDBFE' },
  { name: '하늘', fg: '#0369A1', bg: '#E0F2FE' },
  { name: '청록', fg: '#0E7490', bg: '#CFFAFE' },
  { name: '남색', fg: '#3730A3', bg: '#E0E7FF' },

  // Greens
  { name: '초록', fg: '#047857', bg: '#D1FAE5' },
  { name: '진한 초록', fg: '#065F46', bg: '#A7F3D0' },
  { name: '라임', fg: '#4D7C0F', bg: '#ECFCCB' },
  { name: '에메랄드', fg: '#059669', bg: '#D1FAE5' },
  { name: '민트', fg: '#0D9488', bg: '#CCFBF1' },

  // Reds & Oranges
  { name: '빨강', fg: '#DC2626', bg: '#FEE2E2' },
  { name: '진한 빨강', fg: '#B91C1C', bg: '#FECACA' },
  { name: '주황', fg: '#EA580C', bg: '#FED7AA' },
  { name: '호박', fg: '#C2410C', bg: '#FFEDD5' },
  { name: '산호', fg: '#DC2626', bg: '#FEE2E2' },

  // Yellows
  { name: '노랑', fg: '#A16207', bg: '#FEF9C3' },
  { name: '진한 노랑', fg: '#854D0E', bg: '#FEF08A' },
  { name: '금색', fg: '#B45309', bg: '#FDE68A' },
  { name: '크림', fg: '#92400E', bg: '#FFFBEB' },
  { name: '레몬', fg: '#A3A30F', bg: '#FEFCE8' },

  // Purples & Pinks
  { name: '보라', fg: '#7C3AED', bg: '#EDE9FE' },
  { name: '진한 보라', fg: '#5B21B6', bg: '#DDD6FE' },
  { name: '분홍', fg: '#DB2777', bg: '#FCE7F3' },
  { name: '핫핑크', fg: '#BE185D', bg: '#FBCFE8' },
  { name: '라벤더', fg: '#7E22CE', bg: '#F3E8FF' },

  // Neutrals
  { name: '회색', fg: '#4B5563', bg: '#F3F4F6' },
  { name: '진한 회색', fg: '#374151', bg: '#E5E7EB' },
  { name: '슬레이트', fg: '#475569', bg: '#F1F5F9' },
  { name: '검정', fg: '#1F2937', bg: '#E5E7EB' },
  { name: '흰색', fg: '#6B7280', bg: '#FFFFFF' },
]

// Get preset by name
export function getPresetByName(name: string): BadgeColorPreset | undefined {
  return BADGE_COLOR_PRESETS.find(p => p.name === name)
}

// Get closest matching preset for given colors
export function findMatchingPreset(fg: string, bg: string): BadgeColorPreset | undefined {
  return BADGE_COLOR_PRESETS.find(p =>
    p.fg.toLowerCase() === fg.toLowerCase() &&
    p.bg.toLowerCase() === bg.toLowerCase()
  )
}
