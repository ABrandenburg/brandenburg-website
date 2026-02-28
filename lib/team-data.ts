// Team member data parsed from Brandenburg Plumbing - Team Members.csv

export interface TeamMember {
  name: string
  slug: string
  position: string
  bio: string
  photo: string
  orderNumber: number
  showOnAboutPage: boolean
}

export const teamMembers: TeamMember[] = [
  {
    name: "Lucas Brandenburg",
    slug: "lucas-brandenburg",
    position: "General Manager",
    bio: "Lucas started his plumbing journey when he was 13 working with his father, Troy Brandenburg. More than 34 years later, he leads the plumbing service team, overseeing every project with an expertise honed over thousands of jobs.",
    photo: "/images/team/lucas-brandenburg.jpg",
    orderNumber: 1,
    showOnAboutPage: true,
  },
  {
    name: "Adam Brandenburg",
    slug: "adam-brandenburg",
    position: "Marketing & Technology",
    bio: "Adam, Lucas's brother, ensures Brandenburg Plumbing continues to innovate across marketing and technology in order to provide the best possible service.",
    photo: "/images/team/adam-brandenburg.jpg",
    orderNumber: 2,
    showOnAboutPage: true,
  },
  {
    name: "Michael Hamilton",
    slug: "michael-hamilton",
    position: "Office Manager",
    bio: "A former paratrooper born and raised in Burnet County, Mike brings a positive attitude and a wide breadth of plumbing and construction knowledge to every customer interaction.",
    photo: "/images/team/michael-hamilton.jpg",
    orderNumber: 4,
    showOnAboutPage: true,
  },
  {
    name: "Austin Brown",
    slug: "austin-brown",
    position: "Licensed Plumber",
    bio: "Austin grew up in Florence, Texas and is an avid guitar player. He enjoys rock music and spending time with his family. He has been with Brandenburg Plumbing since 2017 and brings a wealth of experience and knowledge to every job he does.",
    photo: "/images/team/austin-brown.jpg",
    orderNumber: 5,
    showOnAboutPage: true,
  },
  {
    name: "Brendan Whitney",
    slug: "brendan-whitney",
    position: "Licensed Plumber",
    bio: "Brendan is a true outdoorsman who loves to hang out on the lake, and his favorite spots include Lake LBJ, Llano, and Lake Buchanan. He has a Golden Retriever named Amethyst and a python (basilisk) named Nagini. He knows a little sign language, and possibly Parseltongue.",
    photo: "/images/team/brendan-whitney.jpg",
    orderNumber: 6,
    showOnAboutPage: false,
  },
  {
    name: "Nick McBride",
    slug: "nick-mcbride",
    position: "Licensed Plumber",
    bio: "Nick is a friendly Tradesman plumber with almost 5 years of experience. He's an avid fisherman, and his favorite local hangout spot is Black Rock Park in Lake Buchanan.",
    photo: "/images/team/nick-mcbride.jpg",
    orderNumber: 7,
    showOnAboutPage: false,
  },
  {
    name: "Gabriel Brown",
    slug: "gabriel-brown",
    position: "Licensed Plumber",
    bio: "Gabriel loves to read and is one of a set of quintuplets. He graduated from Lampasas High School and has been with Brandenburg Plumbing since January of 2023.",
    photo: "/images/team/gabriel-brown.jpg",
    orderNumber: 8,
    showOnAboutPage: false,
  },
  {
    name: "Colin Mason",
    slug: "colin-mason",
    position: "Licensed Plumber",
    bio: "Colin is a Journeyman plumber who started plumbing in 2017 and has been working full-time since 2020. He enjoys fishing, golfing, and exploring the Highland Lakes with his dog, Roscoe. An early riser, Colin loves starting his days by watching the sunrise.",
    photo: "/images/team/colin-mason.jpg",
    orderNumber: 9,
    showOnAboutPage: false,
  },
  {
    name: "Monty Lamb",
    slug: "monty-lamb",
    position: "Operations Manager",
    bio: "A licensed plumber since 1985, Monty brings decades of hands-on experience to his role as Operations Manager. When he's not keeping the team running smoothly, you'll find him playing guitar and singing to his wife, building things out of wood, or splashing in the river with his English Springer Spaniels, Willie Nelson and Dolly Parton. He's left-handed, dyslexic, artistic, and a devoted Steinbeck fan.",
    photo: "/images/team/monty-lamb.jpg",
    orderNumber: 3,
    showOnAboutPage: true,
  },
  {
    name: "Josh Chachere",
    slug: "josh-chachere",
    position: "Certified HVAC Technician",
    bio: "Josh is a certified HVAC technician with 23 years of experience in the trade. He and his family love their yearly camping trip to Garner State Park and enjoy eating at Rio Brave in Marble Falls. One of seven siblings with four brothers and a sister, Josh is a proud soon-to-be grandpa, a cookbook enthusiast, and a diehard Back to the Future fan.",
    photo: "/images/team/josh-chachere.jpg",
    orderNumber: 10,
    showOnAboutPage: false,
  },
  {
    name: "Kyle Shafer",
    slug: "kyle-shafer",
    position: "Registered HVAC Technician",
    bio: "Kyle is a registered HVAC technician dedicated to delivering reliable heating and cooling solutions. He's passionate about the trade and committed to growing his skills while providing outstanding service to every Brandenburg Plumbing customer.",
    photo: "/images/team/kyle-shafer.jpg",
    orderNumber: 11,
    showOnAboutPage: false,
  },
  {
    name: "Matthew Chapman",
    slug: "matthew-chapman",
    position: "Licensed Plumber",
    bio: "Matthew is a licensed plumber with six years of experience in the trade. When he's not on the job, he enjoys drawing, reading, singing, and anything sports. He shares his home with two dogs (Ginger and Juice), a snake named Nala, and a cat named Maverick. Fun fact: he's been to every state except Maine.",
    photo: "/images/team/matthew-chapman.jpg",
    orderNumber: 12,
    showOnAboutPage: false,
  },
  {
    name: "Colton Snively",
    slug: "colton-snively",
    position: "Licensed Plumber",
    bio: "Colton is a Tradesman plumber who enjoys surfing, spending time on the lake, running, hunting, and traveling to new places whenever he gets the chance. He and his girlfriend love the local food scene\u2014Jardin Coronas and the Texaco in Granite Shoals are go-to spots, Boat Town is great for live music, and Bay View is saved for special occasions. And yes, he's 6'6\", before you ask.",
    photo: "/images/team/colton-snively.jpg",
    orderNumber: 13,
    showOnAboutPage: false,
  },
  {
    name: "Lane Spaulding",
    slug: "lane-spaulding",
    position: "Licensed Plumber",
    bio: "Lane loves offshore fishing and hunting game in his free time. His favorite local spots include Wake Point and Highland Lakes Marina. He has a Pitbull/Catahoula mix named Marty and comes from a big family of eight siblings\u2014adopted, half, full, and step.",
    photo: "/images/team/lane-spaulding.jpg",
    orderNumber: 14,
    showOnAboutPage: false,
  },
  {
    name: "Landon Christian",
    slug: "landon-christian",
    position: "Apprentice Plumber",
    bio: "Landon is an apprentice plumber eager to learn the trade and build a career with Brandenburg Plumbing. He's a hard worker with a great attitude who is quickly developing his skills under the guidance of our experienced licensed plumbers.",
    photo: "/images/team/landon-christian.jpg",
    orderNumber: 15,
    showOnAboutPage: false,
  },
  {
    name: "Imanol Pena",
    slug: "imanol-pena",
    position: "Apprentice Plumber",
    bio: "Imanol has about three years of experience as a technician. He enjoys playing soccer and volleyball in his free time, and one of his favorite local spots is Granite Shoals Quarry Park. Fun fact: he has a birthmark in the shape of Africa.",
    photo: "/images/team/imanol-pena.jpg",
    orderNumber: 16,
    showOnAboutPage: false,
  },
  {
    name: "Terry Brandenburg",
    slug: "terry-brandenburg",
    position: "Bookkeeper",
    bio: "Detailed, diligent, and our mom, Terry keeps all our accounts in order.",
    photo: "/images/team/terry-brandenburg.jpg",
    orderNumber: 17,
    showOnAboutPage: true,
  },
]

// Get all team members sorted by order number
export function getAllTeamMembers(): TeamMember[] {
  return [...teamMembers].sort((a, b) => a.orderNumber - b.orderNumber)
}

// Get team members that should be shown on the about page
export function getFeaturedTeamMembers(): TeamMember[] {
  return teamMembers
    .filter(member => member.showOnAboutPage)
    .sort((a, b) => a.orderNumber - b.orderNumber)
}

// Get a team member by slug
export function getTeamMemberBySlug(slug: string): TeamMember | undefined {
  return teamMembers.find(member => member.slug === slug)
}
