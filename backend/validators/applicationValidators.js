import { z } from "zod";

// Validates the "update applicant status" request body - kept lenient since the
// controller itself lowercases the value and validates it against the allowed enum
export const updateStatusSchema = z.object({
    status: z.string().min(1, "status is required")
});

// Validates the "schedule interview" request body - all fields optional since a
// recruiter might only fill in some of them. scheduledAt arrives as a datetime-local
// string from the frontend (not a strict ISO date), so it's kept as a plain string.
export const scheduleInterviewSchema = z.object({
    scheduledAt: z.string().optional(),
    meetingLink: z.string().optional(),
    notes: z.string().optional()
});
