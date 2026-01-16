"use client"

import Image from 'next/image'
import { motion } from 'framer-motion'

interface PhotoCardProps {
  src: string
  alt: string
  className?: string
  sizes?: string
  delay?: number
}

function PhotoCard({ src, alt, className = '', sizes, delay = 0 }: PhotoCardProps) {
  return (
    <motion.div 
      className={`group relative overflow-hidden rounded-xl bg-gray-100 shadow-soft hover:shadow-soft-lg transition-all duration-500 ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        sizes={sizes}
      />
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  )
}

export function PhotoGrid() {
  return (
    <section className="py-10 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {/* Left Column - Stacked photos */}
          <div className="space-y-5 lg:space-y-6">
            {/* Team Photo */}
            <PhotoCard
              src="/images/team-photo.jpg"
              alt="Brandenburg Plumbing team standing in front of service trucks"
              className="aspect-[4/3]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              delay={0}
            />
            
            {/* Service Trucks */}
            <PhotoCard
              src="/images/service-trucks.jpg"
              alt="Brandenburg Plumbing service trucks"
              className="aspect-[4/3]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              delay={0.15}
            />
          </div>

          {/* Right Column - Large photo spanning full height */}
          <div className="md:col-span-1 lg:col-span-2">
            <PhotoCard
              src="/images/plumber-customer.jpg"
              alt="Brandenburg plumber consulting with customer in their kitchen"
              className="aspect-[4/3] lg:aspect-auto lg:h-full min-h-[400px]"
              sizes="(max-width: 768px) 100vw, 66vw"
              delay={0.1}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
