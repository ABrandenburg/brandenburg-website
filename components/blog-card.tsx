"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import type { BlogPost } from '@/lib/blog-data'
import { formatDate } from '@/lib/blog-data'

interface BlogCardProps {
  post: BlogPost
  index?: number
}

// Default fallback image
const FALLBACK_IMAGE = '/images/plumber-customer.jpg'

// Category color mapping
function getCategoryColor(category: string): string {
  switch (category) {
    case 'Tips & Tricks':
      return 'bg-brand-red text-white'
    case 'Company News':
      return 'bg-brand-blue text-white'
    case 'Plumber Profile':
      return 'bg-amber-500 text-white'
    default:
      return 'bg-gray-600 text-white'
  }
}

export function BlogCard({ post, index = 0 }: BlogCardProps) {
  const [imageSrc, setImageSrc] = useState(post.image)

  return (
    <motion.article
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
        href={`/blog-posts/${post.slug}`}
        className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-400 h-full"
      >
        {/* Image */}
        <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
          <Image
            src={imageSrc}
            alt={`Article thumbnail for: ${post.title}`}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImageSrc(FALLBACK_IMAGE)}
            unoptimized={imageSrc.startsWith('http')}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getCategoryColor(post.categoryDisplay)}`}>
              {post.categoryDisplay}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Date and Reading Time */}
          <div className="flex items-center gap-3 text-sm text-text-muted mb-3">
            <time dateTime={post.publishedOn}>
              {formatDate(post.publishedOn)}
            </time>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>{post.readingTime} min read</span>
          </div>

          {/* Title */}
          <h3 className="font-serif text-xl lg:text-2xl font-bold text-text-primary mb-3 line-clamp-2 group-hover:text-brand-blue transition-colors">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-text-muted text-sm lg:text-base leading-relaxed mb-4 line-clamp-2">
            {post.summary}
          </p>

          {/* Read More Link */}
          <div className="flex items-center gap-2 text-brand-blue font-medium text-sm">
            <span className="relative">
              Read article
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-blue/30 group-hover:w-full transition-all duration-300" />
            </span>
            <ArrowRight className="w-4 h-4 transition-all duration-300 group-hover:translate-x-2" />
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
