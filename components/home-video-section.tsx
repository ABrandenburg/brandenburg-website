"use client"

import { motion } from 'framer-motion'
import type { VideoInfo } from '@/lib/youtube-utils'
import { LiteYouTubeEmbed } from './lite-youtube-embed'

interface HomeVideoSectionProps {
  video: VideoInfo
}

export function HomeVideoSection({ video }: HomeVideoSectionProps) {
  if (!video) return null

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <p className="text-brand-blue text-sm lg:text-base font-semibold uppercase tracking-wider mb-4">
            See Us In Action
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-blue">
            Meet Brandenburg Plumbing
          </h2>
        </motion.div>

        {/* Video Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl overflow-hidden shadow-soft-lg"
        >
          {/* Video Title */}
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-lg text-text-primary text-center">
              {video.title}
            </h3>
          </div>
          
          {/* Video Embed */}
          <LiteYouTubeEmbed videoId={video.id} title={video.title} />
        </motion.div>
      </div>
    </section>
  )
}
