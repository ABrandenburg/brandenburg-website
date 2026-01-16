import type { Metadata } from 'next'
import Script from 'next/script'
import { SkipLink } from '@/components/skip-link'
import { BackToTop } from '@/components/back-to-top'
import { MobilePhoneCTA } from '@/components/mobile-phone-cta'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.brandenburgplumbing.com'),
  title: {
    default: 'Plumbing Repair, Replace, and Install Service | Brandenburg Plumbing',
    template: '%s | Brandenburg Plumbing',
  },
  description: 'Expert Highland Lakes & Austin plumbers you can trust. 24/7 same day service, fully licensed & insured, lifetime labor guarantee.',
  keywords: ['plumber', 'plumbing', 'Highland Lakes', 'Austin', 'Burnet County', 'Texas', 'water heater', 'drain cleaning', 'emergency plumber', 'Marble Falls plumber'],
  authors: [{ name: 'Brandenburg Plumbing' }],
  creator: 'Brandenburg Plumbing',
  publisher: 'Brandenburg Plumbing',
  icons: {
    icon: '/images/favicon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.brandenburgplumbing.com',
    siteName: 'Brandenburg Plumbing',
    title: 'Brandenburg Plumbing | Expert Plumbers in Highland Lakes & Austin',
    description: 'Expert Highland Lakes & Austin plumbers you can trust. 24/7 same day service, fully licensed & insured, lifetime labor guarantee.',
    images: [
      {
        url: '/images/team-photo.jpg',
        width: 1200,
        height: 630,
        alt: 'Brandenburg Plumbing Team',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brandenburg Plumbing | Expert Plumbers in Highland Lakes & Austin',
    description: 'Expert Highland Lakes & Austin plumbers you can trust. 24/7 same day service.',
    images: ['/images/team-photo.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add Google Search Console verification after deploying:
    // 1. Go to https://search.google.com/search-console
    // 2. Add your domain as a property
    // 3. Get the verification code
    // 4. Add it here: google: 'your-verification-code',
  },
}

// Organization JSON-LD structured data
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Plumber',
  '@id': 'https://www.brandenburgplumbing.com/#organization',
  name: 'Brandenburg Plumbing',
  url: 'https://www.brandenburgplumbing.com',
  logo: 'https://www.brandenburgplumbing.com/images/logo.png',
  image: 'https://www.brandenburgplumbing.com/images/team-photo.jpg',
  description: 'Expert Highland Lakes & Austin plumbers you can trust. 24/7 same day service, fully licensed & insured, lifetime labor guarantee.',
  telephone: '+1-512-756-7654',
  email: 'service@brandenburgplumbing.com',
  foundingDate: '1997',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '320 North Ridge Rd., Bldg. 2 Unit B',
    addressLocality: 'Marble Falls',
    addressRegion: 'TX',
    postalCode: '78654',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 30.5783,
    longitude: -98.2750,
  },
  areaServed: [
    { '@type': 'City', name: 'Burnet', containedInPlace: { '@type': 'State', name: 'Texas' } },
    { '@type': 'City', name: 'Marble Falls', containedInPlace: { '@type': 'State', name: 'Texas' } },
    { '@type': 'City', name: 'Cedar Park', containedInPlace: { '@type': 'State', name: 'Texas' } },
    { '@type': 'City', name: 'Georgetown', containedInPlace: { '@type': 'State', name: 'Texas' } },
    { '@type': 'City', name: 'Round Rock', containedInPlace: { '@type': 'State', name: 'Texas' } },
    { '@type': 'City', name: 'Leander', containedInPlace: { '@type': 'State', name: 'Texas' } },
    { '@type': 'City', name: 'Liberty Hill', containedInPlace: { '@type': 'State', name: 'Texas' } },
    { '@type': 'City', name: 'Kingsland', containedInPlace: { '@type': 'State', name: 'Texas' } },
    { '@type': 'City', name: 'Horseshoe Bay', containedInPlace: { '@type': 'State', name: 'Texas' } },
    { '@type': 'City', name: 'Granite Shoals', containedInPlace: { '@type': 'State', name: 'Texas' } },
    { '@type': 'City', name: 'Spicewood', containedInPlace: { '@type': 'State', name: 'Texas' } },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '639',
    bestRating: '5',
    worstRating: '1',
  },
  priceRange: '$$',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
  ],
  sameAs: [
    'https://facebook.com/brandenburgplumbing',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Plumbing Services',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Water Heater Installation & Repair' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Drain Cleaning' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Water Softener Installation' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Emergency Plumbing' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Bathroom Plumbing' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Kitchen Plumbing' } },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Font Smoothing */}
        <style dangerouslySetInnerHTML={{
          __html: `
          body {
            -moz-osx-font-smoothing: grayscale;
            -webkit-font-smoothing: antialiased;
          }
        `}} />

        {/* Adobe Fonts - Freight Text Pro & Neue Haas Grotesk */}
        <link
          rel="stylesheet"
          href="https://use.typekit.net/nbu4ntf.css"
        />

        {/* Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-TMTM3S3');
          `}
        </Script>

        {/* Font Awesome */}
        <Script
          src="https://kit.fontawesome.com/9598769622.js"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* AnyTrack Tracking Code */}
        <Script id="anytrack-script" strategy="afterInteractive">
          {`
            !function(e,t,n,s,a){(a=t.createElement(n)).async=!0,a.src="https://assets.anytrack.io/O1jBFCOs80NX.js",(t=t.getElementsByTagName(n)[0]).parentNode.insertBefore(a,t),e[s]=e[s]||function(){(e[s].q=e[s].q||[]).push(arguments)}}(window,document,"script","AnyTrack");
          `}
        </Script>

        {/* ServiceTitan DNI (Dynamic Number Insertion) */}
        <Script id="servicetitan-dni" strategy="afterInteractive">
          {`
            dni = (function(q,w,e,r,t,y,u){q['ServiceTitanDniObject']=t;q[t]=q[t]||function(){
                (q[t].q=q[t].q||[]).push(arguments)};q[t].l=1*new Date();y=w.createElement(e);
                u=w.getElementsByTagName(e)[0];y.async=true;y.src=r;u.parentNode.insertBefore(y,u);
                return q[t];
            })(window,document,'script','https://static.servicetitan.com/marketing-ads/dni.js','dni');
            dni('init', '1709012758');
            document.addEventListener('DOMContentLoaded', function() { dni('load'); }, false);
          `}
        </Script>

        {/* ServiceTitan Scheduler */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const script = document.createElement('script');
              script.src = "https://embed.scheduler.servicetitan.com/scheduler-v1.js";
              script.defer = true;
              script.id = "se-widget-embed";
              script.setAttribute("data-api-key", "wvzoyd54li622kngkpsjlmjg");
              script.setAttribute("data-schedulerid", "sched_iznsrydnu074jzax2stfqht5");
              document.head.appendChild(script);
            `
          }}
        />
      </head>
      <body className="font-sans">
        <SkipLink />

        {/* Organization JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />

        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TMTM3S3"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        <div id="main-content">
          {children}
        </div>

        <BackToTop />
        <MobilePhoneCTA />
      </body>
    </html>
  )
}
// Poke for Vercel deployment trigger
