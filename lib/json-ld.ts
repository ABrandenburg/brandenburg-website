import { Service } from './services-data'
import { Location } from './locations-data'
import { JobListing } from './jobs-data'

const hvacSlugs = ['ac-repair', 'ac-installation', 'heating-repair', 'heating-installation', 'ductwork', 'heat-pumps']

export function generateServiceSchema(service: Service) {
    const providerType = hvacSlugs.includes(service.slug) ? 'HVACBusiness' : 'PlumbingService'
    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.name,
        description: service.metaDesc,
        provider: {
            '@type': providerType,
            name: 'Brandenburg Plumbing',
            image: 'https://www.brandenburgplumbing.com/images/Brandenburg Logo_Dark_Red Mark-01.png',
            telephone: '+1-512-756-9847',
            priceRange: '$$',
        },
        areaServed: {
            '@type': 'Place',
            name: 'Highland Lakes & North Austin',
        },
        url: `https://www.brandenburgplumbing.com/service/${service.slug}`,
        image: `https://www.brandenburgplumbing.com${service.image}`,
    }
}

export function generateLocationSchema(location: Location) {
    const imageUrl = location.locationImage
        ? (location.locationImage.startsWith('http') ? location.locationImage : `https://www.brandenburgplumbing.com${location.locationImage}`)
        : 'https://www.brandenburgplumbing.com/images/service-trucks.jpg'

    return {
        '@context': 'https://schema.org',
        '@type': 'HomeAndConstructionBusiness',
        name: `Brandenburg Plumbing - ${location.name}`,
        description: location.metaDesc,
        url: `https://www.brandenburgplumbing.com/location/${location.slug}`,
        telephone: '+1-512-756-9847',
        image: imageUrl,
        areaServed: {
            '@type': 'City',
            name: location.name,
            address: {
                '@type': 'PostalAddress',
                addressRegion: 'TX',
                addressCountry: 'US',
            },
        },
        priceRange: '$$',
        parentOrganization: {
            '@type': 'HomeAndConstructionBusiness',
            name: 'Brandenburg Plumbing',
            url: 'https://www.brandenburgplumbing.com',
        },
    }
}

export function generateBreadcrumbSchema(items: { name: string; item: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.item.startsWith('http') ? item.item : `https://www.brandenburgplumbing.com${item.item}`,
        })),
    }
}

export function generateJobPostingSchema(job: JobListing) {
    return {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: job.title,
        description: job.description,
        datePosted: job.datePosted,
        ...(job.validThrough && { validThrough: job.validThrough }),
        employmentType: job.employmentType,
        hiringOrganization: {
            '@type': 'Organization',
            name: 'Brandenburg Plumbing',
            sameAs: 'https://www.brandenburgplumbing.com',
            logo: 'https://www.brandenburgplumbing.com/images/Brandenburg%20Logo_Dark_Red%20Mark-01.png',
        },
        jobLocation: {
            '@type': 'Place',
            address: {
                '@type': 'PostalAddress',
                streetAddress: '320 North Ridge Road',
                addressLocality: 'Marble Falls',
                addressRegion: 'TX',
                postalCode: '78654',
                addressCountry: 'US',
            },
        },
        baseSalary: {
            '@type': 'MonetaryAmount',
            currency: 'USD',
            value: {
                '@type': 'QuantitativeValue',
                minValue: job.salaryRange.min,
                maxValue: job.salaryRange.max,
                unitText: job.salaryRange.unit,
            },
        },
        responsibilities: job.responsibilities.join('. '),
        qualifications: job.qualifications.join('. '),
        experienceRequirements: job.experienceRequirements,
        directApply: true,
        applicantLocationRequirements: {
            '@type': 'Country',
            name: 'United States',
        },
    }
}
