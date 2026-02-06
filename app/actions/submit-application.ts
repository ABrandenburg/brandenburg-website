"use server"

import { Resend } from "resend"
import { jobApplicationSchema, JobApplicationValues } from "@/lib/schemas/job-application-schema"
import { db } from "@/lib/db"
import { submissions } from "@/lib/schema"
import { validateHoneypot, HONEYPOT_FIELD_NAME } from "@/lib/spam-prevention/honeypot"
import { verifyTurnstileToken } from "@/lib/spam-prevention/turnstile"

const resend = new Resend(process.env.RESEND_API_KEY)

type SubmissionData = JobApplicationValues & {
  [HONEYPOT_FIELD_NAME]?: string
  turnstileToken?: string
}

export async function submitApplication(data: SubmissionData) {
  // 1. Honeypot check
  const honeypotResult = validateHoneypot(data[HONEYPOT_FIELD_NAME])
  if (honeypotResult.isSpam) {
    console.log('Spam detected via honeypot:', honeypotResult.reason)
    return { success: true } // Silent success for bots
  }

  // 2. Turnstile verification
  if (data.turnstileToken) {
    const turnstileResult = await verifyTurnstileToken(data.turnstileToken)
    if (!turnstileResult.success) {
      return { success: false, error: 'Security verification failed' }
    }
  } else if (process.env.TURNSTILE_SECRET_KEY) {
    return { success: false, error: 'Security verification required' }
  }

  // 3. Clean data for schema validation (remove spam prevention fields)
  const { [HONEYPOT_FIELD_NAME]: _, turnstileToken: __, ...cleanData } = data

  const result = jobApplicationSchema.safeParse(cleanData)

  if (!result.success) {
    return { success: false, error: "Invalid form data" }
  }

  const { role, ...rest } = result.data

  // Save to database
  try {
    await db.insert(submissions).values({
      type: 'career',
      payload: result.data,
      status: 'new'
    })
  } catch (error) {
    console.error("Database Error:", error)
    return { success: false, error: "Something went wrong. Please try again." }
  }

  // Build email content before returning
  const subject = `New Job Application: ${role.toUpperCase()} - ${rest.fullName}`

  let body = `
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

  if (role === "technician") {
    const d = result.data as Extract<JobApplicationValues, { role: "technician" }>
    body += `
      <ul>
        <li><strong>Trade:</strong> ${d.trade}</li>
        <li><strong>Experience:</strong> ${d.experienceYears}</li>
        <li><strong>Has License:</strong> ${d.hasLicense ? "Yes" : "No"}</li>
        ${d.licenseType ? `<li><strong>License Type:</strong> ${d.licenseType}</li>` : ""}
        <li><strong>Motivation:</strong> ${d.motivation}</li>
        ${d.mostRecentEmployer ? `<li><strong>Recent Employer:</strong> ${d.mostRecentEmployer}</li>` : ""}
      </ul>
    `
  } else if (role === "office") {
    const d = result.data as Extract<JobApplicationValues, { role: "office" }>
    body += `
      <ul>
        <li><strong>Experience:</strong> ${d.officeExperience}</li>
        <li><strong>Known Software (ServiceTitan/HCP):</strong> ${d.knownSoftware ? "Yes" : "No"}</li>
        <li><strong>Comfortable w/ High Call Volume:</strong> ${d.callVolumeComfort ? "Yes" : "No"}</li>
        ${d.mostRecentEmployer ? `<li><strong>Recent Employer:</strong> ${d.mostRecentEmployer}</li>` : ""}
      </ul>
    `
  } else if (role === "warehouse") {
    const d = result.data as Extract<JobApplicationValues, { role: "warehouse" }>
    body += `
      <ul>
        <li><strong>Can Lift 50lbs:</strong> ${d.canLift50lbs ? "Yes" : "No"}</li>
        <li><strong>Driver's License:</strong> ${d.hasDriversLicense ? "Yes" : "No"}</li>
      </ul>
    `
  }

  // Fire-and-forget: send email without awaiting — don't block the response to the user
  resend.emails.send({
    from: "Brandenburg Careers <careers@brandenburgplumbing.com>",
    to: ["service@brandenburgplumbing.com"],
    subject: subject,
    html: body,
  }).catch((error) => {
    console.error("Email notification failed (non-blocking):", error)
  })

  return { success: true }
}
