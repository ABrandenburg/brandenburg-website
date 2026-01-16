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
    orderNumber: 3,
    showOnAboutPage: true,
  },
  {
    name: "Austin Brown",
    slug: "austin-brown",
    position: "Licensed Plumber",
    bio: "Austin grew up in Florence, Texas and is an avid guitar player. He enjoys rock music and spending time with his family. He has been with Brandenburg Plumbing since 2017 and brings a wealth of experience and knowledge to every job he does.",
    photo: "/images/team/austin-brown.jpg",
    orderNumber: 4,
    showOnAboutPage: true,
  },
  {
    name: "Brendan Whitney",
    slug: "brendan-whitney",
    position: "Licensed Plumber",
    bio: "Brendan is a true outdoorsman who loves to hang out on the lake, and his favorite spots include Lake LBJ, Llano, and Lake Buchanan. He has a Golden Retriever named Amethyst and a python (basilisk) named Nagini. He knows a little sign language, and possibly Parseltongue.",
    photo: "/images/team/brendan-whitney.jpg",
    orderNumber: 5,
    showOnAboutPage: false,
  },
  {
    name: "Nick McBride",
    slug: "nick-mcbride",
    position: "Licensed Plumber",
    bio: "Nick is a friendly Tradesman plumber with almost 5 years of experience. He's an avid fisherman, and his favorite local hangout spot is Black Rock Park in Lake Buchanan.",
    photo: "/images/team/nick-mcbride.jpg",
    orderNumber: 6,
    showOnAboutPage: false,
  },
  {
    name: "Gabriel Brown",
    slug: "gabriel-brown",
    position: "Licensed Plumber",
    bio: "Gabriel loves to read and is one of a set of quintuplets. He graduated from Lampasas High School and has been with Brandenburg Plumbing since January of 2023.",
    photo: "/images/team/gabriel-brown.jpg",
    orderNumber: 7,
    showOnAboutPage: false,
  },
  {
    name: "Colin Mason",
    slug: "colin-mason",
    position: "Licensed Plumber",
    bio: "Colin is a Journeyman plumber who started plumbing in 2017 and has been working full-time since 2020. He enjoys fishing, golfing, and exploring the Highland Lakes with his dog, Roscoe. An early riser, Colin loves starting his days by watching the sunrise.",
    photo: "/images/team/colin-mason.jpg",
    orderNumber: 8,
    showOnAboutPage: false,
  },
  {
    name: "Colton Snively",
    slug: "colton-snively",
    position: "Apprentice Plumber",
    bio: "",
    photo: "/images/team/colton-snively.jpg",
    orderNumber: 9,
    showOnAboutPage: false,
  },
  {
    name: "Lane Spaulding",
    slug: "lane-spaulding",
    position: "Apprentice Plumber",
    bio: "",
    photo: "/images/team/lane-spaulding.jpg",
    orderNumber: 10,
    showOnAboutPage: false,
  },
  {
    name: "Terry Brandenburg",
    slug: "terry-brandenburg",
    position: "Bookkeeper",
    bio: "Detailed, diligent, and our mom, Terry keeps all our accounts in order.",
    photo: "/images/team/terry-brandenburg.jpg",
    orderNumber: 11,
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
