"use client"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { Loader2, CheckCircle, ArrowRight, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  weddingQuestionnaireSchema,
  type WeddingQuestionnaireValues,
  SERVICE_OPTIONS,
  BUDGET_RANGES,
  GUEST_COUNT_RANGES,
} from "@/lib/schemas/wedding-questionnaire-schema"
import { HoneypotField } from "@/components/ui/honeypot-field"

export function WeddingQuestionnaireForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<WeddingQuestionnaireValues>({
    resolver: zodResolver(weddingQuestionnaireSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      partnerOneName: "",
      partnerTwoName: "",
      weddingDate: "",
      venueName: "",
      venueAddress: "",
      estimatedGuests: undefined,
      servicesNeeded: [],
      budgetRange: undefined,
      timeline: "",
      additionalDetails: "",
    },
    mode: "onChange",
  })

  const formatPhoneNumber = (value: string): string => {
    const phoneNumber = value.replace(/\D/g, '')
    if (phoneNumber.length < 4) return phoneNumber
    if (phoneNumber.length < 7) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
  }

  const onSubmit = async (data: WeddingQuestionnaireValues) => {
    setIsSubmitting(true)
    setError(null)

    const formElement = document.querySelector('form')
    const honeypotValue = formElement?.querySelector<HTMLInputElement>('[name="website_url"]')?.value

    try {
      const response = await fetch('/api/wedding-questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          website_url: honeypotValue,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setIsSubmitted(true)
        form.reset()
      } else {
        setError(result.error || "Submission failed. Please try again.")
      }
    } catch {
      setError("An unexpected error occurred. Please try again or call us directly.")
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
          Questionnaire Received!
        </h3>
        <p className="text-text-muted mb-6">
          Thank you for submitting your wedding details. Our team will review your
          requirements and reach out to you soon.
        </p>
        <Button onClick={() => setIsSubmitted(false)} variant="outline">
          Submit Another Questionnaire
        </Button>
      </motion.div>
    )
  }

  const inputClass = "w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none"
  const selectClass = `${inputClass} bg-white`
  const errorClass = "text-red-500 text-sm"

  return (
    <div className="bg-gray-50 rounded-2xl p-8 lg:p-12">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name *</label>
              <input
                {...form.register("fullName")}
                className={inputClass}
                placeholder="Jane Smith"
              />
              {form.formState.errors.fullName && (
                <p className={errorClass}>{form.formState.errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email *</label>
              <input
                {...form.register("email")}
                type="email"
                className={inputClass}
                placeholder="jane@example.com"
              />
              {form.formState.errors.email && (
                <p className={errorClass}>{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Phone *</label>
              <input
                {...form.register("phone", {
                  onChange: (e) => {
                    e.target.value = formatPhoneNumber(e.target.value)
                  },
                })}
                type="tel"
                className={inputClass}
                placeholder="(512) 555-1234"
              />
              {form.formState.errors.phone && (
                <p className={errorClass}>{form.formState.errors.phone.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200" />

        {/* Wedding Details */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-brand-red" />
            Wedding Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Partner One Name *</label>
              <input
                {...form.register("partnerOneName")}
                className={inputClass}
                placeholder="First & last name"
              />
              {form.formState.errors.partnerOneName && (
                <p className={errorClass}>{form.formState.errors.partnerOneName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Partner Two Name *</label>
              <input
                {...form.register("partnerTwoName")}
                className={inputClass}
                placeholder="First & last name"
              />
              {form.formState.errors.partnerTwoName && (
                <p className={errorClass}>{form.formState.errors.partnerTwoName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Wedding Date *</label>
              <input
                {...form.register("weddingDate")}
                type="date"
                className={inputClass}
              />
              {form.formState.errors.weddingDate && (
                <p className={errorClass}>{form.formState.errors.weddingDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estimated Guest Count *</label>
              <select {...form.register("estimatedGuests")} className={selectClass}>
                <option value="">Select...</option>
                {GUEST_COUNT_RANGES.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {form.formState.errors.estimatedGuests && (
                <p className={errorClass}>{form.formState.errors.estimatedGuests.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Venue Name *</label>
              <input
                {...form.register("venueName")}
                className={inputClass}
                placeholder="e.g. The Oaks at Horseshoe Bay"
              />
              {form.formState.errors.venueName && (
                <p className={errorClass}>{form.formState.errors.venueName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Venue Address *</label>
              <input
                {...form.register("venueAddress")}
                className={inputClass}
                placeholder="Full street address"
              />
              {form.formState.errors.venueAddress && (
                <p className={errorClass}>{form.formState.errors.venueAddress.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200" />

        {/* Services Needed */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Services Needed
          </h3>
          <p className="text-sm text-text-muted mb-4">Select all that apply *</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SERVICE_OPTIONS.map((service) => (
              <label
                key={service}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-brand-blue cursor-pointer transition-all has-[:checked]:border-brand-blue has-[:checked]:bg-blue-50"
              >
                <input
                  type="checkbox"
                  value={service}
                  {...form.register("servicesNeeded")}
                  className="w-5 h-5 accent-brand-blue"
                />
                <span className="text-sm font-medium">{service}</span>
              </label>
            ))}
          </div>
          {form.formState.errors.servicesNeeded && (
            <p className={`${errorClass} mt-2`}>{form.formState.errors.servicesNeeded.message}</p>
          )}
        </div>

        <div className="border-t border-gray-200" />

        {/* Budget & Timeline */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Budget & Timeline
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Budget Range *</label>
              <select {...form.register("budgetRange")} className={selectClass}>
                <option value="">Select...</option>
                {BUDGET_RANGES.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {form.formState.errors.budgetRange && (
                <p className={errorClass}>{form.formState.errors.budgetRange.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">When do you need services completed? *</label>
              <input
                {...form.register("timeline")}
                className={inputClass}
                placeholder="e.g. 2 weeks before the wedding"
              />
              {form.formState.errors.timeline && (
                <p className={errorClass}>{form.formState.errors.timeline.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200" />

        {/* Additional Details */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Additional Details</label>
          <textarea
            {...form.register("additionalDetails")}
            rows={4}
            className={`${inputClass} resize-none`}
            placeholder="Any other requirements, special considerations, or questions..."
          />
        </div>

        <HoneypotField />

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
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
              Submit Questionnaire
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
