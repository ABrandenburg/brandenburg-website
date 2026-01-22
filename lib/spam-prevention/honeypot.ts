/**
 * Honeypot field validation utility
 *
 * Honeypot fields are hidden form fields that humans won't see or fill,
 * but automated bots typically will. If the field contains a value,
 * we reject the submission as spam.
 */

export const HONEYPOT_FIELD_NAME = 'website_url' // Looks legitimate to bots

export interface HoneypotValidationResult {
  isSpam: boolean
  reason?: string
}

export function validateHoneypot(fieldValue: string | undefined | null): HoneypotValidationResult {
  // If honeypot field has any value, it's likely a bot
  if (fieldValue && fieldValue.trim().length > 0) {
    return {
      isSpam: true,
      reason: 'Honeypot field was filled'
    }
  }

  return { isSpam: false }
}
