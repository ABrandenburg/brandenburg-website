"use client"

import { motion } from 'framer-motion'
import type { VideoInfo } from '@/lib/youtube-utils'

interface VideoSectionProps {
  videos: VideoInfo[]
  serviceName?: string
}

export function VideoSection({ videos, serviceName = "Service" }: VideoSectionProps) {
  if (!videos || videos.length === 0) return null

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-blue mb-4">
            Watch Our {serviceName} Videos
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            See our team in action and learn more about our services.
          </p>
        </motion.div>

        {/* Videos Grid */}
        <div className={`grid gap-8 ${videos.length === 1 ? 'max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-2'}`}>
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-soft flex flex-col"
            >
              {/* Video Title */}
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-lg text-text-primary line-clamp-2 min-h-[3.5rem]">
                  {video.title}
                </h3>
              </div>
              
              {/* Video Embed */}
              <div className="relative aspect-video bg-black leading-[0] flex-1">
                <iframe
                  src={`https://www.youtube.com/embed/${video.id}?modestbranding=1&rel=0&showinfo=0&controls=1&playsinline=1`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full block"
                  style={{ border: 'none' }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
