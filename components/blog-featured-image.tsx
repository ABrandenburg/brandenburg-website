"use client"

import { useState } from 'react'
import Image from 'next/image'

interface BlogFeaturedImageProps {
  src: string
  alt: string
}

// Default fallback image
const FALLBACK_IMAGE = '/images/plumber-customer.jpg'

export function BlogFeaturedImage({ src, alt }: BlogFeaturedImageProps) {
  const [imageSrc, setImageSrc] = useState(src)

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      className="object-cover"
      priority
      sizes="(max-width: 1024px) 100vw, 896px"
      onError={() => setImageSrc(FALLBACK_IMAGE)}
      unoptimized={imageSrc.startsWith('http')}
    />
  )
}
