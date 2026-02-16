import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { db } from '@/lib/db'
import { submissions } from '@/lib/schema'
import { jobApplicationSchema, JobApplicationValues } from '@/lib/schemas/job-application-schema'
import { validateHoneypot, HONEYPOT_FIELD_NAME } from '@/lib/spam-prevention/honeypot'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 1. Honeypot check
    const honeypotResult = validateHoneypot(body[HONEYPOT_FIELD_NAME])
    if (honeypotResult.isSpam) {
      console.log('Spam detected via honeypot:', honeypotResult.reason)
      return NextResponse.json({ success: true }, { status: 200 })
    }

    // 2. Clean data for schema validation
    const { [HONEYPOT_FIELD_NAME]: _, ...cleanData } = body

    const result = jobApplicationSchema.safeParse(cleanData)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid form data' },
        { status: 400 }
      )
    }

    const { role, ...rest } = result.data

    // 3. Save to database
    try {
      await db.insert(submissions).values({
        type: 'career',
        payload: result.data,
        status: 'new',
      })
    } catch (error) {
      console.error('Database Error:', error)
      return NextResponse.json(
        { error: 'Something went wrong. Please try again.' },
        { status: 500 }
      )
    }

    // 4. Build and send notification email (fire-and-forget)
    const subject = `New Job Application: ${role.toUpperCase()} - ${rest.fullName}`

    let emailBody = `
      <h1>New Job Application</h1>
      <h2>Contact Information</h2>
      <ul>
        <li><strong>Name:</strong> ${rest.fullName}</li>
        <li><strong>Email:</strong> ${rest.email}</li>
        <li><strong>Phone:</strong> ${rest.phone}</li>
        <li><strong>Zip Code:</strong> ${rest.zipCode}</li>
        <li><strong>Source:</strong> ${rest.source}</li>
      </ul>
      <h2>Role Specifics: ${role.toUpperCase()}</h2>
    `

    if (role === 'technician') {
      const d = result.data as Extract<JobApplicationValues, { role: 'technician' }>
      emailBody += `
        <ul>
          <li><strong>Trade:</strong> ${d.trade}</li>
          <li><strong>Experience:</strong> ${d.experienceYears}</li>
          <li><strong>Has License:</strong> ${d.hasLicense ? 'Yes' : 'No'}</li>
          ${d.licenseType ? `<li><strong>License Type:</strong> ${d.licenseType}</li>` : ''}
          <li><strong>Motivation:</strong> ${d.motivation}</li>
          ${d.mostRecentEmployer ? `<li><strong>Recent Employer:</strong> ${d.mostRecentEmployer}</li>` : ''}
        </ul>
      `
    } else if (role === 'office') {
      const d = result.data as Extract<JobApplicationValues, { role: 'office' }>
      emailBody += `
        <ul>
          <li><strong>Experience:</strong> ${d.officeExperience}</li>
          <li><strong>Known Software (ServiceTitan/HCP):</strong> ${d.knownSoftware ? 'Yes' : 'No'}</li>
          <li><strong>Comfortable w/ High Call Volume:</strong> ${d.callVolumeComfort ? 'Yes' : 'No'}</li>
          ${d.mostRecentEmployer ? `<li><strong>Recent Employer:</strong> ${d.mostRecentEmployer}</li>` : ''}
        </ul>
      `
    } else if (role === 'warehouse') {
      const d = result.data as Extract<JobApplicationValues, { role: 'warehouse' }>
      emailBody += `
        <ul>
          <li><strong>Can Lift 50lbs:</strong> ${d.canLift50lbs ? 'Yes' : 'No'}</li>
          <li><strong>Driver's License:</strong> ${d.hasDriversLicense ? 'Yes' : 'No'}</li>
        </ul>
      `
    }

    resend.emails.send({
      from: 'Brandenburg Careers <careers@brandenburgplumbing.com>',
      to: ['service@brandenburgplumbing.com', 'lucas@brandenburgplumbing.com', 'Adam@brandenburgplumbing.com'],
      subject,
      html: emailBody,
    }).catch((error) => {
      console.error('Email notification failed (non-blocking):', error)
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Careers API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
