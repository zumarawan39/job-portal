import mongoose from "mongoose";

// Defines what data a "User" (student or recruiter) looks like in the database
const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:['student','recruiter'],
        required:true
    },
    profile:{
        bio:{type:String},
        skills:[{type:String}],
        resume:{type:String}, // URL to resume file
        resumeOriginalName:{type:String},
        company:{type:mongoose.Schema.Types.ObjectId, ref:'Company'}, // only used for recruiters
        profilePhoto:{
            type:String,
            default:""
        }
    },
    resetPasswordToken:{type:String}, // hashed token used to verify a password reset request
    resetPasswordExpire:{type:Date}, // when the reset token stops being valid
    twoFactorEnabled:{type:Boolean, default:false}, // whether this user has opted into email OTP login verification
    twoFactorOTP:{type:String}, // hashed one-time code sent to the user's email during login
    twoFactorOTPExpire:{type:Date}, // when the OTP stops being valid
    savedJobs:[{type:mongoose.Schema.Types.ObjectId, ref:'Job'}], // jobs this user has bookmarked to view later
},{timestamps:true}); // adds createdAt and updatedAt automatically
export const User = mongoose.model('User', userSchema);
