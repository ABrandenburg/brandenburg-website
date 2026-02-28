import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | Brandenburg Plumbing',
  description: 'Terms of Service for Brandenburg Plumbing. Review the terms governing your use of our website, services, and communications.',
  alternates: {
    canonical: 'https://www.brandenburgplumbing.com/terms-of-service',
  },
  openGraph: {
    title: 'Terms of Service | Brandenburg Plumbing',
    description: 'Review the terms governing your use of the Brandenburg Plumbing website, services, and communications.',
    type: 'website',
    url: 'https://www.brandenburgplumbing.com/terms-of-service',
  },
}

export default function TermsOfServicePage() {
  return (
    <>
      <main className="bg-white">
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-serif text-text-primary mb-8">
              Terms of Service
            </h1>

            <div className="prose prose-lg max-w-none text-text-primary">
              <p className="text-lg text-text-muted mb-8">
                Last updated: February 2026
              </p>

              <p>
                Welcome to the Brandenburg Plumbing website (&ldquo;Site&rdquo;). These Terms of Service
                (&ldquo;Terms&rdquo;) govern your access to and use of the Site, our plumbing and HVAC services,
                and all related communications&mdash;including text messages&mdash;provided by Brandenburg Plumbing
                (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By accessing or using our
                Site or services, you agree to be bound by these Terms. If you do not agree, please do not use
                our Site or services.
              </p>

              {/* ── 1. Eligibility ── */}
              <h2 className="text-2xl font-serif mt-10 mb-4">1. Eligibility</h2>
              <p>
                You must be at least 18&nbsp;years old or the age of majority in your jurisdiction to use our
                Site or request services. By using our Site, you represent that you meet this requirement.
              </p>

              {/* ── 2. Services ── */}
              <h2 className="text-2xl font-serif mt-10 mb-4">2. Services Offered</h2>
              <p>
                Brandenburg Plumbing provides residential and commercial plumbing, HVAC, and LP gas services
                throughout the Texas Hill Country. Service descriptions, availability, and pricing displayed on
                the Site are for informational purposes and may change without notice. Final pricing and scope
                of work are confirmed at the time of service.
              </p>

              {/* ── 3. Online Scheduling & Service Requests ── */}
              <h2 className="text-2xl font-serif mt-10 mb-4">3. Online Scheduling &amp; Service Requests</h2>
              <p>
                Our Site may allow you to request appointments and submit service inquiries through integrated
                scheduling tools. Submitting a request does not guarantee an appointment. We will confirm
                availability and scheduling details via phone, email, or text message. All service requests are
                subject to our service area and technician availability.
              </p>

              {/* ── 4. Contact & Career Forms ── */}
              <h2 className="text-2xl font-serif mt-10 mb-4">4. Contact Forms &amp; Career Applications</h2>
              <p>
                Information you submit through our contact form or career application portal is used solely
                to respond to your inquiry or evaluate your application. By submitting a form, you consent to
                our collection and use of the information you provide in accordance with
                our <Link href="/privacy-policy" className="text-brand-blue underline">Privacy Policy</Link>.
              </p>

              {/* ── 5. Membership & Service Agreements ── */}
              <h2 className="text-2xl font-serif mt-10 mb-4">5. Membership &amp; Service Agreements</h2>
              <p>
                We offer membership and service agreement plans that provide recurring maintenance, priority
                scheduling, and other benefits. Specific terms, pricing, and cancellation policies for each
                plan are presented at the time of enrollment. Membership benefits are non-transferable and
                apply only to the enrolled property.
              </p>

              {/* ── 6. Financing ── */}
              <h2 className="text-2xl font-serif mt-10 mb-4">6. Financing</h2>
              <p>
                Financing options displayed on the Site are provided through third-party lenders and are
                subject to credit approval and lender terms. Brandenburg Plumbing is not a lender and makes no
                guarantees regarding financing approval, interest rates, or repayment terms. Please review the
                lender&rsquo;s terms and conditions before accepting any financing offer.
              </p>

              {/* ── 7. Promotions & Discounts ── */}
              <h2 className="text-2xl font-serif mt-10 mb-4">7. Promotions &amp; Discounts</h2>
              <p>
                From time to time we may offer promotions, coupons, or discounts. These are subject to
                specific terms and expiration dates stated at the time of the offer. Promotions cannot be
                combined unless explicitly stated, have no cash value, and may be modified or discontinued at
                our discretion.
              </p>

              {/* ── 8. Reviews & Testimonials ── */}
              <h2 className="text-2xl font-serif mt-10 mb-4">8. Reviews &amp; Testimonials</h2>
              <p>
                After service completion, you may receive a request to leave a review. Participation is
                entirely voluntary. Reviews submitted through third-party platforms are governed by those
                platforms&rsquo; own terms. We may display aggregated review data and testimonials on our Site.
              </p>

              {/* ── 9. User Accounts & Admin Access ── */}
              <h2 className="text-2xl font-serif mt-10 mb-4">9. User Accounts</h2>
              <p>
                Certain features, including the customer portal and administrative dashboard, require account
                credentials. You are responsible for maintaining the confidentiality of your login information
                and for all activity that occurs under your account. Notify us immediately if you suspect
                unauthorized access.
              </p>

              {/* ── 10. SMS / Text Messaging ── */}
              <h2 className="text-2xl font-serif mt-10 mb-4">10. SMS / Text Message Communications</h2>

              <h3 className="text-xl font-serif mt-6 mb-3">10.1 Transactional Messages</h3>
              <p>
                By providing your phone number in connection with a service request, appointment, or completed
                job, you consent to receive transactional text messages from Brandenburg Plumbing. These
                messages may include:
              </p>
              <ul>
                <li>Appointment confirmations, reminders, and updates</li>
                <li>Service status notifications</li>
                <li>Post-service review requests</li>
                <li>Invoice and payment notifications</li>
              </ul>
              <p>
                Transactional messages are sent to the phone number associated with your service record. Message
                frequency varies based on your service activity. You may opt out of transactional messages at
                any time by replying <strong>STOP</strong> to any message; however, opting out may limit our
                ability to communicate important service-related information to you.
              </p>

              <h3 className="text-xl font-serif mt-6 mb-3">10.2 Marketing Messages</h3>
              <p>
                With your prior express written consent, we may send you marketing or promotional text messages
                about special offers, discounts, seasonal promotions, new services, and company news. You are
                not required to consent to marketing messages as a condition of purchasing any goods or services.
              </p>
              <p>
                You may opt out of marketing messages at any time by replying <strong>STOP</strong> to any
                marketing message. After opting out, you will receive a one-time confirmation message and will
                no longer receive marketing texts. You may opt back in at any time by contacting us or
                replying <strong>START</strong>.
              </p>

              <h3 className="text-xl font-serif mt-6 mb-3">10.3 General SMS Terms</h3>
              <ul>
                <li>
                  <strong>Message &amp; data rates may apply.</strong> Standard messaging and data rates from
                  your wireless carrier apply to all text messages sent and received.
                </li>
                <li>
                  <strong>Carrier liability:</strong> We are not responsible for delayed or undelivered messages
                  due to carrier network issues.
                </li>
                <li>
                  <strong>Supported carriers:</strong> Major U.S. carriers are supported, but service may vary.
                </li>
                <li>
                  <strong>Help:</strong> Reply <strong>HELP</strong> to any message for assistance, or
                  contact us at (512)&nbsp;756-9847.
                </li>
                <li>
                  <strong>Frequency:</strong> Message frequency varies. Transactional messages are sent as
                  needed based on service activity. Marketing messages will not exceed 8&nbsp;messages per month.
                </li>
                <li>
                  <strong>Privacy:</strong> Your phone number and opt-in data will not be sold or shared with
                  third parties for their marketing purposes. See
                  our <Link href="/privacy-policy" className="text-brand-blue underline">Privacy Policy</Link> for
                  more details.
                </li>
              </ul>

              {/* ── 11. Intellectual Property ── */}
              <h2 className="text-2xl font-serif mt-10 mb-4">11. Intellectual Property</h2>
              <p>
                All content on this Site&mdash;including text, graphics, logos, images, photographs, videos,
                and software&mdash;is the property of Brandenburg Plumbing or its licensors and is protected by
                applicable copyright, trademark, and other intellectual property laws. You may not reproduce,
                distribute, modify, or create derivative works from any content without our prior written consent.
              </p>

              {/* ── 12. Prohibited Conduct ── */}
              <h2 className="text-2xl font-serif mt-10 mb-4">12. Prohibited Conduct</h2>
              <p>When using our Site, you agree not to:</p>
              <ul>
                <li>Violate any applicable law or regulation</li>
                <li>Submit false, misleading, or fraudulent information</li>
                <li>Interfere with or disrupt the Site or its servers</li>
                <li>Attempt to gain unauthorized access to any part of the Site</li>
                <li>Use the Site for any unlawful or unauthorized purpose</li>
                <li>Scrape, harvest, or collect data from the Site without permission</li>
              </ul>

              {/* ── 13. Third-Party Links & Integrations ── */}
              <h2 className="text-2xl font-serif mt-10 mb-4">13. Third-Party Links &amp; Services</h2>
              <p>
                Our Site may contain links to or integrations with third-party websites and services, including
                scheduling platforms, financing providers, review platforms, and social media. These third-party
                services have their own terms and privacy policies. We are not responsible for the content,
                practices, or availability of any third-party site or service.
              </p>

              {/* ── 14. Disclaimer of Warranties ── */}
              <h2 className="text-2xl font-serif mt-10 mb-4">14. Disclaimer of Warranties</h2>
              <p>
                THE SITE AND ALL CONTENT ARE PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT
                WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES
                OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT
                THAT THE SITE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
              </p>
              <p>
                Guarantees related to our plumbing and HVAC services are governed by the specific guarantee
                terms presented at the time of service and displayed on
                our <Link href="/our-guarantees" className="text-brand-blue underline">Guarantees</Link> page.
              </p>

              {/* ── 15. Limitation of Liability ── */}
              <h2 className="text-2xl font-serif mt-10 mb-4">15. Limitation of Liability</h2>
              <p>
                TO THE FULLEST EXTENT PERMITTED BY LAW, BRANDENBURG PLUMBING, ITS OWNERS, OFFICERS, EMPLOYEES,
                AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
                DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE SITE, OUR SERVICES, OR THESE TERMS. OUR
                TOTAL LIABILITY FOR ANY CLAIM SHALL NOT EXCEED THE AMOUNT YOU PAID TO US FOR THE SPECIFIC
                SERVICE GIVING RISE TO THE CLAIM.
              </p>

              {/* ── 16. Indemnification ── */}
              <h2 className="text-2xl font-serif mt-10 mb-4">16. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless Brandenburg Plumbing and its owners, officers,
                employees, and agents from and against any claims, liabilities, damages, losses, and expenses
                (including reasonable attorney&rsquo;s fees) arising out of your use of the Site or violation of
                these Terms.
              </p>

              {/* ── 17. Governing Law & Disputes ── */}
              <h2 className="text-2xl font-serif mt-10 mb-4">17. Governing Law &amp; Dispute Resolution</h2>
              <p>
                These Terms are governed by the laws of the State of Texas, without regard to conflict-of-law
                principles. Any dispute arising out of or relating to these Terms or our services shall be
                resolved in the state or federal courts located in Burnet County, Texas, and you consent to the
                personal jurisdiction of such courts.
              </p>

              {/* ── 18. Changes ── */}
              <h2 className="text-2xl font-serif mt-10 mb-4">18. Changes to These Terms</h2>
              <p>
                We may update these Terms from time to time. When we make changes, we will revise the
                &ldquo;Last updated&rdquo; date at the top of this page. Your continued use of the Site after
                any changes constitutes acceptance of the revised Terms. We encourage you to review this page
                periodically.
              </p>

              {/* ── 19. Severability ── */}
              <h2 className="text-2xl font-serif mt-10 mb-4">19. Severability</h2>
              <p>
                If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions
                shall continue in full force and effect.
              </p>

              {/* ── 20. Contact ── */}
              <h2 className="text-2xl font-serif mt-10 mb-4">20. Contact Us</h2>
              <p>
                If you have questions about these Terms of Service, please contact us at:
              </p>
              <p>
                Brandenburg Plumbing<br />
                320 North Ridge Rd., Bldg. 2 Unit B<br />
                Marble Falls, TX 78654<br />
                Phone: (512) 756-9847<br />
                Email: service@brandenburgplumbing.com
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
