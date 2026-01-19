'use server'

import { db } from '@/lib/db'
import { submissions } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function updateSubmissionStatus(id: number, status: string) {
    try {
        await db.update(submissions)
            .set({ status })
            .where(eq(submissions.id, id))

        revalidatePath('/admin/submissions')
        return { success: true }
    } catch (error) {
        console.error('Failed to update status:', error)
        return { success: false, error: 'Failed to update status' }
    }
}
