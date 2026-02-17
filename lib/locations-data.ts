// Location data parsed from Brandenburg Plumbing - Locations (2).csv

export interface Location {
  name: string
  slug: string
  mainHeaderText: string
  locationImage?: string
  locationBlurb: string
  servicesHeader: string
  faqHeader: string
  trustHeader: string
  metaTitle: string
  metaDesc: string
}

export const locations: Location[] = [
  {
    name: "Burnet",
    slug: "burnet",
    mainHeaderText: "Burnet's Hometown Plumbing & HVAC Team - Headquartered Here Since 1997",
    locationBlurb: "As our hometown and headquarters since 1997, we know Burnet inside and out. From historic downtown homes to growing neighborhoods, we handle all your plumbing and HVAC needs with the care your neighbors deserve.",
    servicesHeader: "What We Do in Burnet, TX",
    faqHeader: "What Our Burnet Customers Are Asking",
    trustHeader: "Why Burnet Homeowners Choose Us",
    metaTitle: "The #1 Plumbing & HVAC Team in Burnet, TX",
    metaDesc: "Burnet's trusted local plumbing & HVAC team since 1997. 24/7 emergency service, water heaters, AC repair, drain cleaning, and more. Family-owned with a lifetime labor guarantee.",
  },
  {
    name: "Cedar Park",
    slug: "cedar-park",
    mainHeaderText: "Cedar Park Plumbing & HVAC - Hard Water Solutions for Growing Neighborhoods",
    locationBlurb: "Serving Cedar Park's growing community with reliable plumbing and HVAC solutions. Whether you're in Buttercup Creek, Twin Creeks, or anywhere in between, we provide fast, professional service.",
    servicesHeader: "What We Do in Cedar Park, TX",
    faqHeader: "What Our Cedar Park Customers Are Asking",
    trustHeader: "Why Cedar Park Homeowners Choose Us",
    metaTitle: "The #1 Plumbing & HVAC Team in Cedar Park, Texas",
    metaDesc: "Cedar Park's trusted plumbing & HVAC team. Fast response times, licensed technicians, and a lifetime warranty on labor. Book online or call 24/7.",
  },
  {
    name: "Georgetown",
    slug: "georgetown",
    mainHeaderText: "Georgetown & Sun City Plumbing & HVAC Experts - Hard Water Solutions",
    locationBlurb: "From the historic downtown square to Sun City and beyond, we understand Georgetown's unique plumbing and HVAC needs. Specializing in hard water solutions for Williamson County homes.",
    servicesHeader: "What We Do in Georgetown, TX",
    faqHeader: "What Our Georgetown Customers Are Asking",
    trustHeader: "Why Georgetown Homeowners Choose Us",
    metaTitle: "The #1 Plumbing & HVAC Team in Georgetown, Texas",
    metaDesc: "Georgetown plumbing & HVAC experts with same-day service. Specializing in hard water solutions for Williamson County homes. 4.9-star Google rating.",
  },
  {
    name: "Granite Shoals",
    slug: "granite-shoals",
    mainHeaderText: "Granite Shoals Lakeside Plumbing & HVAC - Water Treatment & Hard Water Experts",
    locationBlurb: "Your lakeside living deserves expert plumbing and HVAC care. We serve Granite Shoals homeowners with water treatment, AC repair, emergency repairs, and everything in between for your Highland Lakes home.",
    servicesHeader: "What We Do in Granite Shoals, TX",
    faqHeader: "What Our Granite Shoals Customers Are Asking",
    trustHeader: "Why Granite Shoals Homeowners Choose Us",
    metaTitle: "The #1 Plumbing & HVAC Team in Granite Shoals, TX",
    metaDesc: "Granite Shoals plumbing & HVAC experts serving the Highland Lakes. Water treatment, AC repair, emergency service, and more. Family-owned since 1997.",
  },
  {
    name: "Horseshoe Bay",
    slug: "horseshoe-bay",
    mainHeaderText: "Horseshoe Bay Luxury Home Plumbing & HVAC - PRV & Hard Water Specialists",
    locationBlurb: "Premium plumbing and HVAC service for Horseshoe Bay's luxury homes and resorts. We understand the high standards of lakefront living and deliver service to match.",
    servicesHeader: "What We Do in Horseshoe Bay, TX",
    faqHeader: "What Our Horseshoe Bay Customers Are Asking",
    trustHeader: "Why Horseshoe Bay Homeowners Choose Us",
    metaTitle: "The #1 Plumbing & HVAC Team in Horseshoe Bay, Texas",
    metaDesc: "Horseshoe Bay's trusted plumbing & HVAC team for luxury homes and resorts. Expert service, upfront pricing, and a lifetime labor guarantee.",
  },
  {
    name: "Kingsland",
    slug: "kingsland",
    mainHeaderText: "Lake LBJ Plumbing & HVAC - Hard Water Solutions for Vacation & Year-Round Homes",
    locationImage: "https://cdn.prod.website-files.com/68a62de002dc64b9a3eb5ec8/695d327a22f92724372b58d0_kingsland.jpeg",
    locationBlurb: "Serving Kingsland and the Lake LBJ community with expert plumbing and HVAC since 1997. From vacation homes to year-round residents, we keep you comfortable year-round.",
    servicesHeader: "What We Do in Kingsland, TX",
    faqHeader: "What Our Kingsland Customers Are Asking",
    trustHeader: "Why Kingsland Homeowners Choose Us",
    metaTitle: "The #1 Plumbing & HVAC Team in Kingsland, TX",
    metaDesc: "Kingsland plumbing & HVAC experts serving Lake LBJ and the Highland Lakes. Same-day service, water softeners, AC repair, and emergency repairs.",
  },
  {
    name: "Leander",
    slug: "leander",
    mainHeaderText: "Leander Plumbing & HVAC for New & Established Homes - Hard Water Solutions",
    locationBlurb: "As Leander continues to grow, we're here to serve both established neighborhoods and new developments with expert plumbing and HVAC. Fast response times and reliable service for one of Texas's fastest-growing cities.",
    servicesHeader: "What We Do in Leander, TX",
    faqHeader: "What Our Leander Customers Are Asking",
    trustHeader: "Why Leander Homeowners Choose Us",
    metaTitle: "The #1 Plumbing & HVAC Team in Leander, TX",
    metaDesc: "Leander's trusted plumbing & HVAC team for growing neighborhoods and established homes. 24/7 service, upfront pricing, and a lifetime labor guarantee.",
  },
  {
    name: "Liberty Hill",
    slug: "liberty-hill",
    mainHeaderText: "Liberty Hill Plumbing & HVAC - Well Water & Hard Water Specialists",
    locationBlurb: "From ranches to new subdivisions, we serve Liberty Hill's diverse community with dependable plumbing and HVAC. Well water expertise and hard water solutions for rural and suburban homes alike.",
    servicesHeader: "What We Do in Liberty Hill, TX",
    faqHeader: "What Our Liberty Hill Customers Are Asking",
    trustHeader: "Why Liberty Hill Homeowners Choose Us",
    metaTitle: "The #1 Plumbing & HVAC Team in Liberty Hill, Texas",
    metaDesc: "Liberty Hill plumbing & HVAC experts with well water and hard water expertise. Same-day service, licensed technicians, and upfront pricing.",
  },
  {
    name: "Marble Falls",
    slug: "marble-falls",
    mainHeaderText: "Marble Falls' Local Plumbing & HVAC Team - Your Neighbors Since 1997",
    locationBlurb: "Headquartered right here in Marble Falls, we're your neighbors. From Main Street businesses to lakeside homes, we provide responsive, quality plumbing and HVAC service our community deserves.",
    servicesHeader: "What We Do in Marble Falls, TX",
    faqHeader: "What Our Marble Falls Customers Are Asking",
    trustHeader: "Why Marble Falls Homeowners Choose Us",
    metaTitle: "The #1 Plumbing & HVAC Team in Marble Falls, Texas",
    metaDesc: "Marble Falls plumbing & HVAC experts headquartered right here. Same-day service, upfront pricing, 4.9-star Google rating. Residential and commercial.",
  },
  {
    name: "Round Rock",
    slug: "round-rock",
    mainHeaderText: "Round Rock Plumbing & HVAC from Old Settlers to Teravista - Hard Water Experts",
    locationBlurb: "Serving Round Rock from Old Settlers to Teravista and everywhere in between. We bring Highland Lakes reliability and plumbing & HVAC expertise to Williamson County's largest city.",
    servicesHeader: "What We Do in Round Rock, TX",
    faqHeader: "What Our Round Rock Customers Are Asking",
    trustHeader: "Why Round Rock Homeowners Choose Us",
    metaTitle: "The #1 Plumbing & HVAC Team in Round Rock, TX",
    metaDesc: "Round Rock plumbing & HVAC experts with same-day service. Water heaters, AC repair, drain cleaning, and emergency repairs. 4.9-star Google rating.",
  },
  {
    name: "Spicewood",
    slug: "spicewood",
    mainHeaderText: "Hill Country Plumbing & HVAC Experts - Well Water & Septic Specialists",
    locationBlurb: "Nestled in the Hill Country, Spicewood homes face unique challenges from well water to septic systems. We bring decades of local plumbing and HVAC expertise to every job.",
    servicesHeader: "What We Do in Spicewood, TX",
    faqHeader: "What Our Spicewood Customers Are Asking",
    trustHeader: "Why Spicewood Homeowners Choose Us",
    metaTitle: "The #1 Plumbing & HVAC Team in Spicewood, Texas",
    metaDesc: "Spicewood plumbing & HVAC experts with well water and septic expertise. Serving the Hill Country since 1997. Same-day service available.",
  },
  {
    name: "Lampasas",
    slug: "lampasas",
    mainHeaderText: "Lampasas Plumbing & HVAC - Serving the Springs of Texas",
    locationBlurb: "Bringing reliable plumbing and HVAC services to Lampasas and the surrounding Hill Country. From historic homes to growing neighborhoods, we provide expert service with the care your community deserves.",
    servicesHeader: "What We Do in Lampasas, TX",
    faqHeader: "What Our Lampasas Customers Are Asking",
    trustHeader: "Why Lampasas Homeowners Choose Us",
    metaTitle: "The #1 Plumbing & HVAC Team in Lampasas, TX",
    metaDesc: "Lampasas plumbing & HVAC experts with same-day service. Water heaters, AC repair, drain cleaning, and emergency repairs. Family-owned since 1997 with a lifetime labor guarantee.",
  },
]

export function getLocationBySlug(slug: string): Location | undefined {
  return locations.find((location) => location.slug === slug)
}

export function getAllLocationSlugs(): string[] {
  return locations.map((location) => location.slug)
}
