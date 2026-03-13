export interface EmailSignaturePerson {
  name: string
  slug: string
  position: string
  email: string
  phone: string
  photo: string
}

export const emailSignatureMembers: EmailSignaturePerson[] = [
  {
    name: "Monty Lamb",
    slug: "monty-lamb",
    position: "Operations Manager",
    email: "monty@brandenburgplumbing.com",
    phone: "(512) 756-9847",
    photo: "https://www.brandenburgplumbing.com/images/team/monty-lamb.jpg",
  },
  {
    name: "Michael Hamilton",
    slug: "michael-hamilton",
    position: "Office Manager",
    email: "michael@brandenburgplumbing.com",
    phone: "(512) 756-9847",
    photo: "https://www.brandenburgplumbing.com/images/team/michael-hamilton.jpg",
  },
  {
    name: "Lucas Brandenburg",
    slug: "lucas-brandenburg",
    position: "General Manager",
    email: "lucas@brandenburgplumbing.com",
    phone: "(512) 756-9847",
    photo: "https://www.brandenburgplumbing.com/images/team/lucas-brandenburg.jpg",
  },
  {
    name: "Adam Brandenburg",
    slug: "adam-brandenburg",
    position: "Marketing & Technology",
    email: "adam@brandenburgplumbing.com",
    phone: "(512) 756-9847",
    photo: "https://www.brandenburgplumbing.com/images/team/adam-brandenburg.jpg",
  },
]

export function getEmailSignatureBySlug(slug: string): EmailSignaturePerson | undefined {
  return emailSignatureMembers.find((m) => m.slug === slug)
}

export function getAllEmailSignatureSlugs(): string[] {
  return emailSignatureMembers.map((m) => m.slug)
}
