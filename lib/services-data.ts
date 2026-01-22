// Service data parsed from Brandenburg Plumbing - Services (2).csv

export interface Service {
  name: string
  slug: string
  servicesHeader: string
  metaTitle: string
  metaDesc: string
  trustHeader: string
  locationBlurb: string
  serviceSubheading: string
  faqHeader: string
  faqIds: string[]
  image: string
  icon: string
  videos?: string[] // Array of YouTube video URLs
}

// Map slugs to images in public/images
const serviceImages: Record<string, string> = {
  'bathroom': '/images/bathroom.jpg',
  'clogged-pipes': '/images/drain_cleaning.jpg',
  'commercial': '/images/commercial.png',
  'emergency': '/images/plumber-customer.jpg',
  'kitchen': '/images/kitchen.jpg',
  'toilets': '/images/toilet.jpg',
  'water-filtration': '/images/water-softeners.jpg',
  'water-heaters': '/images/water_heater.jpg',
  'water-softeners': '/images/water-softeners.jpg',
  'water-drain-lines': '/images/service-trucks.jpg',
}

// Map slugs to icon types (used in header)
const serviceIcons: Record<string, string> = {
  'bathroom': 'bathroom',
  'clogged-pipes': 'drain',
  'commercial': 'commercial',
  'emergency': 'emergency',
  'kitchen': 'kitchen',
  'toilets': 'toilet',
  'water-filtration': 'filter',
  'water-heaters': 'heater',
  'water-softeners': 'softener',
  'water-drain-lines': 'pipes',
}

export const services: Service[] = [
  {
    name: "Bathroom Plumbing",
    slug: "bathroom",
    servicesHeader: "Expert Bathroom Plumbing Service You Can Trust",
    metaTitle: "Bathroom Plumbing | Brandenburg Plumbing",
    metaDesc: "Expert bathroom plumbing services — from faucet repairs to full remodels. Serving your home with reliable care.",
    trustHeader: "Why Homeowners Trust Us for Bathroom Plumbing",
    locationBlurb: "Providing best-in-class Bathroom Plumbing Services in the Highland Lakes & North Austin",
    serviceSubheading: "Our complete bathroom services include faucet repair, sink and tub plumbing, and hidden leak detection. Trust our expertise for everything from a simple fix to full bathroom remodel plumbing.",
    faqHeader: "Common Questions About Bathroom Plumbing",
    faqIds: ["baq1", "baq2", "baq3", "baq4", "baq5"],
    image: serviceImages['bathroom'],
    icon: serviceIcons['bathroom'],
  },
  {
    name: "Clogged Pipes and Drain Cleaning",
    slug: "clogged-pipes",
    servicesHeader: "Expert Clogged Pipes and Drain Cleaning Service You Can Trust",
    metaTitle: "Drain Cleaning & Clogged Pipes | Brandenburg Plumbing",
    metaDesc: "Fast, effective drain cleaning and clogged pipe repairs. We clear blockages and keep your plumbing flowing.",
    trustHeader: "Why Homeowners Trust Us for Clogged Pipes and Drain Cleaning",
    locationBlurb: "Providing best-in-class Clogged Pipes and Drain Cleaning Services in the Highland Lakes & North Austin",
    serviceSubheading: "We clear any clog, from kitchen sinks to main sewer lines. Using advanced hydro jetting and video camera inspections, we diagnose and solve the toughest blockages quickly and effectively.",
    faqHeader: "Common Questions About Clogged Pipes and Drain Cleaning",
    faqIds: ["dcq1", "dcq2", "dcq4", "dcq5", "dcq3", "dcq6"],
    image: serviceImages['clogged-pipes'],
    icon: serviceIcons['clogged-pipes'],
  },
  {
    name: "Commercial Services",
    slug: "commercial",
    servicesHeader: "Expert Commercial Plumbing Service You Can Trust",
    metaTitle: "Commercial Plumbing | Brandenburg Plumbing",
    metaDesc: "Licensed commercial plumbers for offices, restaurants, and facilities. Trusted solutions that keep your business running.",
    trustHeader: "Why Companies Trust Us for Commercial Plumbing",
    locationBlurb: "Providing best-in-class Commercial Plumbing Services in the Highland Lakes & North Austin",
    serviceSubheading: "Commercial plumbing requires proper licensing, fast response times, fully stocked trucks, and regular maintenance. We do it all, and would love to chat with you about setting up a custom service agreement.",
    faqHeader: "Common Questions About Commercial Service",
    faqIds: ["cmq1", "cmq2", "cmq3", "cmq4", "cmq5", "cmq6", "cmq7"],
    image: serviceImages['commercial'],
    icon: serviceIcons['commercial'],
  },
  {
    name: "Emergency Services",
    slug: "emergency",
    servicesHeader: "Expert Emergency Service You Can Trust",
    metaTitle: "Emergency Plumbing | Brandenburg Plumbing",
    metaDesc: "24/7 emergency plumbing services for leaks, clogs, and more. Rapid response to protect your home from damage.",
    trustHeader: "Why Homeowners Trust Us for Emergency Plumbing",
    locationBlurb: "Providing best-in-class Emergency Plumbing Services in the Highland Lakes & North Austin",
    serviceSubheading: "From emergency leaks, clogs, and hot water issues, we are your emergency plumbing experts. We provide 24/7 service, because your plumbing emergencies don't follow a schedule.",
    faqHeader: "Common Questions About Emergency Service",
    faqIds: ["emq1", "emq2", "emq3", "emq4", "emq5", "emq6"],
    image: serviceImages['emergency'],
    icon: serviceIcons['emergency'],
  },
  {
    name: "Kitchen Plumbing",
    slug: "kitchen",
    servicesHeader: "Expert Kitchen Plumbing Service You Can Trust",
    metaTitle: "Kitchen Plumbing | Brandenburg Plumbing",
    metaDesc: "Full-service kitchen plumbing — sink, faucet, dishwasher, and pipe repairs from trusted local pros.",
    trustHeader: "Why Homeowners Trust Us for Kitchen Plumbing",
    locationBlurb: "Providing best-in-class Kitchen Plumbing Services in the Highland Lakes & North Austin",
    serviceSubheading: "We are your kitchen plumbing specialists, handling leaky faucets, garbage disposal repair, and dishwasher line installation. We ensure all your kitchen fixtures and appliances work flawlessly.",
    faqHeader: "Common Questions About Kitchen Plumbing",
    faqIds: ["kiq1", "kiq2", "kiq4", "kiq3", "kiq5"],
    image: serviceImages['kitchen'],
    icon: serviceIcons['kitchen'],
  },
  {
    name: "Toilets",
    slug: "toilets",
    servicesHeader: "Expert Toilets Service You Can Trust",
    metaTitle: "Toilet Repair & Installation | Brandenburg Plumbing",
    metaDesc: "Fast toilet repairs, replacements, and installations in Burnet County. Fix clogs, leaks, and running toilets. Same-day service available.",
    trustHeader: "Why Homeowners Trust Us for Toilets",
    locationBlurb: "Providing best-in-class Toilets Services in the Highland Lakes & North Austin",
    serviceSubheading: "We provide fast repairs for all toilet problems, including clogs, leaks, and constant running. We also offer expert installation and replacement, upgrading you to modern, high-efficiency models.",
    faqHeader: "Common Questions About Toilets",
    faqIds: ["toq1", "toq2", "toq3", "toq4", "toq5"],
    image: serviceImages['toilets'],
    icon: serviceIcons['toilets'],
    videos: [
      "https://youtu.be/_etVq76uBfc"
    ],
  },
  {
    name: "Water Filtration",
    slug: "water-filtration",
    servicesHeader: "Expert Water Filtration Service You Can Trust",
    metaTitle: "Water Filtration Systems | Brandenburg Plumbing",
    metaDesc: "Enjoy cleaner, better-tasting water with whole-house filtration, reverse osmosis, and under-sink filters. Expert installation in Highland Lakes area.",
    trustHeader: "Why Homeowners Trust Us for Water Filtration",
    locationBlurb: "Providing best-in-class Water Filtration Services in the Highland Lakes & North Austin",
    serviceSubheading: "Enjoy cleaner, better-tasting water with our expert filtration services. We install and maintain a full range of solutions, including whole-house systems, reverse osmosis (RO), and under-sink filters.",
    faqHeader: "Common Questions About Water Filtration",
    faqIds: ["wtq1", "wtq3", "wtq2", "wtq9", "wtq8", "wtq7", "wtq6", "wtq5", "wtq4"],
    image: serviceImages['water-filtration'],
    icon: serviceIcons['water-filtration'],
  },
  {
    name: "Water Heaters",
    slug: "water-heaters",
    servicesHeader: "Expert Water Heater Installation, Repairs and Servicing",
    metaTitle: "Water Heater Repair & Installation | Brandenburg Plumbing",
    metaDesc: "Tank and tankless water heater repair, installation, and replacement. Emergency service available 24/7. Serving Burnet County since 1997.",
    trustHeader: "Why Homeowners Trust Us for Water Heaters",
    locationBlurb: "Providing best-in-class Water Heaters Services in the Highland Lakes & North Austin",
    serviceSubheading: "From emergency repairs to new installations, we are your water heater experts. We service and install all models, including traditional tank and modern tankless systems, ensuring you have reliable hot water.",
    faqHeader: "Common Questions About Water Heaters",
    faqIds: ["whq1", "whq10", "whq2", "whq3", "whq4", "whq5", "whq6", "whq7", "whq8", "whq9"],
    image: serviceImages['water-heaters'],
    icon: serviceIcons['water-heaters'],
    videos: [
      "https://youtu.be/8zDHDAnU6lA",
      "https://youtu.be/JyEJghBbHWE"
    ],
  },
  {
    name: "Water Softeners",
    slug: "water-softeners",
    servicesHeader: "Expert Water Softener Installation, Repairs and Servicing",
    metaTitle: "Water Softener Installation & Repair | Brandenburg Plumbing",
    metaDesc: "Combat hard water damage with professional water softener installation. Protect your pipes and appliances from mineral buildup. Free water testing available.",
    trustHeader: "Why Homeowners Trust Us for Water Softeners",
    locationBlurb: "Providing best-in-class Water Softeners Services in the Highland Lakes & North Austin",
    serviceSubheading: "Eliminate hard water damage with our complete water softener services. We offer professional installation, repair, and maintenance of whole-house systems to protect your home's pipes and appliances.",
    faqHeader: "Common Questions About Water Softeners",
    faqIds: ["wtq1", "wtq2", "wtq3", "wtq4", "wtq5", "wtq6", "wtq7", "wtq8", "wtq9"],
    image: serviceImages['water-softeners'],
    icon: serviceIcons['water-softeners'],
    videos: [
      "https://youtu.be/DxPBq2Un1jU",
      "https://youtu.be/j8e67MojkHA",
      "https://youtu.be/ONVhCJENxTY"
    ],
  },
  {
    name: "Water and Sewer Lines",
    slug: "water-drain-lines",
    servicesHeader: "Expert Water and Sewer Lines Service You Can Trust",
    metaTitle: "Water & Sewer Line Repair | Brandenburg Plumbing",
    metaDesc: "Main water and sewer line repair and replacement using video inspection and trenchless technology. Minimal yard disruption. Licensed and insured.",
    trustHeader: "Why Homeowners Trust Us for Water and Sewer Lines",
    locationBlurb: "Providing best-in-class Water and Sewer Lines Services in the Highland Lakes & North Austin",
    serviceSubheading: "We provide expert repair and replacement for your critical main water and sewer lines. Using video inspection and trenchless technology, we offer accurate, minimally invasive solutions.",
    faqHeader: "Common Questions About Water and Sewer Lines",
    faqIds: ["prq1", "prq2", "prq3", "prq4", "prq5"],
    image: serviceImages['water-drain-lines'],
    icon: serviceIcons['water-drain-lines'],
  },
]

// Get all services
export function getAllServices(): Service[] {
  return services
}

// Get a service by its slug
export function getServiceBySlug(slug: string): Service | undefined {
  return services.find(service => service.slug === slug)
}

// Get all service slugs for static generation
export function getAllServiceSlugs(): string[] {
  return services.map(service => service.slug)
}

// Get services for navigation (split into two columns)
export function getServicesForNav(): { left: Service[], right: Service[] } {
  const midpoint = Math.ceil(services.length / 2)
  return {
    left: services.slice(0, midpoint),
    right: services.slice(midpoint),
  }
}

// Get services for footer (curated list)
export function getServicesForFooter(): Service[] {
  const footerSlugs = [
    'clogged-pipes',
    'water-heaters',
    'water-softeners',
    'kitchen',
    'bathroom',
    'water-drain-lines',
  ]
  return footerSlugs.map(slug => getServiceBySlug(slug)).filter((s): s is Service => s !== undefined)
}
