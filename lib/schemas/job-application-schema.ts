import { z } from "zod"

const ALLOWED_ZIPS = [
    "76550", "78605", "78607", "78609", "78611",
    "78636", "78639", "78642", "78643", "78645",
    "78657", "78663", "78669", "78672"
]

// Shared fields for all roles
const baseSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number is required"),
    zipCode: z.string().min(5, "Zip code is required").refine((val) => {
        if (val.length < 5) return true // Let min(5) handle incomplete input
        return ALLOWED_ZIPS.includes(val)
    }, {
        message: "We are not currently hiring in that zip code. Please check back later for opportunities in your area."
    }),
    source: z.enum(["Indeed", "Facebook", "Instagram", "Referral", "Truck Wrap", "Other"]),
})

// Technician Role
const technicianSchema = baseSchema.extend({
    role: z.literal("technician"),
    trade: z.enum(["HVAC", "Plumbing", "Electrical", "General"]),
    experienceYears: z.enum(["0-1 (Apprentice)", "2-4", "5-9", "10+"]),
    hasLicense: z.boolean().default(false),
    licenseType: z.string().optional(),
    motivation: z.string().min(10, "Please tell us why you are interested"),
    mostRecentEmployer: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.experienceYears !== "0-1 (Apprentice)" && !data.mostRecentEmployer) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Most recent employer is required for experienced candidates",
            path: ["mostRecentEmployer"],
        })
    }

    if (data.hasLicense && !data.licenseType) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please select your license type",
            path: ["licenseType"],
        })
    }
})

// Office Role
const officeSchema = baseSchema.extend({
    role: z.literal("office"),
    officeExperience: z.enum(["Entry Level", "1-3 Years", "3+ Years"]),
    knownSoftware: z.boolean().default(false), // ServiceTitan/Housecall Pro
    callVolumeComfort: z.boolean().default(false),
    mostRecentEmployer: z.string().optional(),
}).refine((data) => {
    if (data.officeExperience !== "Entry Level" && !data.mostRecentEmployer) {
        return false
    }
    return true
}, {
    message: "Most recent employer is required for experienced candidates",
    path: ["mostRecentEmployer"],
})

// Warehouse Role
const warehouseSchema = baseSchema.extend({
    role: z.literal("warehouse"),
    canLift50lbs: z.boolean().default(false), // strict boolean might want refinement if required true, but user just said boolean
    hasDriversLicense: z.boolean().default(false),
})

export const jobApplicationSchema = z.discriminatedUnion("role", [
    technicianSchema,
    officeSchema,
    warehouseSchema,
])

export type JobApplicationValues = z.infer<typeof jobApplicationSchema>
