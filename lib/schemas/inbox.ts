import {
    pgTable,
    uuid,
    text,
    timestamp,
    integer,
    boolean,
    jsonb,
    date,
    numeric,
    uniqueIndex,
    index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================
// CUSTOMERS
// ============================================================
export const customers = pgTable('customers', {
    id: uuid('id').primaryKey().defaultRandom(),
    phoneE164: text('phone_e164').notNull(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    email: text('email'),
    address: text('address'),
    city: text('city'),
    state: text('state'),
    zip: text('zip'),
    source: text('source'),
    servicetitanCustomerId: text('servicetitan_customer_id'),
    tags: text('tags').array().default([]),
    lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
    unreadCount: integer('unread_count').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
    uniqueIndex('idx_customers_phone').on(table.phoneE164),
    index('idx_customers_last_message').on(table.lastMessageAt),
]);

// ============================================================
// CONVERSATIONS
// ============================================================
export const conversations = pgTable('conversations', {
    id: uuid('id').primaryKey().defaultRandom(),
    customerId: uuid('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
    status: text('status').notNull().default('new'),
    source: text('source'),
    sourceLeadId: text('source_lead_id'),
    serviceType: text('service_type'),
    aiEnabled: boolean('ai_enabled').default(true),
    aiTurnCount: integer('ai_turn_count').default(0),
    assignedTo: text('assigned_to'),
    servicetitanJobId: text('servicetitan_job_id'),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
    index('idx_conversations_customer').on(table.customerId),
    index('idx_conversations_status').on(table.status),
    index('idx_conversations_created').on(table.createdAt),
]);

// ============================================================
// MESSAGES
// ============================================================
export const messages = pgTable('messages', {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
    customerId: uuid('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
    direction: text('direction').notNull(),
    sender: text('sender').notNull(),
    channel: text('channel').notNull().default('sms'),
    body: text('body').notNull(),
    twilioSid: text('twilio_sid'),
    deliveryStatus: text('delivery_status').default('queued'),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
    index('idx_messages_conversation').on(table.conversationId, table.createdAt),
    index('idx_messages_customer').on(table.customerId, table.createdAt),
]);

// ============================================================
// DRIP_SEQUENCES
// ============================================================
export const dripSequences = pgTable('drip_sequences', {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    priority: integer('priority').notNull().default(5),
    active: boolean('active').default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ============================================================
// DRIP_STEPS
// ============================================================
export const dripSteps = pgTable('drip_steps', {
    id: uuid('id').primaryKey().defaultRandom(),
    sequenceId: uuid('sequence_id').notNull().references(() => dripSequences.id, { onDelete: 'cascade' }),
    stepNumber: integer('step_number').notNull(),
    delayMinutes: integer('delay_minutes').notNull(),
    messageTemplate: text('message_template').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
    index('idx_drip_steps_sequence').on(table.sequenceId, table.stepNumber),
]);

// ============================================================
// DRIP_ENROLLMENTS
// ============================================================
export const dripEnrollments = pgTable('drip_enrollments', {
    id: uuid('id').primaryKey().defaultRandom(),
    customerId: uuid('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
    sequenceId: uuid('sequence_id').notNull().references(() => dripSequences.id, { onDelete: 'cascade' }),
    conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'set null' }),
    currentStep: integer('current_step').default(0),
    status: text('status').notNull().default('active'),
    mergeData: jsonb('merge_data').default({}),
    enrolledAt: timestamp('enrolled_at', { withTimezone: true }).defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    cancelReason: text('cancel_reason'),
});

// ============================================================
// PENDING_DRIP_MESSAGES
// ============================================================
export const pendingDripMessages = pgTable('pending_drip_messages', {
    id: uuid('id').primaryKey().defaultRandom(),
    enrollmentId: uuid('enrollment_id').notNull().references(() => dripEnrollments.id, { onDelete: 'cascade' }),
    customerId: uuid('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
    stepId: uuid('step_id').notNull().references(() => dripSteps.id, { onDelete: 'cascade' }),
    messageBody: text('message_body').notNull(),
    sendAt: timestamp('send_at', { withTimezone: true }).notNull(),
    status: text('status').notNull().default('pending'),
    attempts: integer('attempts').default(0),
    lastError: text('last_error'),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ============================================================
// WEBHOOK_EVENTS
// ============================================================
export const webhookEvents = pgTable('webhook_events', {
    id: uuid('id').primaryKey().defaultRandom(),
    source: text('source').notNull(),
    idempotencyKey: text('idempotency_key'),
    rawPayload: jsonb('raw_payload').notNull(),
    processingStatus: text('processing_status').notNull().default('pending'),
    processingError: text('processing_error'),
    attempts: integer('attempts').default(0),
    processedAt: timestamp('processed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
    index('idx_webhook_events_source').on(table.source, table.idempotencyKey),
    index('idx_webhook_events_created').on(table.createdAt),
]);

// ============================================================
// STAFF_NOTIFICATIONS
// ============================================================
export const staffNotifications = pgTable('staff_notifications', {
    id: uuid('id').primaryKey().defaultRandom(),
    type: text('type').notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'set null' }),
    customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }),
    read: boolean('read').default(false),
    smsSent: boolean('sms_sent').default(false),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ============================================================
// SUPPRESSION_LIST
// ============================================================
export const suppressionList = pgTable('suppression_list', {
    id: uuid('id').primaryKey().defaultRandom(),
    phoneE164: text('phone_e164').notNull(),
    reason: text('reason').default('opt_out'),
    source: text('source'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
    uniqueIndex('idx_suppression_phone').on(table.phoneE164),
]);

// ============================================================
// OAUTH_TOKENS
// ============================================================
export const oauthTokens = pgTable('oauth_tokens', {
    id: uuid('id').primaryKey().defaultRandom(),
    provider: text('provider').notNull(),
    accessToken: text('access_token').notNull(),
    refreshToken: text('refresh_token'),
    tokenType: text('token_type').default('Bearer'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    scopes: text('scopes'),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
    uniqueIndex('idx_oauth_provider').on(table.provider),
]);

// ============================================================
// SYSTEM_METRICS
// ============================================================
export const systemMetrics = pgTable('system_metrics', {
    id: uuid('id').primaryKey().defaultRandom(),
    date: date('date').notNull(),
    metricName: text('metric_name').notNull(),
    metricValue: numeric('metric_value').notNull().default('0'),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ============================================================
// RELATIONS
// ============================================================
export const customersRelations = relations(customers, ({ many }) => ({
    conversations: many(conversations),
    messages: many(messages),
    dripEnrollments: many(dripEnrollments),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
    customer: one(customers, {
        fields: [conversations.customerId],
        references: [customers.id],
    }),
    messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
    conversation: one(conversations, {
        fields: [messages.conversationId],
        references: [conversations.id],
    }),
    customer: one(customers, {
        fields: [messages.customerId],
        references: [customers.id],
    }),
}));

export const dripSequencesRelations = relations(dripSequences, ({ many }) => ({
    steps: many(dripSteps),
    enrollments: many(dripEnrollments),
}));

export const dripStepsRelations = relations(dripSteps, ({ one }) => ({
    sequence: one(dripSequences, {
        fields: [dripSteps.sequenceId],
        references: [dripSequences.id],
    }),
}));

export const dripEnrollmentsRelations = relations(dripEnrollments, ({ one }) => ({
    customer: one(customers, {
        fields: [dripEnrollments.customerId],
        references: [customers.id],
    }),
    sequence: one(dripSequences, {
        fields: [dripEnrollments.sequenceId],
        references: [dripSequences.id],
    }),
    conversation: one(conversations, {
        fields: [dripEnrollments.conversationId],
        references: [conversations.id],
    }),
}));
