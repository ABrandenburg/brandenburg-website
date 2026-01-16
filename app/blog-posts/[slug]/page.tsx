import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BlogCard } from '@/components/blog-card'
import { BlogCTA } from '@/components/blog-cta'
import { BlogFeaturedImage } from '@/components/blog-featured-image'
import { 
  getPostBySlug, 
  getAllPostSlugs, 
  getRelatedPosts,
  formatDate 
} from '@/lib/blog-data'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({
    slug,
  }))
}

// Generate metadata for each blog post
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const publishedDate = new Date(post.publishedOn).toISOString()

  return {
    title: post.displayTitle || `${post.title} | Brandenburg Plumbing`,
    description: post.metaDescription || post.summary,
    alternates: {
      canonical: `https://www.brandenburgplumbing.com/blog-posts/${slug}`,
    },
    openGraph: {
      title: post.displayTitle || post.title,
      description: post.metaDescription || post.summary,
      type: 'article',
      url: `https://www.brandenburgplumbing.com/blog-posts/${slug}`,
      publishedTime: publishedDate,
      authors: ['Brandenburg Plumbing'],
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: `${post.title} - Brandenburg Plumbing Blog`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.displayTitle || post.title,
      description: post.metaDescription || post.summary,
      images: [post.image],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  // Get related posts
  const relatedPosts = getRelatedPosts(slug, 3)

  return (
    <>
      <main>
        <article className="bg-white">
          {/* Hero Section */}
          <section className="pt-8 pb-8 lg:pt-12 lg:pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Breadcrumb */}
              <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/blog" className="hover:text-brand-blue transition-colors">
                  {post.categoryDisplay}
                </Link>
                <span>/</span>
                <span>Article</span>
                <span>/</span>
                <time dateTime={post.publishedOn} className="text-brand-blue font-medium">
                  {formatDate(post.publishedOn)}
                </time>
              </nav>

              {/* Title */}
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary leading-tight mb-8">
                {post.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted mb-8">
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {post.readingTime} min read
                </span>
              </div>

              {/* Featured Image */}
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-lg mb-12 bg-gray-100">
                <BlogFeaturedImage src={post.image} alt={`Featured image for article: ${post.title}`} />
              </div>
            </div>
          </section>

          {/* Article Content */}
          <section className="pb-16 lg:pb-24">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <div 
                className="prose prose-lg max-w-none
                  prose-headings:font-serif prose-headings:text-text-primary prose-headings:font-bold
                  prose-h4:text-2xl prose-h4:mt-10 prose-h4:mb-5
                  prose-p:text-text-primary prose-p:leading-relaxed prose-p:text-lg
                  prose-ul:my-6 prose-ul:pl-6 prose-ul:list-disc
                  prose-ol:my-6 prose-ol:pl-6
                  prose-li:text-text-primary prose-li:mb-3 prose-li:text-lg prose-li:leading-relaxed
                  prose-strong:text-text-primary prose-strong:font-semibold
                  prose-a:text-brand-blue prose-a:no-underline hover:prose-a:underline
                  prose-img:rounded-lg prose-img:shadow-md
                  [&_br]:mb-2
                "
                dangerouslySetInnerHTML={{ __html: post.body }}
              />
            </div>
          </section>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-16 lg:py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary text-center mb-12">
                Continue reading
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {relatedPosts.map((relatedPost, index) => (
                  <BlogCard
                    key={relatedPost.slug}
                    post={relatedPost}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <BlogCTA />
      </main>
    </>
  )
}
