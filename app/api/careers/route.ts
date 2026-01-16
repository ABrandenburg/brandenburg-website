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

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Brandenburg Plumbing Careers <service@brandenburgplumbing.com>',
      to: ['service@brandenburgplumbing.com'],
      replyTo: email,
      subject: `Career Application: ${role} - ${fullName}`,
      html: `
        <h2>New Career Application</h2>
        <p><strong>Position:</strong> ${role}</p>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
        <hr />
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br />')}</p>
      `,
      text: `
New Career Application

Position: ${role}
Name: ${fullName}
Email: ${email}
Phone: ${phone}

Message:
${message}
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send application' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
