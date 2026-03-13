import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getEmailSignatureBySlug, getAllEmailSignatureSlugs } from "@/lib/email-signature-data"
import { EmailSignatureDisplay } from "@/components/email-signature-display"

interface EmailSignaturePageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllEmailSignatureSlugs().map((slug) => ({
    slug,
  }))
}

export async function generateMetadata({ params }: EmailSignaturePageProps): Promise<Metadata> {
  const { slug } = await params
  const person = getEmailSignatureBySlug(slug)

  if (!person) {
    return { title: "Not Found" }
  }

  return {
    title: `Email Signature — ${person.name}`,
    robots: { index: false, follow: false },
  }
}

export default async function EmailSignaturePage({ params }: EmailSignaturePageProps) {
  const { slug } = await params
  const person = getEmailSignatureBySlug(slug)

  if (!person) {
    notFound()
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-6 text-2xl font-bold text-brand-blue">
        Email Signature — {person.name}
      </h1>

      <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-text-muted">
        <p className="mb-2 font-semibold text-text-primary">How to set up in Gmail:</p>
        <ol className="list-inside list-decimal space-y-1">
          <li>Click the <strong>Copy Signature</strong> button below.</li>
          <li>Open Gmail → Settings (gear icon) → <strong>See all settings</strong>.</li>
          <li>Scroll to the <strong>Signature</strong> section.</li>
          <li>Create a new signature or edit your existing one.</li>
          <li>Paste (<strong>Ctrl+V</strong> / <strong>Cmd+V</strong>) into the signature editor.</li>
          <li>Click <strong>Save Changes</strong> at the bottom of the page.</li>
        </ol>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <EmailSignatureDisplay person={person} />
      </div>
    </section>
  )
}
