import Image from 'next/image'

const brands = [
  { name: 'Rheem', logo: '/images/brands/rheem-logo.png', width: 100 },
  { name: 'Kohler', logo: '/images/brands/Kohler-Logo.svg', width: 120 },
  { name: 'Moen', logo: '/images/brands/moen.png', width: 100 },
  { name: 'Delta', logo: '/images/brands/delta.png', width: 100 },
  { name: 'Rinnai', logo: '/images/brands/rinnai.png', width: 100 },
  { name: 'TOTO', logo: '/images/brands/toto.jpg', width: 80 },
  { name: 'Sloan', logo: '/images/brands/sloan.png', width: 100 },
]

export function BrandLogos() {
  return (
    <section className="py-12 lg:py-16 bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-sm text-text-muted font-medium uppercase tracking-wider">
            We Install & Service Top Brands
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="opacity-60 hover:opacity-100 transition-opacity duration-300"
            >
              <Image
                src={brand.logo}
                alt={brand.name}
                width={brand.width}
                height={50}
                className="h-10 md:h-12 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
