"use client"

import { useState, useCallback } from 'react'
import Image from 'next/image'

interface LiteYouTubeEmbedProps {
  videoId: string
  title: string
  className?: string
}

export function LiteYouTubeEmbed({ videoId, title, className = '' }: LiteYouTubeEmbedProps) {
  const [isActivated, setIsActivated] = useState(false)

  const handleClick = useCallback(() => {
    setIsActivated(true)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsActivated(true)
    }
  }, [])

  // YouTube thumbnail URLs - try maxresdefault, fallback handled by Next.js Image
  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`

  if (isActivated) {
    return (
      <div className={`relative aspect-video ${className}`}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&playsinline=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
          style={{ border: 'none' }}
        />
      </div>
    )
  }

  return (
    <div
      className={`relative aspect-video cursor-pointer group ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Play video: ${title}`}
    >
      {/* Thumbnail */}
      <Image
        src={thumbnailUrl}
        alt={title}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
        unoptimized // YouTube thumbnails don't need optimization
      />

      {/* Dark overlay on hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />

      {/* Play Button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-red rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-200">
          {/* Play triangle */}
          <svg
            className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-1"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </div>
  )
}
