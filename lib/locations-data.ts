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
    mainHeaderText: "Expert Burnet Plumbers You Can Trust",
    locationBlurb: "As our hometown and headquarters since 1997, we know Burnet inside and out. From historic downtown homes to new construction, we handle it all with the care your neighbors deserve.",
    servicesHeader: "What We Do in Burnet, TX",
    faqHeader: "What Our Burnet Customers Are Asking",
    trustHeader: "Why Burnet Homeowners Choose Us",
    metaTitle: "The #1 Plumbers in Burnet, TX | Brandenburg Plumbing",
    metaDesc: "Burnet's trusted local plumber since 1997. 24/7 emergency service, water heaters, drain cleaning, and more. Family-owned with a lifetime labor guarantee.",
  },
  {
    name: "Cedar Park",
    slug: "cedar-park",
    mainHeaderText: "Expert Cedar Park Plumbers You Can Trust",
    locationBlurb: "Serving Cedar Park's growing community with reliable plumbing solutions. Whether you're in Buttercup Creek, Twin Creeks, or anywhere in between, we provide fast, professional service.",
    servicesHeader: "What We Do in Cedar Park, TX",
    faqHeader: "What Our Cedar Park Customers Are Asking",
    trustHeader: "Why Cedar Park Homeowners Choose Us",
    metaTitle: "The #1 Plumber in Cedar Park, Texas | Brandenburg Plumbing",
    metaDesc: "Cedar Park's trusted plumbing team. Fast response times, licensed technicians, and a lifetime warranty on labor. Book online or call 24/7.",
  },
  {
    name: "Georgetown",
    slug: "georgetown",
    mainHeaderText: "Expert Georgetown Plumbers You Can Trust",
    locationBlurb: "From the historic downtown square to Sun City and beyond, we understand Georgetown's unique plumbing needs. Specializing in hard water solutions for Williamson County homes.",
    servicesHeader: "What We Do in Georgetown, TX",
    faqHeader: "What Our Georgetown Customers Are Asking",
    trustHeader: "Why Georgetown Homeowners Choose Us",
    metaTitle: "The #1 Plumbers in Georgetown, Texas | Brandenburg Plumbing",
    metaDesc: "Georgetown plumbing experts with same-day service. Specializing in hard water solutions for Williamson County homes. 4.9-star Google rating.",
  },
  {
    name: "Granite Shoals",
    slug: "granite-shoals",
    mainHeaderText: "Expert Granite Shoals Plumbers You Can Trust",
    locationBlurb: "Your lakeside living deserves expert plumbing care. We serve Granite Shoals homeowners with water treatment, emergency repairs, and everything in between for your Highland Lakes home.",
    servicesHeader: "What We Do in Granite Shoals, TX",
    faqHeader: "What Our Granite Shoals Customers Are Asking",
    trustHeader: "Why Granite Shoals Homeowners Choose Us",
    metaTitle: "The #1 Plumbers in Granite Shoals, TX | Brandenburg Plumbing",
    metaDesc: "Granite Shoals plumbing experts serving the Highland Lakes. Water treatment, emergency service, and more. Family-owned since 1997.",
  },
  {
    name: "Horseshoe Bay",
    slug: "horseshoe-bay",
    mainHeaderText: "Expert Horseshoe Bay Plumbers You Can Trust",
    locationBlurb: "Premium plumbing service for Horseshoe Bay's luxury homes and resorts. We understand the high standards of lakefront living and deliver service to match.",
    servicesHeader: "What We Do in Horseshoe Bay, TX",
    faqHeader: "What Our Horseshoe Bay Customers Are Asking",
    trustHeader: "Why Horseshoe Bay Homeowners Choose Us",
    metaTitle: "The #1 Plumbers in Horseshoe Bay, Texas | Brandenburg Plumbing",
    metaDesc: "Horseshoe Bay's trusted plumber for luxury homes and resorts. Expert service, upfront pricing, and a lifetime labor guarantee.",
  },
  {
    name: "Kingsland",
    slug: "kingsland",
    mainHeaderText: "Upfront Pricing from the Most Trustworthy Plumbers in Kingsland",
    locationImage: "https://cdn.prod.website-files.com/68a62de002dc64b9a3eb5ec8/695d327a22f92724372b58d0_kingsland.jpeg",
    locationBlurb: "Serving Kingsland and the Lake LBJ community with expert plumbing since 1997. From vacation homes to year-round residents, we keep your water flowing.",
    servicesHeader: "What We Do in Kingsland, TX",
    faqHeader: "What Our Kingsland Customers Are Asking",
    trustHeader: "Why Kingsland Homeowners Choose Us",
    metaTitle: "The #1 Plumbers in Kingsland, TX | Brandenburg Plumbing",
    metaDesc: "Kingsland plumbing experts serving Lake LBJ and the Highland Lakes. Same-day service, water softeners, and emergency repairs.",
  },
  {
    name: "Leander",
    slug: "leander",
    mainHeaderText: "Expert Leander Plumbers You Can Trust",
    locationBlurb: "As Leander continues to grow, we're here to serve both established neighborhoods and new developments. Fast response times and reliable service for one of Texas's fastest-growing cities.",
    servicesHeader: "What We Do in Leander, TX",
    faqHeader: "What Our Leander Customers Are Asking",
    trustHeader: "Why Leander Homeowners Choose Us",
    metaTitle: "The #1 Plumbers in Leander, TX | Brandenburg Plumbing",
    metaDesc: "Leander's trusted plumber for new construction and established homes. 24/7 service, upfront pricing, and a lifetime labor guarantee.",
  },
  {
    name: "Liberty Hill",
    slug: "liberty-hill",
    mainHeaderText: "Expert Liberty Hill Plumbers You Can Trust",
    locationBlurb: "From ranches to new subdivisions, we serve Liberty Hill's diverse community with dependable plumbing. Well water expertise and hard water solutions for rural and suburban homes alike.",
    servicesHeader: "What We Do in Liberty Hill, TX",
    faqHeader: "What Our Liberty Hill Customers Are Asking",
    trustHeader: "Why Liberty Hill Homeowners Choose Us",
    metaTitle: "The #1 Plumbers in Liberty Hill, Texas | Brandenburg Plumbing",
    metaDesc: "Liberty Hill plumbing experts with well water and hard water expertise. Same-day service, licensed technicians, and upfront pricing.",
  },
  {
    name: "Marble Falls",
    slug: "marble-falls",
    mainHeaderText: "Expert Marble Falls Plumbers You Can Trust",
    locationBlurb: "Headquartered right here in Marble Falls, we're your neighbors. From Main Street businesses to lakeside homes, we provide the responsive, quality service our community deserves.",
    servicesHeader: "What We Do in Marble Falls, TX",
    faqHeader: "What Our Marble Falls Customers Are Asking",
    trustHeader: "Why Marble Falls Homeowners Choose Us",
    metaTitle: "The #1 Plumbers in Marble Falls, Texas | Brandenburg Plumbing",
    metaDesc: "Marble Falls plumbing experts headquartered right here. Same-day service, upfront pricing, 4.9-star Google rating. Residential and commercial.",
  },
  {
    name: "Round Rock",
    slug: "round-rock",
    mainHeaderText: "Expert Round Rock Plumbers You Can Trust",
    locationBlurb: "Serving Round Rock from Old Settlers to Teravista and everywhere in between. We bring Highland Lakes reliability and expertise to Williamson County's largest city.",
    servicesHeader: "What We Do in Round Rock, TX",
    faqHeader: "What Our Round Rock Customers Are Asking",
    trustHeader: "Why Round Rock Homeowners Choose Us",
    metaTitle: "The #1 Plumbers in Round Rock, TX | Brandenburg Plumbing",
    metaDesc: "Round Rock plumbing experts with same-day service. Water heaters, drain cleaning, and emergency repairs. 4.9-star Google rating.",
  },
  {
    name: "Spicewood",
    slug: "spicewood",
    mainHeaderText: "Expert Spicewood Plumbers You Can Trust",
    locationBlurb: "Nestled in the Hill Country, Spicewood homes face unique challenges from well water to septic systems. We bring decades of local expertise to every job.",
    servicesHeader: "What We Do in Spicewood, TX",
    faqHeader: "What Our Spicewood Customers Are Asking",
    trustHeader: "Why Spicewood Homeowners Choose Us",
    metaTitle: "The #1 Plumbers in Spicewood, Texas | Brandenburg Plumbing",
    metaDesc: "Spicewood plumbing experts with well water and septic expertise. Serving the Hill Country since 1997. Same-day service available.",
  },
]

export function getLocationBySlug(slug: string): Location | undefined {
  return locations.find((location) => location.slug === slug)
}

export function getAllLocationSlugs(): string[] {
  return locations.map((location) => location.slug)
}
