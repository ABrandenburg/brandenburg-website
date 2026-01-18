"use server"

import { Resend } from "resend"
import { jobApplicationSchema, JobApplicationValues } from "@/lib/schemas/job-application-schema"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function submitApplication(data: JobApplicationValues) {
  const result = jobApplicationSchema.safeParse(data)

  if (!result.success) {
    return { success: false, error: "Invalid form data" }
  }

  const { role, ...rest } = result.data

  // Format data for email
  const subject = `New Job Application: ${role.toUpperCase()} - ${rest.fullName}`

  // Construct HTML body
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

  try {
    const emailResponse = await resend.emails.send({
      from: "Brandenburg Careers <careers@brandenburgplumbing.com>", // Update if domain verified differently
      to: ["service@brandenburgplumbing.com"],
      subject: subject,
      html: body,
    })

    if (emailResponse.error) {
      console.error("Resend Error:", emailResponse.error)
      return { success: false, error: "Failed to send email" }
    }

    return { success: true }
  } catch (error) {
    console.error("Submission Error:", error)
    return { success: false, error: "Something went wrong" }
  }
}
