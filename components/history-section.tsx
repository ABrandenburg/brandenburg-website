import Image from 'next/image'
import { HistorySection as HistorySectionType } from '@/lib/history-data'

interface HistorySectionProps {
  section: HistorySectionType
}

export function HistorySection({ section }: HistorySectionProps) {
  const isImageLeft = section.imagePosition === 'left'

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ${isImageLeft ? '' : 'lg:flex-row-reverse'
          }`}>
          {/* Image */}
          <div className={`${isImageLeft ? 'lg:order-1' : 'lg:order-2'}`}>
            <div className="relative rounded-lg overflow-hidden">
              <Image
                src={section.image}
                alt={section.imageAlt}
                width={0}
                height={0}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Content */}
          <div className={`${isImageLeft ? 'lg:order-2' : 'lg:order-1'}`}>
            {section.era && (
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
                {section.era}
              </p>
            )}
            <h2 className="text-3xl md:text-4xl font-serif text-text-primary mb-6">
              {section.title}
            </h2>
            <p className="text-text-muted leading-relaxed">
              {section.content}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
