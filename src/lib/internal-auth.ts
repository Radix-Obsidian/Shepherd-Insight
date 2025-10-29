// Internal API authentication helper
// Validates INTERNAL_API_KEY for server-to-server API calls
import { INTERNAL_API_KEY } from './env.server'

export type AuthValidationResult = {
  valid: boolean
  reason?: 'missing' | 'invalid_format' | 'invalid_key'
}

/**
 * Validates an Authorization header against INTERNAL_API_KEY
 * This is for server-to-server calls only, not OAuth/JWT authentication.
 * @param authHeader The Authorization header value (e.g., "Bearer <key>")
 * @returns validation result with status and reason
 */
export function validateInternalApiKey(authHeader: string | null): AuthValidationResult {
  if (!authHeader) {
    return { valid: false, reason: 'missing' }
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader

  if (!token) {
    return { valid: false, reason: 'missing' }
  }

  // Fast-fail validation: check format before constant-time comparison
  if (token.length !== 64) {
    return { valid: false, reason: 'invalid_format' }
  }

  // Check charset: must be hexadecimal (a-f, 0-9)
  if (!/^[a-f0-9]{64}$/.test(token)) {
    return { valid: false, reason: 'invalid_format' }
  }

  if (!INTERNAL_API_KEY) {
    return { valid: false, reason: 'invalid_key' }
  }

  // Use constant-time comparison to prevent timing attacks
  const keyMatches = constantTimeEqual(INTERNAL_API_KEY, token)
  return {
    valid: keyMatches,
    reason: keyMatches ? undefined : 'invalid_key'
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

