import { z } from "zod"

export const SERVICE_OPTIONS = [
    "Portable Restrooms",
    "Temporary Water Lines",
    "Drain Cleaning",
    "Water Heater Installation",
    "Bathroom Renovations",
    "Fixture Installation",
    "Gas Line Services",
    "Other",
] as const

export const BUDGET_RANGES = [
    "Under $1,000",
    "$1,000 – $2,500",
    "$2,500 – $5,000",
    "$5,000 – $10,000",
    "$10,000+",
    "Not sure yet",
] as const

export const GUEST_COUNT_RANGES = [
    "Under 50",
    "50 – 100",
    "100 – 200",
    "200 – 300",
    "300+",
] as const

export const weddingQuestionnaireSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number is required"),
    partnerOneName: z.string().min(1, "Partner one's name is required"),
    partnerTwoName: z.string().min(1, "Partner two's name is required"),
    weddingDate: z.string().min(1, "Wedding date is required"),
    venueName: z.string().min(1, "Venue name is required"),
    venueAddress: z.string().min(1, "Venue address is required"),
    estimatedGuests: z.enum(GUEST_COUNT_RANGES, {
        errorMap: () => ({ message: "Please select an estimated guest count" }),
    }),
    servicesNeeded: z.array(z.enum(SERVICE_OPTIONS)).min(1, "Please select at least one service"),
    budgetRange: z.enum(BUDGET_RANGES, {
        errorMap: () => ({ message: "Please select a budget range" }),
    }),
    timeline: z.string().min(1, "Please provide a timeline"),
    additionalDetails: z.string().optional(),
})

export type WeddingQuestionnaireValues = z.infer<typeof weddingQuestionnaireSchema>
