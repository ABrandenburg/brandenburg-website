import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

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
      <Header />
      <main className="bg-white">
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-serif text-text-primary mb-8">
              Privacy Policy
            </h1>
            
            <div className="prose prose-lg max-w-none text-text-primary">
              <p className="text-lg text-text-muted mb-8">
                Last updated: January 2026
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
      <Footer />
    </>
  )
}
