import { z } from "zod";

// Validates the "post a new job" form's body fields
// salary/experience/position accept numeric strings since this app sends them as
// plain strings from an HTML form - z.coerce.number() is lenient about that.
export const postJobSchema = z.object({
    title: z.string().min(1, "Title is required."),
    description: z.string().min(1, "Description is required."),
    requirements: z.string().min(1, "Requirements are required."),
    salary: z.coerce.number().min(0, "Salary is required."),
    location: z.string().min(1, "Location is required."),
    jobType: z.string().min(1, "Job type is required."),
    experience: z.coerce.number().min(0, "Experience is required."),
    position: z.coerce.number().min(0, "Position is required."),
    companyId: z.string().min(1, "Company is required.")
});
