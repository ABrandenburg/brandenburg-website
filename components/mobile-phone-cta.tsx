"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Calendar } from 'lucide-react'
import Link from 'next/link'
import { openScheduler } from '@/lib/scheduler'

export function MobilePhoneCTA() {
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Show after scrolling past hero
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)

    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  // Only show on mobile
  if (!isMobile) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg md:hidden"
        >
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="tel:512-756-9847"
              className="flex items-center justify-center gap-2 w-full bg-brand-red text-white py-3 px-4 rounded-lg font-semibold hover:bg-brand-red/90 transition-colors text-sm"
            >
              <Phone className="w-4 h-4" />
              <span>Call Now</span>
            </Link>
            <button
              onClick={openScheduler}
              className="flex items-center justify-center gap-2 w-full bg-brand-blue text-white py-3 px-4 rounded-lg font-semibold hover:bg-brand-blue/90 transition-colors text-sm"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Online</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
