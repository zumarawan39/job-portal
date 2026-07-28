import express from "express";
import { login, logout, register, updateProfile, forgotPassword, resetPassword, verifyLoginOtp, toggleTwoFactor } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/mutler.js";
import validate from "../middlewares/validate.js";
import authLimiter from "../middlewares/rateLimiter.js";
import { registerSchema, loginSchema, updateProfileSchema, toggleTwoFactorSchema, forgotPasswordSchema, resetPasswordSchema } from "../validators/authValidators.js";

const router = express.Router();

router.route("/register").post(authLimiter,singleUpload,validate(registerSchema),register); // sign up + upload profile photo
router.route("/login").post(authLimiter,validate(loginSchema),login); // log in and get a token cookie
router.route("/logout").get(logout); // clear the login token cookie
router.route("/profile/update").post(isAuthenticated,singleUpload,validate(updateProfileSchema),updateProfile); // must be logged in to update profile
router.route("/forgot-password").post(authLimiter,validate(forgotPasswordSchema),forgotPassword); // request a password reset email
router.route("/reset-password/:token").post(validate(resetPasswordSchema),resetPassword); // set a new password using the emailed token
router.route("/verify-otp").post(authLimiter,verifyLoginOtp); // verify emailed OTP to finish logging in (2FA)
router.route("/two-factor").post(isAuthenticated,validate(toggleTwoFactorSchema),toggleTwoFactor); // turn 2FA on/off for the logged-in user

export default router;

