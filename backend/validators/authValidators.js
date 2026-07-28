import { z } from "zod";

// Validates the register form's body fields
export const registerSchema = z.object({
    fullname: z.string().min(1, "Full name is required."),
    email: z.string().email("Enter a valid email address."),
    // lenient - the frontend sends this as a plain form field, accept a string or number of digits
    phoneNumber: z.union([z.string(), z.number()]).refine(
        (val) => /^\d{7,15}$/.test(val.toString()),
        { message: "Enter a valid phone number." }
    ),
    password: z.string().min(6, "Password must be at least 6 characters."),
    role: z.enum(['student', 'recruiter'])
});

// Validates the login form's body fields
export const loginSchema = z.object({
    email: z.string().email("Enter a valid email address."),
    password: z.string().min(1, "Password is required."),
    role: z.enum(['student', 'recruiter'])
});

// Validates the "update profile" form's body fields - all optional since this route
// allows partial updates (a user might only be changing their bio, for example)
export const updateProfileSchema = z.object({
    fullname: z.string().optional(),
    email: z.string().email("Enter a valid email address.").optional(),
    phoneNumber: z.union([z.string(), z.number()]).optional(),
    bio: z.string().optional(),
    // sent as a comma-separated string by the frontend - the controller itself splits it
    skills: z.string().optional()
});

// Validates the "turn 2FA on/off" request body
export const toggleTwoFactorSchema = z.object({
    enabled: z.boolean()
});

// Validates the "forgot password" request body
export const forgotPasswordSchema = z.object({
    email: z.string().email("Enter a valid email address.")
});

// Validates the "reset password" request body
export const resetPasswordSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters.")
});
