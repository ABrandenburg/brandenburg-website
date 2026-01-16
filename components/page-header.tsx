import { Breadcrumb } from '@/components/breadcrumb'
import Image from 'next/image'

interface PageHeaderProps {
    title: string
    breadcrumb: Array<{ label: string; href?: string }>
    description?: string
    theme?: 'light' | 'dark'
    imageSrc?: string
    imageAlt?: string
    ctaText?: string
    ctaLink?: string
}

export function PageHeader({
    title,
    breadcrumb,
    description,
    theme = 'light',
    imageSrc,
    imageAlt = 'Header image',
    ctaText,
    ctaLink
}: PageHeaderProps) {
    return (
        <div className={`relative w-full overflow-hidden ${theme === 'dark' ? 'bg-brand-blue' : 'bg-gray-50'
            }`}>
            {/* Right Graphic Side (Full Bleed) */}
            <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block overflow-hidden">
                {imageSrc ? (
                    <div className="relative w-full h-full">
                        <Image
                            src={imageSrc}
                            alt={imageAlt}
                            fill
                            className="object-cover"
                            sizes="50vw"
                            priority
                        />
                        {/* Overlay to ensure text readability if needed, or just style matching */}
                        <div className="absolute inset-0 bg-black/10" />
                    </div>
                ) : (
                    <>
                        {/* Abstract Water Pattern Background */}
                        <div className={`absolute inset-0 opacity-10 ${theme === 'dark' ? 'bg-white' : 'bg-brand-blue'
                            }`}>
                            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                                        <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="currentColor" strokeWidth="1" fill="none" />
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                            </svg>
                        </div>

                        {/* Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-r from-transparent to-black/5`} />

                        {/* Decorative Circle/Shape */}
                        <div className={`absolute -right-20 -bottom-40 w-96 h-96 rounded-full blur-3xl opacity-20 ${theme === 'dark' ? 'bg-white' : 'bg-brand-blue'
                            }`} />
                    </>
                )}
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[250px]">
                    {/* Left Content Side */}
                    <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                        <div className="mb-6">
                            <Breadcrumb items={breadcrumb} />
                        </div>

                        <h1 className={`text-4xl md:text-5xl font-serif leading-tight mb-4 ${theme === 'dark' ? 'text-white' : 'text-text-primary'
                            }`}>
                            {title}
                        </h1>

                        {description && (
                            <p className={`text-lg max-w-xl ${theme === 'dark' ? 'text-gray-300' : 'text-text-muted'
                                }`}>
                                {description}
                            </p>
                        )}

                        {ctaText && ctaLink && (
                            <div className="mt-8">
                                <a
                                    href={ctaLink}
                                    className="btn-primary inline-flex items-center"
                                >
                                    {ctaText}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
