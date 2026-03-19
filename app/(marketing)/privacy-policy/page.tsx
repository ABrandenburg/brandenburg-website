import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Brandenburg Plumbing',
  description: 'Brandenburg Plumbing privacy policy. Learn how we collect, use, and protect your personal information.',
  alternates: {
    canonical: 'https://www.brandenburgplumbing.com/privacy-policy',
  },
  openGraph: {
    title: 'Privacy Policy | Brandenburg Plumbing',
    description: 'Learn how Brandenburg Plumbing collects, uses, and protects your personal information.',
    type: 'website',
    url: 'https://www.brandenburgplumbing.com/privacy-policy',
  },
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <main className="bg-white">
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-serif text-text-primary mb-8">
              Privacy Policy
            </h1>
            
            <div className="prose prose-lg max-w-none text-text-primary">
              <p className="text-lg text-text-muted mb-8">
                Last updated: March 2026
              </p>

              <h2 className="text-2xl font-serif mt-8 mb-4">Information We Collect</h2>
              <p>
                Brandenburg Plumbing collects information you provide directly to us, such as when you 
                request a service, fill out a form, or contact us. This may include your name, email 
                address, phone number, address, and details about your plumbing needs.
              </p>

              <h2 className="text-2xl font-serif mt-8 mb-4">How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve our plumbing services</li>
                <li>Process and complete transactions</li>
                <li>Send you technical notices, updates, and support messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Communicate with you about services, offers, and promotions</li>
              </ul>

              <h2 className="text-2xl font-serif mt-8 mb-4">SMS / Text Message Communications</h2>
              <p>
                When you provide your phone number in connection with a service request, appointment,
                estimate, or completed job, we may use it to send you text messages related to your
                service. These messages may include:
              </p>
              <ul>
                <li>Responses to service requests submitted through third-party platforms (Angi, Thumbtack, Google Local Services)</li>
                <li>Estimate follow-ups and appointment confirmations</li>
                <li>Service status updates and notifications</li>
                <li>Post-service review requests</li>
                <li>Membership and maintenance reminders</li>
              </ul>
              <p>
                With your prior express written consent, we may also send marketing or promotional
                text messages about special offers, seasonal promotions, and new services. Marketing
                messages will not exceed 8 messages per month.
              </p>
              <p>
                You may opt out of text messages at any time by replying <strong>STOP</strong> to
                any message. After opting out, you will receive a one-time confirmation and will no
                longer receive text messages from us. You may opt back in by
                replying <strong>START</strong> or by contacting us directly.
              </p>
              <p>
                Your phone number and opt-in data will not be sold, rented, or shared with third
                parties for their marketing purposes. We use trusted third-party service providers
                (such as Twilio) to deliver text messages on our behalf, and these providers are
                contractually required to protect your information. Message and data rates may apply.
                For full details on message frequency, carrier liability, and your rights, see
                Section 10 of our{' '}
                <a href="/terms-of-service" className="text-brand-blue underline">Terms of Service</a>.
              </p>

              <h2 className="text-2xl font-serif mt-8 mb-4">Information Sharing</h2>
              <p>
                We do not sell, trade, or otherwise transfer your personal information to outside parties 
                except to trusted third parties who assist us in operating our website, conducting our 
                business, or servicing you, as long as those parties agree to keep this information confidential.
              </p>

              <h2 className="text-2xl font-serif mt-8 mb-4">Data Security</h2>
              <p>
                We implement a variety of security measures to maintain the safety of your personal 
                information. Your personal information is contained behind secured networks and is only 
                accessible by a limited number of persons who have special access rights.
              </p>

              <h2 className="text-2xl font-serif mt-8 mb-4">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
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
