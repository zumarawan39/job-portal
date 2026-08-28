import { z } from "zod";

// Matches a Pakistani mobile number with the leading 0/country code stripped, e.g. "3001234567"
// (the frontend only ever submits the digits after a fixed "+92" prefix shown in the UI).
const pkPhoneRegex = /^3\d{9}$/;
const pkPhoneMessage = "Enter a valid Pakistani mobile number (e.g. 3001234567).";

// Validates the register form's body fields
export const registerSchema = z.object({
    fullname: z.string().min(1, "Full name is required."),
    email: z.string().email("Enter a valid email address."),
    // lenient on the type (string or number) since this is a plain form field, but strict on shape
    phoneNumber: z.union([z.string(), z.number()]).refine(
        (val) => pkPhoneRegex.test(val.toString()),
        { message: pkPhoneMessage }
    ),
    password: z.string().min(6, "Password must be at least 6 characters."),
    role: z.enum(['student', 'recruiter', 'admin']),
    // only required/checked when role is 'admin' - see register() in user.controller.js
    adminCode: z.string().optional()
});

// Validates the login form's body fields
export const loginSchema = z.object({
    email: z.string().email("Enter a valid email address."),
    password: z.string().min(1, "Password is required."),
    role: z.enum(['student', 'recruiter', 'admin'])
});

// Validates the "update profile" form's body fields - all optional since this route
// allows partial updates (a user might only be changing their bio, for example)
export const updateProfileSchema = z.object({
    fullname: z.string().optional(),
    email: z.string().email("Enter a valid email address.").optional(),
    // same shape check as registerSchema - without this, an arbitrary string reaches
    // phoneNumber: Number in the User model and throws an uncaught Mongoose CastError
    phoneNumber: z.union([z.string(), z.number()]).refine(
        (val) => val === undefined || pkPhoneRegex.test(val.toString()),
        { message: pkPhoneMessage }
    ).optional(),
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

// Validates the "verify login OTP" request body (second step of 2FA login)
export const verifyOtpSchema = z.object({
    userId: z.string().min(1, "User id is required."),
    otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code.")
});
