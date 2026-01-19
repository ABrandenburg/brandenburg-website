import { Metadata } from 'next'
import { BlogListing } from '@/components/blog-listing'
import { BlogCTA } from '@/components/blog-cta'
import { Breadcrumb } from '@/components/breadcrumb'
import { getAllPosts, getAllCategories } from '@/lib/blog-data'

export const metadata: Metadata = {
  title: 'Plumbing Tips & Advice | Brandenburg Plumbing Blog',
  description: 'Expert plumbing tips, advice, and insights from Brandenburg Plumbing. Learn how to maintain your plumbing system, save money, and when to call a professional.',
  alternates: {
    canonical: 'https://www.brandenburgplumbing.com/blog',
  },
  openGraph: {
    title: 'Plumbing Tips & Advice | Brandenburg Plumbing Blog',
    description: 'Expert plumbing tips, advice, and insights from Brandenburg Plumbing. Learn how to maintain your plumbing system.',
    type: 'website',
    url: 'https://www.brandenburgplumbing.com/blog',
    images: ['/images/plumber-customer.jpg'],
  },
}

export default function BlogPage() {
  const posts = getAllPosts()
  const categories = getAllCategories()

  return (
    <>
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gray-50 to-white pt-8 pb-16 lg:pt-12 lg:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumb items={[{ label: 'Blog' }]} />
            {/* Title */}
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
                Advice from the Experts
              </h1>
              <p className="text-lg text-text-muted">
                Helpful tips, expert insights, and the latest news from your trusted local plumbers.
              </p>
            </div>

            {/* Blog Listing with Filters */}
            <BlogListing posts={posts} categories={categories} />
          </div>
        </section>

        {/* CTA Section */}
        <BlogCTA />
      </main>
    </>
  )
}
