import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { db } from '@/lib/db'
import { submissions } from '@/lib/schema'
import { weddingQuestionnaireSchema } from '@/lib/schemas/wedding-questionnaire-schema'
import { validateHoneypot, HONEYPOT_FIELD_NAME } from '@/lib/spam-prevention/honeypot'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const honeypotResult = validateHoneypot(body[HONEYPOT_FIELD_NAME])
    if (honeypotResult.isSpam) {
      console.log('Spam detected via honeypot:', honeypotResult.reason)
      return NextResponse.json({ success: true }, { status: 200 })
    }

    const { [HONEYPOT_FIELD_NAME]: _, ...cleanData } = body

    const result = weddingQuestionnaireSchema.safeParse(cleanData)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid form data', details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = result.data

    try {
      await db.insert(submissions).values({
        type: 'wedding',
        payload: data,
        status: 'new',
      })
    } catch (error) {
      console.error('Database Error:', error)
      return NextResponse.json(
        { error: 'Something went wrong. Please try again.' },
        { status: 500 }
      )
    }

    const subject = `New Wedding Questionnaire: ${data.partnerOneName} & ${data.partnerTwoName}`

    resend.emails.send({
      from: 'Brandenburg Plumbing <no-reply@brandenburgplumbing.com>',
      to: ['service@brandenburgplumbing.com'],
      replyTo: data.email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #324759; border-bottom: 2px solid #C41E3A; padding-bottom: 10px;">
            New Wedding Questionnaire Submission
          </h2>

          <h3 style="color: #324759;">Contact Information</h3>
          <ul>
            <li><strong>Name:</strong> ${data.fullName}</li>
            <li><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></li>
            <li><strong>Phone:</strong> <a href="tel:${data.phone}">${data.phone}</a></li>
          </ul>

          <h3 style="color: #324759;">Wedding Details</h3>
          <ul>
            <li><strong>Couple:</strong> ${data.partnerOneName} & ${data.partnerTwoName}</li>
            <li><strong>Date:</strong> ${data.weddingDate}</li>
            <li><strong>Venue:</strong> ${data.venueName}</li>
            <li><strong>Address:</strong> ${data.venueAddress}</li>
            <li><strong>Est. Guests:</strong> ${data.estimatedGuests}</li>
          </ul>

          <h3 style="color: #324759;">Service Requirements</h3>
          <ul>
            <li><strong>Services:</strong> ${data.servicesNeeded.join(', ')}</li>
            <li><strong>Budget:</strong> ${data.budgetRange}</li>
            <li><strong>Timeline:</strong> ${data.timeline}</li>
          </ul>

          ${data.additionalDetails ? `
          <h3 style="color: #324759;">Additional Details</h3>
          <div style="padding: 15px; background-color: #f5f5f5; border-radius: 8px;">
            <p style="margin: 0; white-space: pre-wrap;">${data.additionalDetails}</p>
          </div>
          ` : ''}

          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
          <p style="color: #666; font-size: 12px;">
            This submission was sent from the wedding questionnaire on brandenburgplumbing.com
          </p>
        </div>
      `,
    }).catch((err) => console.error('Email notification failed (non-blocking):', err))

    resend.emails.send({
      from: 'Brandenburg Plumbing <no-reply@brandenburgplumbing.com>',
      to: [data.email],
      subject: 'We received your wedding details - Brandenburg Plumbing',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #324759; border-bottom: 2px solid #C41E3A; padding-bottom: 10px;">
            Thank You for Your Submission
          </h2>
          <div style="margin: 20px 0;">
            <p>Dear ${data.fullName},</p>
            <p>We've received your wedding details questionnaire for <strong>${data.partnerOneName} & ${data.partnerTwoName}</strong>'s wedding at <strong>${data.venueName}</strong>.</p>
            <p>Our team will review your requirements and get back to you soon to discuss the services you need.</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
          <p style="color: #666; font-size: 12px;">
            Brandenburg Plumbing<br/>
            (512) 756-9847
          </p>
        </div>
      `,
    }).catch((err) => console.error('Auto-reply email failed (non-blocking):', err))

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Wedding questionnaire API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
