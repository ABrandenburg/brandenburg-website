"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, CheckCircle, ArrowRight, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { jobApplicationSchema, type JobApplicationValues } from "@/lib/schemas/job-application-schema"
import { submitApplication } from "@/app/actions/submit-application"
import { HoneypotField } from "@/components/ui/honeypot-field"
import { Turnstile } from "@/components/ui/turnstile"
import { getJobById, type JobListing } from "@/lib/jobs-data"

export function CareersForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null)

  // Memoize Turnstile callbacks to prevent widget re-initialization on every render
  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token)
  }, [])

  const handleTurnstileError = useCallback(() => {
    setError('Security verification failed. Please refresh and try again.')
  }, [])

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null)
  }, [])

  const defaultValues: Partial<JobApplicationValues> = {
    // Shared
    fullName: "",
    email: "",
    phone: "",
    zipCode: "",
    source: undefined,
    // Role defaults
    role: undefined, // undefined to force selection
  }

  // Use a type that covers the union for the form, or rely on the resolver to enforce stricter types.
  // We use standard JobApplicationValues for the generic, but we may need to cast in render if typescript is too strict about unions in defaultValues.
  const form = useForm<JobApplicationValues>({
    resolver: zodResolver(jobApplicationSchema) as any,
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      zipCode: "",
      source: undefined, // Required dropdown
      role: undefined,
      hasLicense: false, // Default for technician
      licenseType: "",
      motivation: "", // Default for technician
      trade: undefined, // Default for technician
      experienceYears: undefined, // Default for technician
      mostRecentEmployer: "", // Default for technician/office
      knownSoftware: false, // Default for office
      callVolumeComfort: false, // Default for office
      officeExperience: undefined, // Default for office
      canLift50lbs: false, // Default for warehouse
      hasDriversLicense: false, // Default for warehouse
    } as any, // Cast default values to avoid partial union mismatch issues
    mode: "onChange",
  })

  // Watch fields for conditional rendering
  const watchedRole = form.watch("role")

  // Need to cast to specific union types to safely watch role-specific fields
  // or use getValues if rendering logic is simple enough, but watch ensures re-render
  const watchedExperience = form.watch("experienceYears" as any)
  const watchedOfficeExp = form.watch("officeExperience" as any)

  // Handle job selection from URL params or custom event
  const applyJobToForm = useCallback((jobId: string) => {
    const job = getJobById(jobId)
    if (job) {
      setSelectedJob(job)
      // Pre-populate form fields based on job
      form.setValue("role", job.formRole)
      if (job.formTrade) {
        form.setValue("trade" as any, job.formTrade)
      }
      if (job.formExperience) {
        form.setValue("experienceYears" as any, job.formExperience)
      }
    }
  }, [form])

  // Check URL params on mount and listen for custom event
  useEffect(() => {
    // Check URL params
    const params = new URLSearchParams(window.location.search)
    const jobParam = params.get('job')
    if (jobParam) {
      applyJobToForm(jobParam)
    }

    // Listen for job selection event from job cards
    const handleJobSelected = (event: CustomEvent<{ jobId: string }>) => {
      applyJobToForm(event.detail.jobId)
    }

    window.addEventListener('job-selected', handleJobSelected as EventListener)
    return () => {
      window.removeEventListener('job-selected', handleJobSelected as EventListener)
    }
  }, [applyJobToForm])

  const onSubmit = async (data: JobApplicationValues) => {
    setIsSubmitting(true)
    setError(null)

    // Get honeypot value from DOM (not managed by react-hook-form)
    const formElement = document.querySelector('form')
    const honeypotValue = formElement?.querySelector<HTMLInputElement>('[name="website_url"]')?.value

    // Validate Turnstile token
    if (!turnstileToken && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
      setError('Please complete the security verification')
      setIsSubmitting(false)
      return
    }

    try {
      const result = await submitApplication({
        ...data,
        website_url: honeypotValue,
        turnstileToken,
      } as any)
      if (result.success) {
        setIsSubmitted(true)
        form.reset()

        // Track valid submission as a Lead
        if (typeof window !== 'undefined' && (window as any).fbq) {
          ; (window as any).fbq('track', 'Lead')
        }
      } else {
        setError(result.error || "Submission failed")
      }
    } catch (err) {
      setError("An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const successRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isSubmitted && successRef.current) {
      successRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [isSubmitted])

  if (isSubmitted) {
    return (
      <motion.div
        ref={successRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-50 rounded-2xl p-8 lg:p-12 text-center"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-text-primary mb-4">
          Application Received!
        </h3>
        <p className="text-text-muted mb-6">
          Thanks for applying. We&apos;ll review your information and get back to you soon.
        </p>
        <Button
          onClick={() => setIsSubmitted(false)}
          variant="outline"
        >
          Submit Another Application
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="bg-gray-50 rounded-2xl p-8 lg:p-12">
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">

        {/* Selected Job Indicator */}
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Applying for:</p>
                <p className="font-semibold text-text-primary">{selectedJob.title}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedJob(null)
                form.setValue("role", undefined as any)
                form.setValue("trade" as any, undefined)
                form.setValue("experienceYears" as any, undefined)
                // Clear URL param
                const url = new URL(window.location.href)
                url.searchParams.delete('job')
                window.history.replaceState({}, '', url.toString())
              }}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Change
            </button>
          </motion.div>
        )}

        {/* Universal Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name *</label>
            <input
              {...form.register("fullName")}
              className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none"
              placeholder="John Doe"
            />
            {form.formState.errors.fullName && (
              <p className="text-red-500 text-sm">{form.formState.errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email *</label>
            <input
              {...form.register("email")}
              type="email"
              className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none"
              placeholder="john@example.com"
            />
            {form.formState.errors.email && (
              <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Phone *</label>
            <input
              {...form.register("phone")}
              type="tel"
              className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none"
              placeholder="(555) 555-5555"
            />
            {form.formState.errors.phone && (
              <p className="text-red-500 text-sm">{form.formState.errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Zip Code *</label>
            <input
              {...form.register("zipCode")}
              className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none"
              placeholder="78704"
            />
            {form.formState.errors.zipCode && (
              <p className="text-red-500 text-sm">{form.formState.errors.zipCode.message}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">How did you hear about us? *</label>
            <select
              {...form.register("source")}
              className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none bg-white"
            >
              <option value="">Select...</option>
              {["Indeed", "Facebook", "Instagram", "Referral", "Truck Wrap", "Other"].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {form.formState.errors.source && (
              <p className="text-red-500 text-sm">{form.formState.errors.source.message}</p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <label className="text-lg font-semibold block mb-4">Position *</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["technician", "office", "warehouse"] as const).map((r) => (
              <label
                key={r}
                className={`
                  cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-all
                  ${watchedRole === r ? 'border-brand-blue bg-blue-50 ring-1 ring-brand-blue' : 'border-gray-200 hover:border-brand-blue'}
                `}
              >
                <input
                  type="radio"
                  value={r}
                  {...form.register("role")}
                  className="accent-brand-blue w-5 h-5"
                />
                <span className="capitalize font-medium text-lg">{r}</span>
              </label>
            ))}
          </div>
          {form.formState.errors.role && (
            <p className="text-red-500 text-sm mt-2">{form.formState.errors.role.message}</p>
          )}
        </div>

        {/* Dynamic Fields based on Role */}
        <AnimatePresence mode="wait">
          {watchedRole === "technician" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6 pt-2"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="space-y-2">
                  <label className="text-sm font-medium">Trade *</label>
                  <select
                    {...form.register("trade")}
                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none bg-white"
                  >
                    <option value="">Select...</option>
                    {["HVAC", "Plumbing", "Electrical", "General"].map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {(form.formState.errors as any).trade && (
                    <p className="text-red-500 text-sm">{(form.formState.errors as any).trade.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Experience Level *</label>
                  <select
                    {...form.register("experienceYears")}
                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none bg-white"
                  >
                    <option value="">Select...</option>
                    {["0-1 (Apprentice)", "2-4", "5-9", "10+"].map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {(form.formState.errors as any).experienceYears && (
                    <p className="text-red-500 text-sm">{(form.formState.errors as any).experienceYears.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  {watchedExperience && watchedExperience !== "0-1 (Apprentice)" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-2"
                    >
                      <label className="text-sm font-medium">Most Recent Employer *</label>
                      <input
                        {...form.register("mostRecentEmployer")}
                        className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none"
                      />
                      {(form.formState.errors as any).mostRecentEmployer && (
                        <p className="text-red-500 text-sm">{(form.formState.errors as any).mostRecentEmployer.message}</p>
                      )}
                    </motion.div>
                  )}
                </div>

                <div className="space-y-4 md:col-span-2">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      {...form.register("hasLicense")}
                      className="w-5 h-5 accent-brand-blue"
                    />
                    <span className="text-sm font-medium">Do you hold a state trade license?</span>
                  </label>

                  {form.watch("hasLicense") && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="pl-8"
                    >
                      <label className="text-sm font-medium block mb-2">Which license?</label>
                      <select
                        {...form.register("licenseType")}
                        className="w-full md:w-1/2 p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none bg-white"
                      >
                        <option value="">Select License...</option>
                        {/* Dynamic options based on Trade */}
                        {form.watch("trade" as any) === "HVAC" && [
                          "Registered Technician",
                          "Certified Technician",
                          "Class A",
                          "Class B"
                        ].map(l => <option key={l} value={l}>{l}</option>)}

                        {form.watch("trade" as any) === "Plumbing" && [
                          "Apprentice",
                          "Tradesman-Plumber Limited",
                          "Journeyman",
                          "Master"
                        ].map(l => <option key={l} value={l}>{l}</option>)}

                        {form.watch("trade" as any) === "Electrical" && [
                          "Apprentice",
                          "Residential Wireman",
                          "Journeyman",
                          "Master"
                        ].map(l => <option key={l} value={l}>{l}</option>)}

                        {form.watch("trade" as any) === "General" && <option value="N/A">N/A or Other</option>}

                        {!form.watch("trade" as any) && <option value="Other">Other</option>}
                      </select>
                      {(form.formState.errors as any).licenseType && (
                        <p className="text-red-500 text-sm mt-1">{(form.formState.errors as any).licenseType.message}</p>
                      )}
                    </motion.div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Why are you interested in this role? *</label>
                  <textarea
                    {...form.register("motivation")}
                    rows={3}
                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none resize-none"
                  />
                  {(form.formState.errors as any).motivation && (
                    <p className="text-red-500 text-sm">{(form.formState.errors as any).motivation.message}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {watchedRole === "office" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6 pt-2"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Experience Level *</label>
                  <select
                    {...form.register("officeExperience")}
                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none bg-white"
                  >
                    <option value="">Select...</option>
                    {["Entry Level", "1-3 Years", "3+ Years"].map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {(form.formState.errors as any).officeExperience && (
                    <p className="text-red-500 text-sm">{(form.formState.errors as any).officeExperience.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  {watchedOfficeExp && watchedOfficeExp !== "Entry Level" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-2"
                    >
                      <label className="text-sm font-medium">Most Recent Employer *</label>
                      <input
                        {...form.register("mostRecentEmployer")}
                        className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none"
                      />
                      {(form.formState.errors as any).mostRecentEmployer && (
                        <p className="text-red-500 text-sm">{(form.formState.errors as any).mostRecentEmployer.message}</p>
                      )}
                    </motion.div>
                  )}
                </div>

                <div className="space-y-4 md:col-span-2">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      {...form.register("knownSoftware")}
                      className="w-5 h-5 accent-brand-blue"
                    />
                    <span className="text-sm font-medium">Experience with ServiceTitan/Housecall Pro?</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      {...form.register("callVolumeComfort")}
                      className="w-5 h-5 accent-brand-blue"
                    />
                    <span className="text-sm font-medium">Comfortable with high call volume?</span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {watchedRole === "warehouse" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6 pt-2"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 md:col-span-2">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      {...form.register("canLift50lbs")}
                      className="w-5 h-5 accent-brand-blue"
                    />
                    <span className="text-sm font-medium">Can you lift 50lbs?</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      {...form.register("hasDriversLicense")}
                      className="w-5 h-5 accent-brand-blue"
                    />
                    <span className="text-sm font-medium">Do you have a valid driver&apos;s license?</span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Honeypot Field (invisible to humans) */}
        <HoneypotField />

        {/* Turnstile Widget */}
        <div className="pt-2">
          <Turnstile
            onVerify={handleTurnstileVerify}
            onError={handleTurnstileError}
            onExpire={handleTurnstileExpire}
            size="invisible"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto bg-brand-red hover:bg-brand-red/90 text-white px-8 py-3 h-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Submit Application
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>

      </form>
    </div>
  )
}
