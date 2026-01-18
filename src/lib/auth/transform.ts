// Auth credential transformation utilities
// Transforms simple username/password to Supabase Auth compatible format

const AUTH_EMAIL_DOMAIN = process.env.AUTH_EMAIL_DOMAIN || 'crm.internal'
const AUTH_PASSWORD_SUFFIX = process.env.AUTH_PASSWORD_SUFFIX || '_CRM_SECURE_2024'

/**
 * Transform username to internal email format
 * e.g., "admin" -> "admin@crm.internal"
 */
export function usernameToEmail(username: string): string {
  // Remove any spaces and convert to lowercase
  const cleanUsername = username.trim().toLowerCase()
  return `${cleanUsername}@${AUTH_EMAIL_DOMAIN}`
}

/**
 * Transform 4-digit password to secure password format
 * e.g., "1234" -> "1234_CRM_SECURE_2024"
 */
export function transformPassword(password: string): string {
  return `${password}${AUTH_PASSWORD_SUFFIX}`
}

/**
 * Extract username from internal email
 * e.g., "admin@crm.internal" -> "admin"
 */
export function emailToUsername(email: string): string {
  return email.split('@')[0]
}

/**
 * Validate username format
 * - Only letters, numbers, and underscores
 * - 3-20 characters
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username) {
    return { valid: false, error: '아이디를 입력해주세요' }
  }

  if (username.length < 3) {
    return { valid: false, error: '아이디는 3자 이상이어야 합니다' }
  }

  if (username.length > 20) {
    return { valid: false, error: '아이디는 20자 이하여야 합니다' }
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: '아이디는 영문, 숫자, 밑줄만 사용할 수 있습니다' }
  }

  return { valid: true }
}

/**
 * Validate 4-digit password
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: '비밀번호를 입력해주세요' }
  }

  if (!/^\d{4}$/.test(password)) {
    return { valid: false, error: '비밀번호는 숫자 4자리입니다' }
  }

  return { valid: true }
}

/**
 * Get credentials for Supabase Auth
 */
export function getAuthCredentials(username: string, password: string) {
  return {
    email: usernameToEmail(username),
    password: transformPassword(password),
  }
}
