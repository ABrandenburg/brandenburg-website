
import { pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Submissions table to store form data
export const submissions = pgTable('submissions', {
    id: serial('id').primaryKey(),
    type: text('type').notNull(), // 'contact', 'career', 'review', etc.
    payload: jsonb('payload').notNull(), // The actual form data
    status: text('status').default('new'), // 'new', 'read', 'archived'
    createdAt: timestamp('created_at').defaultNow(),
});

// Re-export all inbox/follow-up system tables
export {
    customers,
    conversations,
    messages,
    dripSequences,
    dripSteps,
    dripEnrollments,
    pendingDripMessages,
    webhookEvents,
    staffNotifications,
    suppressionList,
    oauthTokens,
    systemMetrics,
    customersRelations,
    conversationsRelations,
    messagesRelations,
    dripSequencesRelations,
    dripStepsRelations,
    dripEnrollmentsRelations,
} from './schemas/inbox';
