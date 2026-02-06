import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { db } from '@/lib/db'
import { submissions } from '@/lib/schema'
import { validateHoneypot, HONEYPOT_FIELD_NAME } from '@/lib/spam-prevention/honeypot'
import { verifyTurnstileToken } from '@/lib/spam-prevention/turnstile'

const resend = new Resend(process.env.RESEND_API_KEY)

interface ContactFormData {
  fullName: string
  email: string
  phone: string
  message: string
  turnstileToken?: string
  [HONEYPOT_FIELD_NAME]?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json()

    // 1. Honeypot validation (silent fail)
    const honeypotResult = validateHoneypot(body[HONEYPOT_FIELD_NAME])
    if (honeypotResult.isSpam) {
      console.log('Spam detected via honeypot:', honeypotResult.reason)
      return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 })
    }

    // 2. Turnstile verification
    if (body.turnstileToken) {
      const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        undefined

      const turnstileResult = await verifyTurnstileToken(body.turnstileToken, clientIp)

      if (!turnstileResult.success) {
        return NextResponse.json(
          { error: 'Security verification failed' },
          { status: 400 }
        )
      }
    } else if (process.env.TURNSTILE_SECRET_KEY) {
      // Turnstile is configured but no token provided
      return NextResponse.json(
        { error: 'Security verification required' },
        { status: 400 }
      )
    }

    const { fullName, email, phone, message } = body

    // Validate required fields
    if (!fullName || !email || !phone || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Save to database
    try {
      await db.insert(submissions).values({
        type: 'contact',
        payload: body,
        status: 'new'
      })
    } catch (error) {
      console.error('Database Error:', error)
      return NextResponse.json(
        { error: 'Something went wrong. Please try again.' },
        { status: 500 }
      )
    }

    // Fire-and-forget: send emails without awaiting — don't block the response to the user
    resend.emails.send({
      from: 'Brandenburg Plumbing <no-reply@brandenburgplumbing.com>',
      to: ['service@brandenburgplumbing.com'],
      replyTo: email,
      subject: `New Contact Form Submission from ${fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #324759; border-bottom: 2px solid #C41E3A; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Name:</strong> ${fullName}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p style="margin: 10px 0;"><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
          </div>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 8px;">
            <p style="margin: 0 0 10px 0; font-weight: bold;">Message:</p>
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
          
          <p style="color: #666; font-size: 12px;">
            This message was sent from the contact form on brandenburgplumbing.com
          </p>
        </div>
      `,
      text: `
New Contact Form Submission

Name: ${fullName}
Email: ${email}
Phone: ${phone}

Message:
${message}

---
This message was sent from the contact form on brandenburgplumbing.com
      `,
    }).catch((err) => console.error('Resend error (non-blocking):', err))

    // Auto-reply to the user
    resend.emails.send({
      from: 'Brandenburg Plumbing <no-reply@brandenburgplumbing.com>',
      to: [email],
      subject: 'We received your message - Brandenburg Plumbing',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #324759; border-bottom: 2px solid #C41E3A; padding-bottom: 10px;">
            Thank You for Contacting Us
          </h2>
          
          <div style="margin: 20px 0;">
            <p>Dear ${fullName},</p>
            <p>We have received your message and will get back to you as soon as possible.</p>
            <p>Here is a copy of your submission:</p>
          </div>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 8px;">
            <p style="margin: 0 0 10px 0;"><strong>Phone:</strong> ${phone}</p>
            <p style="margin: 0 0 10px 0; font-weight: bold;">Message:</p>
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
          
          <p style="color: #666; font-size: 12px;">
            Brandenburg Plumbing<br/>
            (512) 756-9847
          </p>
        </div>
      `,
      text: `
Thank You for Contacting Us

Dear ${fullName},

We have received your message and will get back to you as soon as possible.

Here is a copy of your submission:

Phone: ${phone}

Message:
${message}

---
Brandenburg Plumbing
(512) 756-9847
      `,
    }).catch((err) => console.error('Auto-reply email failed (non-blocking):', err))

    return NextResponse.json(
      { message: 'Email sent successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
