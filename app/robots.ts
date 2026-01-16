import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/service-agreement-thanks'],
    },
    sitemap: 'https://www.brandenburgplumbing.com/sitemap.xml',
  }
}
