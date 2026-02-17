/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...(config.watchOptions || {}),
        ignored: "**/{migration-assets,migration_assets,.next,node_modules}/**",
        poll: 1000,
        aggregateTimeout: 300,
      }
    }

    return config
  },

  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
    ],
  },

  async redirects() {
    return [
      // Fix typo in FAQ URL (from live site)
      { source: '/frequenty-asked-questions', destination: '/frequently-asked-questions', permanent: true },

      // Old internal URL patterns -> new URLs
      { source: '/faq', destination: '/frequently-asked-questions', permanent: true },
      { source: '/about', destination: '/about-us', permanent: true },
      { source: '/guarantees', destination: '/our-guarantees', permanent: true },
      { source: '/locations', destination: '/service-area', permanent: true },
      { source: '/locations/:slug', destination: '/location/:slug', permanent: true },
      { source: '/services/:slug', destination: '/service/:slug', permanent: true },
      { source: '/blog/:slug', destination: '/blog-posts/:slug', permanent: true },
      { source: '/commercial-membership', destination: '/membership', permanent: true },
      { source: '/about/team', destination: '/meet-team', permanent: true },

      // Legacy redirects from Webflow
      { source: '/team', destination: '/meet-team', permanent: true },
      { source: '/history', destination: '/about-us', permanent: true },
      { source: '/legal', destination: '/privacy-policy', permanent: true },
      { source: '/promotion', destination: '/promotions', permanent: true },
    ]
  },
}

module.exports = nextConfig
