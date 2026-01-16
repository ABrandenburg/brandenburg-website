// Google Places API integration for fetching 5-star reviews

export interface GoogleReview {
  authorName: string
  authorPhoto?: string
  rating: number
  text: string
  relativeTimeDescription: string
  time: number
}

// Fetch reviews directly from Google Places API (New) - server-side
export async function fetchGoogleReviews(): Promise<GoogleReview[] | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const placeId = process.env.GOOGLE_PLACE_ID

  // If API not configured, return null to hide the section
  if (!apiKey || !placeId) {
    console.log('Google Places API not configured')
    return null
  }

  try {
    // Using the new Places API endpoint
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        method: 'GET',
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'reviews,rating,userRatingCount',
        },
        next: { revalidate: 86400 }, // Cache for 24 hours
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.log('Failed to fetch reviews from Google API:', errorData)
      return null
    }

    const data = await response.json()

    if (data.reviews && data.reviews.length > 0) {
      // Filter to only 5-star reviews and format them
      const fiveStarReviews = data.reviews
        .filter((review: any) => review.rating === 5)
        .map((review: any) => ({
          authorName: review.authorAttribution?.displayName || 'Customer',
          authorPhoto: review.authorAttribution?.photoUri,
          rating: review.rating,
          text: review.text?.text || review.originalText?.text || '',
          relativeTimeDescription: review.relativePublishTimeDescription || '',
          time: review.publishTime ? new Date(review.publishTime).getTime() : Date.now(),
        }))

      return fiveStarReviews.length > 0 ? fiveStarReviews : null
    }

    return null
  } catch (error) {
    console.error('Error fetching Google reviews:', error)
    return null
  }
}

