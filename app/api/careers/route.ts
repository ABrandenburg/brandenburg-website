import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fullName, email, phone, role, message } = body

    // Validate required fields
    if (!fullName || !email || !phone || !role || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    console.log(`Processing career application for ${fullName} (${email}) - Role: ${role}`)

    // 1. Send notification email to service@brandenburgplumbing.com
    const { error: notificationError } = await resend.emails.send({
      from: 'Brandenburg Plumbing Careers <no-reply@brandenburgplumbing.com>',
      to: ['service@brandenburgplumbing.com'],
      replyTo: email,
      subject: `Career Application: ${role} - ${fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #324759; border-bottom: 2px solid #C41E3A; padding-bottom: 10px;">
            New Career Application
          </h2>
          
          <div style="margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Position:</strong> ${role}</p>
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
            This application was submitted via brandenburgplumbing.com/careers
          </p>
        </div>
      `,
      text: `
New Career Application

Position: ${role}
Name: ${fullName}
Email: ${email}
Phone: ${phone}

Message:
${message}

---
This application was submitted via brandenburgplumbing.com/careers
      `,
    })

    if (notificationError) {
      console.error('Error sending notification email:', notificationError)
      return NextResponse.json(
        { error: 'Failed to send application notification' },
        { status: 500 }
      )
    }

    // 2. Send confirmation email to the applicant
    const { error: confirmationError } = await resend.emails.send({
      from: 'Brandenburg Plumbing <no-reply@brandenburgplumbing.com>',
      to: [email],
      subject: 'We received your application - Brandenburg Plumbing',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #324759; border-bottom: 2px solid #C41E3A; padding-bottom: 10px;">
            Application Received
          </h2>
          
          <div style="margin: 20px 0;">
            <p>Dear ${fullName},</p>
            <p>Thank you for applying to join the Brandenburg Plumbing team. We have received your application for the <strong>${role}</strong> position.</p>
            <p>We will review your application and reach out to you within the next few business days.</p>
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
Application Received

Dear ${fullName},

Thank you for applying to join the Brandenburg Plumbing team. We have received your application for the ${role} position.

We will review your application and reach out to you within the next few business days.

Here is a copy of your submission:

Phone: ${phone}

Message:
${message}

---
Brandenburg Plumbing
(512) 756-9847
      `,
    })

    if (confirmationError) {
      console.error('Error sending confirmation email:', confirmationError)
      // We don't fail the request here if the confirmation fails, but we log it
    }

    console.log('Successfully sent notification and confirmation emails')

    return NextResponse.json({ success: true, message: 'Application submitted successfully' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
