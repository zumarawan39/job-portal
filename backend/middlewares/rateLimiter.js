import rateLimit from "express-rate-limit";

// Limits repeated attempts on sensitive public routes (login/register/forgot-password/otp)
// to slow down brute-forcing/spam - 20 requests per 15 minutes per IP is generous enough
// for real users but blocks abuse.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: "Too many attempts, please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false
});

export default authLimiter;
