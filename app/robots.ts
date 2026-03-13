import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/service-agreement-thanks', '/email-signature/'],
    },
    sitemap: 'https://www.brandenburgplumbing.com/sitemap.xml',
  }
}
