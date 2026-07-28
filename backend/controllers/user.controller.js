import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import sendEmail from "../utils/sendEmail.js";

// Sign up a new user (student or recruiter)
export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;

        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        };
        // upload the profile photo to cloudinary and get its public URL, if one was provided
        let profilePhoto = "";
        if (req.file) {
            const fileUri = getDataUri(req.file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            profilePhoto = cloudResponse.secure_url;
        }

        // make sure no other account already uses this email
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: 'User already exist with this email.',
                success: false,
            })
        }
        // never store plain text passwords - hash it first
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile:{
                profilePhoto,
            }
        });

        return res.status(201).json({
            message: "Account created successfully.",
            success: true
        });
    } catch (error) {
        console.log(error);
    }
}
// Log in an existing user and give them a login token (stored in a cookie)
export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        };
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        }
        // compare the typed password with the hashed password saved in the database
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        };
        // check role is correct or not
        if (role !== user.role) {
            return res.status(400).json({
                message: "Account doesn't exist with current role.",
                success: false
            })
        };

        // if this user has 2FA turned on, don't log them in yet - email them a one-time code first
        if (user.twoFactorEnabled) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

            user.twoFactorOTP = hashedOtp;
            user.twoFactorOTPExpire = Date.now() + 10 * 60 * 1000; // valid for 10 minutes
            await user.save();

            await sendEmail({
                to: user.email,
                subject: "Your login verification code",
                html: `<p>Your verification code is:</p><h1 style="letter-spacing:4px;">${otp}</h1><p>This code expires in 10 minutes.</p>`
            });

            // always log the code locally too, so it's usable even without email configured
            console.log("Login OTP for " + user.email + " (for local testing): " + otp);

            return res.status(200).json({
                success: true,
                requiresTwoFactor: true,
                userId: user._id,
                message: "We sent a verification code to your email. Enter it to finish logging in."
            })
        }

        // create a signed JWT token that proves who the user is, valid for 1 day
        const tokenData = {
            userId: user._id
        }
        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        // only send back safe fields to the frontend (no password)
        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        // save the token in an httpOnly cookie so JavaScript on the frontend can't read it directly
        // (fixed a typo here: it must be "httpOnly", not "httpsOnly" - the old spelling was
        // silently ignored by the cookie library, so the security flag never actually applied)
        return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'strict' }).json({
            message: `Welcome back ${user.fullname}`,
            user,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
// Log out by clearing the login token cookie
export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logged out successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
// Update the logged-in user's profile info (and optionally their resume file)
export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;

        // upload the new resume file to cloudinary and get its public URL, if one was provided
        const file = req.file;
        let cloudResponse;
        if (file) {
            const fileUri = getDataUri(file);
            cloudResponse = await cloudinary.uploader.upload(fileUri.content);
        }

        let skillsArray;
        if(skills){
            skillsArray = skills.split(","); // turn comma-separated text into an array
        }
        const userId = req.id; // middleware authentication
        let user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                message: "User not found.",
                success: false
            })
        }
        // only update fields that were actually sent in the request
        if(fullname) user.fullname = fullname
        if(email) user.email = email
        if(phoneNumber)  user.phoneNumber = phoneNumber
        if(bio) user.profile.bio = bio
        if(skills) user.profile.skills = skillsArray

        // save the new resume file info if one was uploaded
        if(cloudResponse){
            user.profile.resume = cloudResponse.secure_url // save the cloudinary url
            user.profile.resumeOriginalName = file.originalname // Save the original file name
        }


        await user.save();

        // only send back safe fields to the frontend (no password)
        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).json({
            message:"Profile updated successfully.",
            user,
            success:true
        })
    } catch (error) {
        console.log(error);
    }
}
// Send a password reset link to the user's email (start of the forgot-password flow)
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                message: "Email is required.",
                success: false
            })
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "No account found with this email.",
                success: false
            })
        }

        // generate a random raw token to send to the user, but only store its hash in the database
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // valid for 15 minutes
        await user.save();

        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${rawToken}`;

        await sendEmail({
            to: user.email,
            subject: "Reset your Job Portal password",
            html: `<p>You requested a password reset.</p><p>Click the link below to set a new password (valid for 15 minutes):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
        });

        // always log the link locally too, so it's usable even without email configured
        console.log("Password reset link (for local testing): " + resetUrl);

        return res.status(200).json({
            message: "If an account exists, a password reset link has been sent.",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
// Reset the password using the token emailed to the user
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: "This reset link is invalid or has expired.",
                success: false
            })
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        return res.status(200).json({
            message: "Password has been reset successfully. Please log in.",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
// Verify the emailed OTP and finish logging the user in (second step of 2FA login)
export const verifyLoginOtp = async (req, res) => {
    try {
        const { userId, otp } = req.body;
        if (!userId || !otp) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            })
        };

        let user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({
                message: "Invalid request.",
                success: false
            })
        }

        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
        if (user.twoFactorOTP !== hashedOtp || !user.twoFactorOTPExpire || user.twoFactorOTPExpire < Date.now()) {
            return res.status(400).json({
                message: "Invalid or expired code.",
                success: false
            })
        }

        user.twoFactorOTP = undefined;
        user.twoFactorOTPExpire = undefined;
        await user.save();

        // create a signed JWT token that proves who the user is, valid for 1 day
        const tokenData = {
            userId: user._id
        }
        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        // only send back safe fields to the frontend (no password)
        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        // save the token in an httpOnly cookie so JavaScript on the frontend can't read it directly
        return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'strict' }).json({
            message: `Welcome back ${user.fullname}`,
            user,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
// Turn email OTP two-factor authentication on or off for the logged-in user
export const toggleTwoFactor = async (req, res) => {
    try {
        const { enabled } = req.body;
        const user = await User.findById(req.id);
        if (!user) {
            return res.status(400).json({
                message: "User not found.",
                success: false
            })
        }

        user.twoFactorEnabled = !!enabled;
        await user.save();

        return res.status(200).json({
            success: true,
            twoFactorEnabled: user.twoFactorEnabled,
            message: user.twoFactorEnabled ? "Two-factor authentication enabled." : "Two-factor authentication disabled."
        })
    } catch (error) {
        console.log(error);
    }
}