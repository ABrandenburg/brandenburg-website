"use client"

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react'
import Fuse from 'fuse.js'
import { BlogCard } from '@/components/blog-card'
import type { BlogPost } from '@/lib/blog-data'

const POSTS_PER_PAGE = 9

interface BlogListingProps {
  posts: BlogPost[]
  categories: string[]
}

export function BlogListing({ posts, categories }: BlogListingProps) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(() => new Fuse(posts, {
    keys: [
      { name: 'title', weight: 0.4 },
      { name: 'summary', weight: 0.3 },
      { name: 'body', weight: 0.2 },
      { name: 'categoryDisplay', weight: 0.1 },
    ],
    threshold: 0.4, // Lower = more strict, Higher = more fuzzy
    ignoreLocation: true,
    minMatchCharLength: 2,
  }), [posts])

  // Filter posts by search and category
  const filteredPosts = useMemo(() => {
    let results = posts

    // Apply fuzzy search if there's a query
    if (searchQuery.trim()) {
      const searchResults = fuse.search(searchQuery)
      results = searchResults.map(result => result.item)
    }

    // Apply category filter
    if (activeCategory !== 'All') {
      results = results.filter(post => post.categoryDisplay === activeCategory)
    }

    return results
  }, [posts, searchQuery, activeCategory, fuse])

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE
    return filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE)
  }, [filteredPosts, currentPage])

  // Reset to page 1 when filters change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
    setCurrentPage(1)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  // Clear search
  const clearSearch = () => {
    setSearchQuery('')
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="max-w-xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-12 py-3 rounded-full border border-gray-200 bg-white text-text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              activeCategory === category
                ? 'bg-brand-blue text-white shadow-md'
                : 'bg-gray-100 text-text-primary hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Results Count */}
      {searchQuery && (
        <p className="text-center text-text-muted mb-6">
          Found {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
          {activeCategory !== 'All' && ` in ${activeCategory}`}
        </p>
      )}

      {/* Posts Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeCategory}-${searchQuery}-${currentPage}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {paginatedPosts.map((post, index) => (
            <BlogCard
              key={post.slug}
              post={post}
              index={index}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* No Results */}
      {filteredPosts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <p className="text-text-muted text-lg mb-2">
            No articles found{searchQuery && ` for "${searchQuery}"`}
            {activeCategory !== 'All' && ` in ${activeCategory}`}.
          </p>
          {(searchQuery || activeCategory !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setActiveCategory('All')
                setCurrentPage(1)
              }}
              className="text-brand-blue font-medium hover:underline"
            >
              Clear filters
            </button>
          )}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 text-text-primary hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-brand-blue text-white'
                    : 'text-text-primary hover:bg-gray-100'
                }`}
                aria-label={`Go to page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 text-text-primary hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page info */}
      {filteredPosts.length > POSTS_PER_PAGE && (
        <p className="text-center text-text-muted text-sm mt-4">
          Showing {((currentPage - 1) * POSTS_PER_PAGE) + 1}-{Math.min(currentPage * POSTS_PER_PAGE, filteredPosts.length)} of {filteredPosts.length} articles
        </p>
      )}
    </div>
  )
}
