// YouTube utility functions for server-side use

export interface VideoInfo {
  id: string
  title: string
  url: string
}

// Helper function to extract YouTube video ID from various URL formats
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  
  return null
}

// Server-side function to fetch video info from YouTube oEmbed API
export async function fetchYouTubeVideoInfo(url: string): Promise<VideoInfo | null> {
  const id = extractYouTubeId(url)
  if (!id) return null

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`
    const response = await fetch(oembedUrl, { next: { revalidate: 86400 } }) // Cache for 24 hours
    
    if (!response.ok) {
      // Return fallback if oEmbed fails
      return {
        id,
        title: 'Video',
        url
      }
    }
    
    const data = await response.json()
    return {
      id,
      title: data.title || 'Video',
      url
    }
  } catch {
    // Return fallback on error
    return {
      id,
      title: 'Video',
      url
    }
  }
}

// Fetch info for multiple videos
export async function fetchYouTubeVideosInfo(urls: string[]): Promise<VideoInfo[]> {
  const results = await Promise.all(urls.map(fetchYouTubeVideoInfo))
  return results.filter((v): v is VideoInfo => v !== null)
}
