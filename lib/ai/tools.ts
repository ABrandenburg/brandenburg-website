/**
 * Claude function calling tool definitions for the AI "Chris" agent
 */

import type { Tool } from '@anthropic-ai/sdk/resources/messages';

export const AI_TOOLS: Tool[] = [
    {
        name: 'check_service_area',
        description: 'Check if a zip code or city is within Brandenburg Plumbing\'s service area in the Texas Hill Country.',
        input_schema: {
            type: 'object' as const,
            properties: {
                zip: {
                    type: 'string',
                    description: 'The zip code to check',
                },
                city: {
                    type: 'string',
                    description: 'The city name to check',
                },
            },
        },
    },
    {
        name: 'check_availability',
        description: 'Check available appointment time slots from ServiceTitan for the next few business days.',
        input_schema: {
            type: 'object' as const,
            properties: {
                service_type: {
                    type: 'string',
                    description: 'The type of service needed (e.g., "plumbing", "water heater", "ac repair")',
                },
                preferred_date: {
                    type: 'string',
                    description: 'Customer\'s preferred date in YYYY-MM-DD format, if specified',
                },
            },
            required: ['service_type'],
        },
    },
    {
        name: 'lookup_customer',
        description: 'Look up an existing customer in ServiceTitan by phone number to check history and membership status.',
        input_schema: {
            type: 'object' as const,
            properties: {
                phone: {
                    type: 'string',
                    description: 'The customer\'s phone number',
                },
            },
            required: ['phone'],
        },
    },
    {
        name: 'create_booking',
        description: 'Book a service appointment into ServiceTitan. Only call this after confirming the service type, address, and preferred time with the customer.',
        input_schema: {
            type: 'object' as const,
            properties: {
                customer_name: {
                    type: 'string',
                    description: 'Customer\'s full name',
                },
                phone: {
                    type: 'string',
                    description: 'Customer\'s phone number in any format',
                },
                address: {
                    type: 'string',
                    description: 'Service address (street, city, state, zip)',
                },
                service_type: {
                    type: 'string',
                    description: 'Type of service needed',
                },
                preferred_datetime: {
                    type: 'string',
                    description: 'Preferred appointment date/time (ISO 8601 or natural language)',
                },
                notes: {
                    type: 'string',
                    description: 'Additional notes about the job or customer request',
                },
            },
            required: ['customer_name', 'phone', 'address', 'service_type', 'preferred_datetime'],
        },
    },
    {
        name: 'transfer_to_human',
        description: 'Hand off the conversation to a human staff member. Use this when: the customer asks for a real person, mentions legal action, uses profanity, or has a complex issue the AI cannot handle.',
        input_schema: {
            type: 'object' as const,
            properties: {
                reason: {
                    type: 'string',
                    description: 'Brief reason for the handoff (e.g., "customer requested human", "escalation - legal mention")',
                },
            },
            required: ['reason'],
        },
    },
    {
        name: 'get_business_info',
        description: 'Get specific business information to answer customer questions about hours, services, warranty, financing, etc.',
        input_schema: {
            type: 'object' as const,
            properties: {
                topic: {
                    type: 'string',
                    enum: ['hours', 'services', 'warranty', 'financing', 'service_area', 'emergency', 'about'],
                    description: 'The topic the customer is asking about',
                },
            },
            required: ['topic'],
        },
    },
];
