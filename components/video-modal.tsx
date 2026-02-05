"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'

interface VideoModalProps {
  videoId: string
  title: string
  isOpen: boolean
  onClose: () => void
}

export function VideoModal({ videoId, title, isOpen, onClose }: VideoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] p-0 bg-black border-0 overflow-hidden">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="relative aspect-video w-full">
          {isOpen && (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&playsinline=1&cc_load_policy=1&cc_lang_pref=en`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              style={{ border: 'none' }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook for managing video modal state
export function useVideoModal() {
  const [isOpen, setIsOpen] = useState(false)
  
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  }
}
