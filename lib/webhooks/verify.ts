/**
 * Webhook authentication verification per source
 */

import crypto from 'crypto';

/**
 * Verify Angi webhook via x-api-key header
 */
export function verifyAngiWebhook(apiKey: string | null): boolean {
    const expected = process.env.ANGI_API_KEY;
    if (!expected || !apiKey) return false;
    return crypto.timingSafeEqual(
        Buffer.from(apiKey),
        Buffer.from(expected)
    );
}

/**
 * Verify Thumbtack webhook via HMAC signature
 */
export function verifyThumbtackWebhook(
    payload: string,
    signature: string | null
): boolean {
    const secret = process.env.TT_WEBHOOK_SECRET;
    if (!secret || !signature) return false;

    const expected = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expected)
    );
}

/**
 * Verify Google LSA webhook via google_key field
 */
export function verifyGoogleLsaWebhook(googleKey: string | null): boolean {
    const expected = process.env.GOOGLE_LSA_WEBHOOK_KEY;
    if (!expected || !googleKey) return false;
    return crypto.timingSafeEqual(
        Buffer.from(googleKey),
        Buffer.from(expected)
    );
}

/**
 * Verify ServiceTitan webhook via X-ST-Signature HMAC-SHA256
 */
export function verifyServiceTitanWebhook(
    payload: string,
    signature: string | null
): boolean {
    const secret = process.env.ST_WEBHOOK_HMAC_KEY;
    if (!secret || !signature) return false;

    const expected = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expected)
    );
}

/**
 * Verify Twilio webhook request signature
 * Uses the twilio SDK's validateRequest under the hood
 */
export async function verifyTwilioWebhook(
    url: string,
    params: Record<string, string>,
    twilioSignature: string | null
): Promise<boolean> {
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!authToken || !twilioSignature) return false;

    try {
        const twilio = (await import('twilio')).default;
        return twilio.validateRequest(authToken, twilioSignature, url, params);
    } catch {
        return false;
    }
}
