import Link from 'next/link'
import Image from 'next/image'
import { getServicesForFooter } from '@/lib/services-data'

const navigationLinks = [
  { name: 'Home', href: '/' },
  { name: 'FAQ', href: '/frequently-asked-questions' },
  { name: 'Membership', href: '/membership' },
  { name: 'Financing', href: '/financing' },
  { name: 'Blog', href: '/blog' },
  { name: 'Service Area', href: '/service-area' },
]

// Get curated services list for footer
const footerServices = getServicesForFooter()

const companyLinks = [
  { name: 'Our History', href: '/about-us' },
  { name: 'Meet the Team', href: '/meet-team' },
  { name: 'Our Guarantees', href: '/our-guarantees' },
  { name: 'Contact Us', href: '/contact' },
  { name: 'Careers', href: '/careers' },
  { name: 'Customer Portal', href: 'https://brandenburgplumbing.myservicetitan.com/login' },
]

export function Footer() {
  return (
    <footer className="bg-footer-bg border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        {/* Logo and Address */}
        <div className="mb-12">
          <div className="mb-5">
            <Image
              src="/images/Brandenburg Logo_Dark_Red Mark-01.png"
              alt="Brandenburg Plumbing"
              width={160}
              height={38}
              className="h-9 w-auto"
            />
          </div>
          <address className="not-italic text-sm space-y-1.5">
            <p className="font-semibold text-text-primary tracking-wide text-xs uppercase">320 North Ridge Rd.</p>
            <p className="font-semibold text-text-primary tracking-wide text-xs uppercase">Bldg. 2 Unit B</p>
            <p className="font-semibold text-text-primary tracking-wide text-xs uppercase">Marble Falls, TX 78654</p>
          </address>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 lg:gap-16 mb-12">
          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-5">
              Navigation
            </h3>
            <ul className="space-y-3.5">
              {navigationLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="inline-block text-text-primary hover:text-brand-blue hover:translate-x-1 transition-all duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-5">
              Services
            </h3>
            <ul className="space-y-3.5">
              {footerServices.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/service/${service.slug}`}
                    className="inline-block text-text-primary hover:text-brand-blue hover:translate-x-1 transition-all duration-200"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-5">
              Company
            </h3>
            <ul className="space-y-3.5">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="inline-block text-text-primary hover:text-brand-blue hover:translate-x-1 transition-all duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex justify-end gap-2 mb-10">
          <Link
            href="https://facebook.com/brandenburgplumbing"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 text-text-muted hover:text-brand-blue hover:bg-white rounded-lg transition-all duration-200"
            aria-label="Facebook"
          >
            <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </Link>
          <Link
            href="https://instagram.com/brandenburgplumbing"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 text-text-muted hover:text-brand-blue hover:bg-white rounded-lg transition-all duration-200"
            aria-label="Instagram"
          >
            <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </Link>
          <Link
            href="https://youtube.com/@brandenburgplumbing"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 text-text-muted hover:text-brand-blue hover:bg-white rounded-lg transition-all duration-200"
            aria-label="YouTube"
          >
            <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </Link>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-8">
          {/* Legal Text */}
          <p className="text-center text-sm text-text-muted leading-relaxed">
            © Brandenburg Plumbing. RMP Lucas Brandenburg RMP-42793. LP Gas 10829. Texas State Board of Plumbing Examiners. 7915 Cameron Road, Austin, TX 78754. (800) 845-6584. www.tsbpe.gov
          </p>
        </div>
      </div>
    </footer>
  )
}
