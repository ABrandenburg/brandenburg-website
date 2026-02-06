// IMAP client for fetching report emails from Gmail
// Connects via IMAP, searches for report emails, downloads xlsx attachments

import { ImapFlow } from 'imapflow';

export interface EmailAttachment {
    filename: string;
    content: Buffer;
    subject: string;
    date: Date;
    from: string;
}

interface ImapConfig {
    host: string;
    port: number;
    user: string;
    password: string;
}

/**
 * Get IMAP configuration from environment variables
 */
function getImapConfig(): ImapConfig {
    const host = process.env.REPORT_EMAIL_HOST;
    const port = parseInt(process.env.REPORT_EMAIL_PORT || '993', 10);
    const user = process.env.REPORT_EMAIL_USER;
    const password = process.env.REPORT_EMAIL_PASSWORD;

    if (!host || !user || !password) {
        throw new Error(
            'Email configuration missing. Set REPORT_EMAIL_HOST, REPORT_EMAIL_USER, and REPORT_EMAIL_PASSWORD environment variables.'
        );
    }

    return { host, port, user, password };
}

/**
 * Check if email report ingestion is configured
 */
export function isEmailReportConfigured(): boolean {
    return !!(
        process.env.REPORT_EMAIL_HOST &&
        process.env.REPORT_EMAIL_USER &&
        process.env.REPORT_EMAIL_PASSWORD
    );
}

/**
 * Fetch xlsx report attachments from the email inbox
 * 
 * Searches for unread emails from the last 24 hours that have .xlsx attachments,
 * downloads the attachments, and marks the emails as read.
 * 
 * @param markAsRead - Whether to mark processed emails as read (default: true)
 * @returns Array of EmailAttachment objects with xlsx file buffers
 */
export async function fetchReportEmails(markAsRead: boolean = true): Promise<EmailAttachment[]> {
    const config = getImapConfig();
    const attachments: EmailAttachment[] = [];

    const client = new ImapFlow({
        host: config.host,
        port: config.port,
        secure: true,
        auth: {
            user: config.user,
            pass: config.password,
        },
        logger: false, // Suppress verbose IMAP logging
    });

    try {
        console.log(`Connecting to IMAP server ${config.host}...`);
        await client.connect();
        console.log('IMAP connected successfully');

        // Open INBOX
        const mailbox = await client.mailboxOpen('INBOX');
        console.log(`Mailbox opened: ${mailbox.exists} total messages`);

        // Search for unread messages from the last 24 hours
        const since = new Date();
        since.setDate(since.getDate() - 1);
        since.setHours(0, 0, 0, 0);

        const searchCriteria = {
            unseen: true,
            since,
        };

        const messages: number[] = [];
        // Search for matching messages
        for await (const msg of client.fetch(searchCriteria, {
            envelope: true,
            bodyStructure: true,
            uid: true,
        })) {
            messages.push(msg.uid);
        }

        console.log(`Found ${messages.length} unread messages since ${since.toISOString()}`);

        // Process each message
        for (const uid of messages) {
            try {
                // Fetch the full message with body structure
                const message = await client.fetchOne(uid, {
                    envelope: true,
                    bodyStructure: true,
                }, { uid: true });

                if (!message) continue;
                const envelope = (message as any).envelope;
                const bodyStructure = (message as any).bodyStructure;
                if (!envelope || !bodyStructure) continue;

                const subject = envelope.subject || '';
                const date = envelope.date ? new Date(envelope.date) : new Date();
                const from = envelope.from?.[0]?.address || 'unknown';

                // Find xlsx attachments in the body structure
                const xlsxParts = findXlsxParts(bodyStructure);

                if (xlsxParts.length === 0) {
                    console.log(`Skipping email "${subject}" - no xlsx attachments`);
                    continue;
                }

                console.log(`Processing email "${subject}" - ${xlsxParts.length} xlsx attachment(s)`);

                // Download each xlsx attachment
                for (const part of xlsxParts) {
                    try {
                        const { content: stream } = await client.download(uid.toString(), part.part, { uid: true });

                        // Collect stream into buffer
                        const chunks: Buffer[] = [];
                        for await (const chunk of stream) {
                            chunks.push(Buffer.from(chunk));
                        }
                        const content = Buffer.concat(chunks);

                        if (content.length > 0) {
                            attachments.push({
                                filename: part.filename || 'report.xlsx',
                                content,
                                subject,
                                date,
                                from,
                            });
                            console.log(`Downloaded attachment: ${part.filename} (${content.length} bytes)`);
                        }
                    } catch (downloadErr) {
                        console.error(`Failed to download attachment ${part.filename}:`, downloadErr);
                    }
                }

                // Mark email as read
                if (markAsRead && xlsxParts.length > 0) {
                    await client.messageFlagsAdd(uid, ['\\Seen'], { uid: true });
                    console.log(`Marked email "${subject}" as read`);
                }
            } catch (msgErr) {
                console.error(`Failed to process message uid=${uid}:`, msgErr);
            }
        }

        console.log(`Fetched ${attachments.length} xlsx attachments total`);
        return attachments;
    } catch (error) {
        console.error('IMAP error:', error);
        throw error;
    } finally {
        try {
            await client.logout();
            console.log('IMAP connection closed');
        } catch {
            // Ignore logout errors
        }
    }
}

/**
 * Recursively find xlsx attachment parts in a MIME body structure
 */
interface XlsxPart {
    part: string;
    filename: string;
}

function findXlsxParts(structure: any, partPrefix: string = ''): XlsxPart[] {
    const parts: XlsxPart[] = [];

    if (!structure) return parts;

    // Check if this is a multipart structure
    if (structure.childNodes && Array.isArray(structure.childNodes)) {
        for (let i = 0; i < structure.childNodes.length; i++) {
            const childPart = partPrefix ? `${partPrefix}.${i + 1}` : `${i + 1}`;
            parts.push(...findXlsxParts(structure.childNodes[i], childPart));
        }
        return parts;
    }

    // Check if this part is an xlsx attachment
    const filename = structure.dispositionParameters?.filename
        || structure.parameters?.name
        || '';

    const isXlsx = filename.toLowerCase().endsWith('.xlsx')
        || structure.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    if (isXlsx && filename) {
        parts.push({
            part: partPrefix || '1',
            filename,
        });
    }

    return parts;
}
