import { z } from "zod";

// Validates the "register a company" form's body fields
export const registerCompanySchema = z.object({
    companyName: z.string().min(1, "Company name is required.")
});

// Validates the "update company" form's body fields - all optional, this is a
// partial-update route (the logo file itself is handled separately by multer)
export const updateCompanySchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    website: z.string().optional(),
    location: z.string().optional()
});
