import express from "express";
import { login, logout, register, updateProfile } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/mutler.js";
import validate from "../middlewares/validate.js";
import authLimiter from "../middlewares/rateLimiter.js";
import { registerSchema, loginSchema, updateProfileSchema } from "../validators/authValidators.js";

const router = express.Router();

router.route("/register").post(authLimiter,singleUpload,validate(registerSchema),register); // sign up + upload profile photo
router.route("/login").post(authLimiter,validate(loginSchema),login); // log in and get a token cookie
router.route("/logout").get(logout); // clear the login token cookie
router.route("/profile/update").post(isAuthenticated,singleUpload,validate(updateProfileSchema),updateProfile); // must be logged in to update profile

export default router;
