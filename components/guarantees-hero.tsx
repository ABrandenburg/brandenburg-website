import Image from 'next/image'

const heroImages = [
  {
    src: '/images/water_heater.jpg',
    alt: 'Brandenburg plumber working on a water heater',
  },
  {
    src: '/images/guarantee-1.jpg',
    alt: 'Brandenburg plumber speaking with a customer',
  },
  {
    src: '/images/home-hero-team.jpg',
    alt: 'Brandenburg Plumbing team photo',
  },
]

export function GuaranteesHero() {
  return (
    <section className="bg-[#E8E4DF] py-16 md:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title and Subtitle */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-text-primary mb-6">
            Our Promises To You
          </h1>
          <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto">
            We do the best work, with the best technicians, and we are happy to guarantee it.
          </p>
        </div>

        {/* Three Photos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-soft-md"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
