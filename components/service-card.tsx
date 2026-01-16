"use client"

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface ServiceCardProps {
  title: string
  description: string
  image: string
  icon: React.ReactNode
  href: string
  index?: number
}

export function ServiceCard({ title, description, image, icon, href, index = 0 }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1]
      }}
    >
      <Link 
        href={href}
        className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-400"
      >
        {/* Image + badge wrapper */}
        <div className="relative">
          <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Subtle overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>

          {/* Icon Badge - Enhanced with pulse on hover */}
          <div className="absolute -bottom-7 left-5 z-20 w-14 h-14 bg-white rounded-full shadow-soft-md border border-gray-100 flex items-center justify-center group-hover:shadow-soft-lg group-hover:border-gray-200 group-hover:scale-110 transition-all duration-300">
            <div className="text-brand-blue">
              {icon}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-0 p-6 pt-14">
          <h3 className="font-serif text-xl lg:text-2xl font-bold text-text-primary mb-2">
            {title}
          </h3>
          <p className="text-text-muted text-sm lg:text-base leading-relaxed mb-4 line-clamp-2">
            {description}
          </p>
          <div className="flex items-center gap-2 text-brand-blue font-medium text-sm">
            <span className="relative">
              Learn More
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-blue/30 group-hover:w-full transition-all duration-300" />
            </span>
            <ArrowRight className="w-4 h-4 transition-all duration-300 group-hover:translate-x-2" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
