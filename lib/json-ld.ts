import { Service } from './services-data'
import { Location } from './locations-data'

export function generateServiceSchema(service: Service) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.name,
        description: service.metaDesc,
        provider: {
            '@type': 'PlumbingService',
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
        '@type': 'PlumbingService',
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
            '@type': 'PlumbingService',
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
