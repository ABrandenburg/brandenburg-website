"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const jobRoles = [
  { value: '', label: 'Select a role...' },
  { value: 'apprentice', label: 'Apprentice' },
  { value: 'tradesman', label: 'Tradesman' },
  { value: 'journeyman', label: 'Journeyman' },
  { value: 'master', label: 'Master' },
  { value: 'warehouse', label: 'Warehouse Associate' },
  { value: 'customer-service', label: 'Customer Service' },
]

interface FormData {
  fullName: string
  email: string
  phone: string
  role: string
  message: string
}

interface FormErrors {
  fullName?: string
  email?: string
  phone?: string
  role?: string
  message?: string
}

export function CareersForm() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    message: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please tell us a bit about yourself'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Get the role label for the email
    const roleLabel = jobRoles.find(r => r.value === formData.role)?.label || formData.role

    try {
      const response = await fetch('/api/careers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          role: roleLabel,
          message: formData.message,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit application')
      }

      setIsSubmitted(true)
    } catch (error) {
      console.error('Submission error:', error)
      alert('There was an error submitting your application. Please try again or contact us directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format phone number as user types
  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    
    // Apply phone formatting for phone field
    const newValue = name === 'phone' ? formatPhoneNumber(value) : value
    
    setFormData(prev => ({ ...prev, [name]: newValue }))
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-50 rounded-2xl p-8 lg:p-12 text-center"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-text-primary mb-4">
          Application Submitted!
        </h3>
        <p className="text-text-muted mb-6">
          Thank you for your interest in joining our team! We&apos;ve received your application 
          and will be in touch soon.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsSubmitted(false)
            setFormData({
              fullName: '',
              email: '',
              phone: '',
              role: '',
              message: '',
            })
          }}
        >
          Submit Another Application
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-gray-50 rounded-2xl p-8 lg:p-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-text-primary mb-2">
            Full Name <span className="text-brand-red">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.fullName ? 'border-red-500' : 'border-gray-200'
            } bg-white text-text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all`}
            placeholder="John Smith"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
            Email <span className="text-brand-red">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.email ? 'border-red-500' : 'border-gray-200'
            } bg-white text-text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all`}
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-2">
            Phone Number <span className="text-brand-red">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.phone ? 'border-red-500' : 'border-gray-200'
            } bg-white text-text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all`}
            placeholder="(512) 555-1234"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-text-primary mb-2">
            For what role? <span className="text-brand-red">*</span>
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.role ? 'border-red-500' : 'border-gray-200'
            } bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all appearance-none cursor-pointer`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              backgroundSize: '1.25rem',
            }}
          >
            {jobRoles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-500">{errors.role}</p>
          )}
        </div>
      </div>

      {/* Message */}
      <div className="mt-6">
        <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-2">
          Anything you&apos;d like to add? <span className="text-brand-red">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className={`w-full px-4 py-3 rounded-lg border ${
            errors.message ? 'border-red-500' : 'border-gray-200'
          } bg-white text-text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all resize-none`}
          placeholder="Tell us about your experience, why you want to work here, etc."
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-500">{errors.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="mt-8">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand-red hover:bg-brand-red/90 text-white px-8 py-3 h-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Preparing...
            </>
          ) : (
            <>
              Submit
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </motion.form>
  )
}
