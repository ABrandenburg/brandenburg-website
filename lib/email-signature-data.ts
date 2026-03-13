export interface EmailSignaturePerson {
  name: string
  slug: string
  position: string
  email: string
  phone: string
}

export const emailSignatureMembers: EmailSignaturePerson[] = [
  {
    name: "Monty Lamb",
    slug: "monty-lamb",
    position: "Operations Manager",
    email: "monty@brandenburgplumbing.com",
    phone: "(512) 756-9847",
  },
  {
    name: "Michael Hamilton",
    slug: "michael-hamilton",
    position: "Office Manager",
    email: "michael@brandenburgplumbing.com",
    phone: "(512) 756-9847",
  },
  {
    name: "Lucas Brandenburg",
    slug: "lucas-brandenburg",
    position: "General Manager",
    email: "lucas@brandenburgplumbing.com",
    phone: "(512) 756-9847",
  },
  {
    name: "Adam Brandenburg",
    slug: "adam-brandenburg",
    position: "Marketing & Technology",
    email: "adam@brandenburgplumbing.com",
    phone: "(512) 756-9847",
  },
]

export function getEmailSignatureBySlug(slug: string): EmailSignaturePerson | undefined {
  return emailSignatureMembers.find((m) => m.slug === slug)
}

export function getAllEmailSignatureSlugs(): string[] {
  return emailSignatureMembers.map((m) => m.slug)
}
