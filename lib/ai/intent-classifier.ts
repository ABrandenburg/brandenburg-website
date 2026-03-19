/**
 * Lightweight intent classifier using Claude Haiku
 * Used to detect customer intent when they reply to drip messages
 */

export type DripReplyIntent =
    | 'POSITIVE'
    | 'QUESTION'
    | 'BOOKING'
    | 'NEGATIVE'
    | 'WRONG_NUMBER'
    | 'IRRELEVANT';

/**
 * Classify the intent of a customer's reply to a drip message
 * Uses Claude Haiku for speed and cost (~$0.0002 per call)
 */
export async function classifyDripReply(
    customerMessage: string,
    dripContext: string
): Promise<DripReplyIntent> {
    try {
        const Anthropic = (await import('@anthropic-ai/sdk')).default;
        const client = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });

        const response = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 50,
            system: `You are an intent classifier for a plumbing company's SMS follow-up system. Classify the customer's reply into exactly one category:

POSITIVE - Customer is interested, says yes, wants to proceed, asks about scheduling
QUESTION - Customer has a question about the service, estimate, or company
BOOKING - Customer explicitly wants to book/schedule an appointment
NEGATIVE - Customer declines, says no, not interested, already found someone else
WRONG_NUMBER - Customer says wrong number, doesn't know the company, not the right person
IRRELEVANT - Message is unrelated, spam, or doesn't make sense in context

Respond with ONLY the category name, nothing else.`,
            messages: [
                {
                    role: 'user',
                    content: `Drip message sent: "${dripContext}"\n\nCustomer replied: "${customerMessage}"`,
                },
            ],
        });

        const textBlock = response.content.find(b => b.type === 'text');
        const intent = textBlock?.text?.trim().toUpperCase() as DripReplyIntent;

        const validIntents: DripReplyIntent[] = [
            'POSITIVE', 'QUESTION', 'BOOKING', 'NEGATIVE', 'WRONG_NUMBER', 'IRRELEVANT',
        ];

        if (validIntents.includes(intent)) {
            return intent;
        }

        console.warn(`Unknown intent from classifier: ${intent}, defaulting to POSITIVE`);
        return 'POSITIVE';
    } catch (error) {
        console.error('Intent classification failed:', error);
        // Default to POSITIVE so a human or AI picks up the conversation
        return 'POSITIVE';
    }
}
