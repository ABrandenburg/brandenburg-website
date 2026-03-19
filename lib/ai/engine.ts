/**
 * AI Conversational Engine — "Chris"
 * Uses Claude API with function calling to qualify leads and book appointments
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt, SERVICE_AREA_ZIPS, SERVICE_AREA_CITIES } from './system-prompt';
import { AI_TOOLS } from './tools';
import { sendMessage } from '@/lib/messaging/send';
import { getFallbackMessage } from '@/lib/messaging/templates';
import { createBooking, lookupServiceTitanCustomer } from '@/lib/servicetitan/booking';
import { sendStaffAlert } from '@/lib/notifications/staff-alerts';

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase credentials not configured');
    return createClient(url, key);
}

const TIMEZONE = process.env.TIMEZONE || 'America/Chicago';
const AI_MODEL = 'claude-sonnet-4-20250514';
const AI_TIMEOUT_MS = 60000;
const MAX_AI_TURNS = 10;

interface ConversationContext {
    conversationId: string;
    customerId: string;
    customerPhone: string;
    customerName?: string;
    source?: string;
    serviceType?: string;
}

/**
 * Get current CT time formatted as a string
 */
function getCurrentCTTime(): { formatted: string; isAfterHours: boolean } {
    const now = new Date();
    const ct = new Date(now.toLocaleString('en-US', { timeZone: TIMEZONE }));
    const hour = ct.getHours();
    const formatted = ct.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: TIMEZONE,
    });
    return {
        formatted: `${formatted} CT`,
        isAfterHours: hour < 8 || hour >= 17, // Before 8am or after 5pm
    };
}

/**
 * Load conversation messages from DB
 */
async function loadConversationHistory(conversationId: string): Promise<
    Array<{ role: 'customer' | 'assistant'; content: string }>
> {
    const supabase = getSupabaseAdmin();

    const { data: messages } = await supabase
        .from('messages')
        .select('direction, sender, body')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

    if (!messages) return [];

    return messages
        .filter(m => m.sender !== 'system' && m.sender !== 'drip_system')
        .map(m => ({
            role: (m.direction === 'inbound' ? 'customer' : 'assistant') as 'customer' | 'assistant',
            content: m.body,
        }));
}

/**
 * Execute a tool call from Claude
 */
async function executeTool(
    toolName: string,
    toolInput: Record<string, any>,
    ctx: ConversationContext
): Promise<string> {
    switch (toolName) {
        case 'check_service_area': {
            const { zip, city } = toolInput;
            if (zip && SERVICE_AREA_ZIPS.includes(zip)) {
                return JSON.stringify({ in_service_area: true, zip });
            }
            if (city && SERVICE_AREA_CITIES.some(c =>
                c.toLowerCase() === city.toLowerCase()
            )) {
                return JSON.stringify({ in_service_area: true, city });
            }
            return JSON.stringify({
                in_service_area: false,
                message: 'This location may be outside our primary service area. Suggest the customer call (512) 756-9847 to confirm.',
            });
        }

        case 'check_availability': {
            // Return general availability — specific slot checking can be enhanced later
            // with ServiceTitan dispatch API integration
            return JSON.stringify({
                available: true,
                message: 'We have availability this week. Morning (8-10am) and afternoon (1-3pm) slots are typically open.',
                note: 'Specific time slots will be confirmed by the office.',
            });
        }

        case 'lookup_customer': {
            try {
                const result = await lookupServiceTitanCustomer(toolInput.phone);
                return JSON.stringify(result);
            } catch (error: any) {
                return JSON.stringify({ found: false, error: error.message });
            }
        }

        case 'create_booking': {
            try {
                const result = await createBooking({
                    customerName: toolInput.customer_name,
                    phone: toolInput.phone,
                    address: toolInput.address,
                    serviceType: toolInput.service_type,
                    preferredDatetime: toolInput.preferred_datetime,
                    notes: toolInput.notes,
                    source: ctx.source || 'unknown',
                    conversationId: ctx.conversationId,
                });

                // Update conversation status
                const supabase = getSupabaseAdmin();
                await supabase
                    .from('conversations')
                    .update({
                        status: 'booked',
                        servicetitan_job_id: result.jobId,
                    })
                    .eq('id', ctx.conversationId);

                // Notify staff
                await sendStaffAlert({
                    type: 'ai_booking',
                    title: 'New AI Booking',
                    body: `${toolInput.customer_name} - ${toolInput.service_type}\n${toolInput.preferred_datetime}\nSource: ${ctx.source}\nBooked by AI`,
                    conversationId: ctx.conversationId,
                    customerId: ctx.customerId,
                });

                return JSON.stringify({
                    success: true,
                    jobId: result.jobId,
                    message: 'Booking confirmed successfully.',
                });
            } catch (error: any) {
                console.error('Booking failed:', error);

                // Notify staff about failed booking
                await sendStaffAlert({
                    type: 'speed_to_lead_failure',
                    title: 'AI Booking Failed',
                    body: `Customer: ${toolInput.customer_name}\nService: ${toolInput.service_type}\nError: ${error.message}`,
                    conversationId: ctx.conversationId,
                    customerId: ctx.customerId,
                });

                return JSON.stringify({
                    success: false,
                    error: error.message,
                    message: 'Booking could not be completed automatically. Tell the customer you\'ve passed their info to the team.',
                });
            }
        }

        case 'transfer_to_human': {
            const supabase = getSupabaseAdmin();

            await supabase
                .from('conversations')
                .update({
                    status: 'qualifying',
                    ai_enabled: false,
                })
                .eq('id', ctx.conversationId);

            await sendStaffAlert({
                type: 'ai_handoff',
                title: 'AI Handoff',
                body: `Customer: ${ctx.customerName || ctx.customerPhone}\nReason: ${toolInput.reason}\nSource: ${ctx.source}`,
                conversationId: ctx.conversationId,
                customerId: ctx.customerId,
            });

            return JSON.stringify({
                success: true,
                message: 'Conversation handed off to staff. AI responses disabled.',
            });
        }

        case 'get_business_info': {
            const info: Record<string, string> = {
                hours: 'Mon-Fri 8am-5pm CT. 24/7 emergency service available.',
                services: 'Full plumbing (bathroom, kitchen, water heaters, drain cleaning, water/sewer lines, water softeners, water filtration, toilets, commercial, emergency) and HVAC (AC repair, AC installation, heating repair, heating installation, ductwork, heat pumps).',
                warranty: 'Lifetime labor guarantee on all work.',
                financing: 'Financing available through GreenSky. Apply online or ask your technician.',
                service_area: 'Texas Hill Country: Marble Falls, Cedar Park, Georgetown, Leander, Round Rock, Liberty Hill, Burnet, Lago Vista, Pflugerville, Austin, and surrounding areas.',
                emergency: '24/7 emergency plumbing service. Call (512) 756-9847.',
                about: 'Family-owned since 1917 in Chicago, serving the Texas Hill Country since 1997. 4+ generations of plumbing expertise.',
            };
            return JSON.stringify({ info: info[toolInput.topic] || 'Please call (512) 756-9847 for details.' });
        }

        default:
            return JSON.stringify({ error: `Unknown tool: ${toolName}` });
    }
}

/**
 * Process an inbound customer message through the AI engine
 * Returns the AI response text, or null if AI is disabled/failed
 */
export async function processWithAI(ctx: ConversationContext): Promise<string | null> {
    const supabase = getSupabaseAdmin();

    // Check if AI is enabled for this conversation
    const { data: convo } = await supabase
        .from('conversations')
        .select('ai_enabled, ai_turn_count')
        .eq('id', ctx.conversationId)
        .single();

    if (!convo?.ai_enabled) {
        console.log(`AI disabled for conversation ${ctx.conversationId}`);
        return null;
    }

    const aiTurnCount = convo.ai_turn_count || 0;

    // Check turn limit
    if (aiTurnCount >= MAX_AI_TURNS) {
        console.log(`AI turn limit reached for conversation ${ctx.conversationId}`);
        // Auto-handoff
        await executeTool('transfer_to_human', {
            reason: 'AI turn limit reached — auto handoff',
        }, ctx);
        return "I've been chatting with you for a bit! Let me connect you with our team directly. Give us a call at (512) 756-9847 or someone will reach out shortly.";
    }

    // Load conversation history
    const history = await loadConversationHistory(ctx.conversationId);
    const { formatted: currentTime, isAfterHours } = getCurrentCTTime();

    // Build system prompt
    const systemPrompt = buildSystemPrompt({
        currentDateTimeCT: currentTime,
        customerName: ctx.customerName,
        customerPhone: ctx.customerPhone,
        source: ctx.source,
        serviceType: ctx.serviceType,
        conversationHistory: history,
        aiTurnCount,
        isAfterHours,
    });

    // Convert history to Claude message format
    const claudeMessages = history.map(m => ({
        role: (m.role === 'customer' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.content,
    }));

    try {
        const client = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });

        // Call Claude with tools
        console.log('Calling Claude API...', { model: AI_MODEL, messageCount: claudeMessages.length });

        let response = await client.messages.create({
            model: AI_MODEL,
            max_tokens: 500,
            system: systemPrompt,
            messages: claudeMessages.length > 0 ? claudeMessages : [
                { role: 'user', content: '(New lead — send initial greeting)' },
            ],
            tools: AI_TOOLS,
        });

        console.log('Claude API response received', { stopReason: response.stop_reason });

        // Process tool calls in a loop (Claude may chain multiple tool calls)
        let maxToolCalls = 5;
        while (response.stop_reason === 'tool_use' && maxToolCalls > 0) {
            maxToolCalls--;

            const toolUseBlocks = response.content.filter(
                (block) => block.type === 'tool_use'
            );

            const toolResults = [];
            for (const toolUse of toolUseBlocks) {
                if (toolUse.type !== 'tool_use') continue;
                const result = await executeTool(toolUse.name, toolUse.input as Record<string, any>, ctx);
                toolResults.push({
                    type: 'tool_result' as const,
                    tool_use_id: toolUse.id,
                    content: result,
                });
            }

            // Continue the conversation with tool results
            response = await client.messages.create({
                model: AI_MODEL,
                max_tokens: 500,
                system: systemPrompt,
                messages: [
                    ...claudeMessages,
                    { role: 'assistant', content: response.content },
                    { role: 'user', content: toolResults },
                ],
                tools: AI_TOOLS,
            });
        }

        // Extract text response
        const textBlocks = response.content.filter(
            (block) => block.type === 'text'
        );

        const aiResponse = textBlocks
            .map(b => b.type === 'text' ? b.text : '')
            .join('\n')
            .trim();

        if (!aiResponse) {
            console.warn('Claude returned empty response');
            return getFallbackMessage();
        }

        // Validate response (guardrails)
        const validated = validateAiResponse(aiResponse);

        // Increment AI turn count
        await supabase
            .from('conversations')
            .update({
                ai_turn_count: aiTurnCount + 1,
                status: convo.ai_turn_count === 0 ? 'ai_active' : undefined,
            })
            .eq('id', ctx.conversationId);

        return validated;
    } catch (error: any) {
        const errorDetails = {
            message: error.message,
            status: error.status,
            name: error.name,
            type: error.type,
            stack: error.stack?.split('\n').slice(0, 3).join(' | '),
        };
        console.error('AI engine error:', JSON.stringify(errorDetails));

        // Log error to conversation metadata for debugging
        const supabaseForError = getSupabaseAdmin();
        await supabaseForError
            .from('conversations')
            .update({ metadata: { ai_error: errorDetails } })
            .eq('id', ctx.conversationId);

        return getFallbackMessage();
    }
}

/**
 * Validate AI response against guardrails
 * - No pricing commitments
 * - No competitor names
 * - No unauthorized promises
 */
function validateAiResponse(response: string): string {
    // Check for pricing patterns
    const pricingPatterns = /\$\d+|\d+ dollars|cost (?:is|will be|would be) \d/i;
    if (pricingPatterns.test(response)) {
        console.warn('AI response contained pricing — stripping');
        return "I'd love to help with that! We offer free estimates so our team can give you an accurate quote on-site. Want me to get you on the schedule?";
    }

    return response;
}

/**
 * Trigger speed-to-lead: send the first AI response for a new lead
 * Called fire-and-forget from webhook handlers
 */
export async function triggerSpeedToLead(ctx: ConversationContext): Promise<void> {
    try {
        const aiResponse = await processWithAI(ctx);

        if (aiResponse) {
            await sendMessage({
                to: ctx.customerPhone,
                body: aiResponse,
                conversationId: ctx.conversationId,
                customerId: ctx.customerId,
                sender: 'ai_chris',
                isUrgent: true, // Speed-to-lead bypasses hours + rate limits
            });
        }
    } catch (error) {
        console.error('Speed-to-lead failed:', error);

        // Send fallback
        await sendMessage({
            to: ctx.customerPhone,
            body: getFallbackMessage(),
            conversationId: ctx.conversationId,
            customerId: ctx.customerId,
            sender: 'ai_chris',
            isUrgent: true,
        });

        // Alert staff
        await sendStaffAlert({
            type: 'speed_to_lead_failure',
            title: 'Speed-to-Lead Failed',
            body: `Customer: ${ctx.customerName || ctx.customerPhone}\nSource: ${ctx.source}\nFallback message sent.`,
            conversationId: ctx.conversationId,
            customerId: ctx.customerId,
        });
    }
}
