import mongoose from "mongoose";

// Defines what data an "Application" (a student applying to a job) looks like in the database
const applicationSchema = new mongoose.Schema({
    job:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Job', // links this application to a Job document
        required:true
    },
    applicant:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User', // links this application to the User who applied
        required:true
    },
    status:{
        type:String,
        enum:['pending', 'accepted', 'rejected'], // status can only be one of these values
        default:'pending'
    },
    interview:{
        scheduledAt:{type:Date}, // when the interview is scheduled for
        meetingLink:{type:String}, // link to a Google Meet/Zoom/etc call the recruiter pasted in
        notes:{type:String} // any extra info the recruiter wants to share
    }
},{timestamps:true}); // timestamps automatically adds createdAt and updatedAt fields
export const Application  = mongoose.model("Application", applicationSchema);