"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Volume2, VolumeX, Maximize } from 'lucide-react'
import { VideoModal, useVideoModal } from './video-modal'
import type { VideoInfo } from '@/lib/youtube-utils'

interface HeroVideoProps {
  video: VideoInfo
  className?: string
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
}

export function HeroVideo({ video, className = '' }: HeroVideoProps) {
  const modal = useVideoModal()
  const [isMuted, setIsMuted] = useState(true)
  
  // YouTube embed URL with autoplay, muted (required for autoplay), loop, and captions
  // cc_load_policy=1 forces captions on, cc_lang_pref=en sets preferred language
  const embedUrl = `https://www.youtube.com/embed/${video.id}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${video.id}&controls=0&modestbranding=1&rel=0&playsinline=1&cc_load_policy=1&cc_lang_pref=en&enablejsapi=1`
  
  return (
    <>
      <motion.div
        className={`relative rounded-2xl overflow-hidden shadow-soft-xl ${className}`}
        variants={scaleIn}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Embedded Video - Autoplay with Captions */}
        <div className="relative aspect-video">
          <iframe
            key={`hero-video-${isMuted}`}
            src={embedUrl}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            style={{ border: 'none' }}
          />
          
          {/* Control Overlay - Top positioned to avoid subtitle overlap */}
          <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-center justify-between">
              {/* Video Title */}
              <div className="flex-1 mr-4">
                <p className="text-[10px] text-white/80 font-medium uppercase tracking-wider">
                  Watch Our Story
                </p>
                <p className="text-xs font-semibold text-white line-clamp-1">
                  {video.title}
                </p>
              </div>
              
              {/* Control Buttons */}
              <div className="flex items-center gap-2">
                {/* Mute/Unmute Button */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
                  aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-white" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-white" />
                  )}
                </button>
                
                {/* Fullscreen/Expand Button */}
                <button
                  onClick={modal.open}
                  className="w-8 h-8 bg-brand-red hover:bg-brand-red/90 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Watch fullscreen"
                >
                  <Maximize className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Fullscreen Modal */}
      <VideoModal
        videoId={video.id}
        title={video.title}
        isOpen={modal.isOpen}
        onClose={modal.close}
      />
    </>
  )
}
