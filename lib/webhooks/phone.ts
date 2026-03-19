/**
 * Phone number normalization to E.164 format
 * Handles US phone numbers with various input formats
 */

/**
 * Normalize a phone number to E.164 format (+1XXXXXXXXXX)
 * Handles: (512) 756-9847, 512-756-9847, 5127569847, +15127569847, 15127569847
 */
export function normalizePhone(phone: string | null | undefined): string | null {
    if (!phone) return null;

    // Strip everything except digits and leading +
    const cleaned = phone.replace(/[^\d+]/g, '');

    // Remove leading + if present, then work with digits only
    const digits = cleaned.replace(/^\+/, '');

    if (digits.length === 10) {
        // US number without country code: 5127569847
        return `+1${digits}`;
    }

    if (digits.length === 11 && digits.startsWith('1')) {
        // US number with country code: 15127569847
        return `+${digits}`;
    }

    // Already in a valid-looking format with country code
    if (digits.length >= 10 && digits.length <= 15) {
        return `+${digits}`;
    }

    // Invalid — too short or too long
    return null;
}

/**
 * Format E.164 phone for display: +15127569847 → (512) 756-9847
 */
export function formatPhoneDisplay(e164: string): string {
    if (!e164 || !e164.startsWith('+1') || e164.length !== 12) {
        return e164 || '';
    }
    const digits = e164.slice(2); // remove +1
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/**
 * Validate that a string is a valid E.164 phone number
 */
export function isValidE164(phone: string): boolean {
    return /^\+[1-9]\d{9,14}$/.test(phone);
}
