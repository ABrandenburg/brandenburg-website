/**
 * Speed-to-lead message templates per source
 * Drip message template rendering with merge fields
 */

export interface SpeedToLeadContext {
    firstName?: string;
    serviceType?: string;
    source: string;
}

/**
 * Get the first speed-to-lead message for a given source
 * These fire immediately when a lead comes in
 */
export function getSpeedToLeadMessage(ctx: SpeedToLeadContext): string {
    const name = ctx.firstName ? `Hi ${ctx.firstName}, this` : 'Hi, this';
    const service = ctx.serviceType ? ` for ${ctx.serviceType}` : '';

    switch (ctx.source) {
        case 'angi':
            return `${name} is Chris from Brandenburg Plumbing. We got your request through Angi${service} and would love to help! When works best for you? Reply STOP to opt out.`;

        case 'thumbtack':
            return `${name} is Chris from Brandenburg Plumbing. Thanks for reaching out on Thumbtack${service}! We'd love to take care of this for you. What's a good time? Reply STOP to opt out.`;

        case 'lsa':
            return `${name} is Chris from Brandenburg Plumbing. We received your request${service} and can help! Are you available this week? Reply STOP to opt out.`;

        case 'website':
            return `${name} is Chris from Brandenburg Plumbing. Thanks for contacting us through our website${service}! How can we help? Reply STOP to opt out.`;

        case 'inbound_sms':
            // For inbound SMS, the AI will handle the conversation directly
            return '';

        default:
            return `${name} is Chris from Brandenburg Plumbing. Thanks for reaching out${service}! We'd love to help. When works best for you? Reply STOP to opt out.`;
    }
}

/**
 * Render a drip message template with merge fields
 * Supports: {{first_name}}, {{service_type}}, {{technician_name}}, {{review_link}}, etc.
 */
export function renderTemplate(
    template: string,
    data: Record<string, string | undefined>
): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key] || match; // Keep the placeholder if no value provided
    });
}

/**
 * Get fallback message when AI is unavailable
 */
export function getFallbackMessage(): string {
    return "Thanks for reaching out to Brandenburg Plumbing! Our team will be in touch shortly. Call us anytime at (512) 756-9847.";
}

/**
 * Get TCPA compliance messages
 */
export const TCPA_MESSAGES = {
    STOP_CONFIRMED: 'You have been unsubscribed from Brandenburg Plumbing messages. Reply START to re-subscribe.',
    START_CONFIRMED: 'You have been re-subscribed to Brandenburg Plumbing messages. Reply STOP to unsubscribe.',
    HELP: 'Brandenburg Plumbing — Call (512) 756-9847 for assistance. Reply STOP to unsubscribe from texts.',
} as const;
