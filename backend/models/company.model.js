import mongoose from "mongoose";

// Defines what data a "Company" looks like in the database
const companySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String, 
    },
    website:{
        type:String 
    },
    location:{
        type:String 
    },
    logo:{
        type:String // URL to company logo
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User', // the recruiter (User) who owns/registered this company
        required:true
    }
},{timestamps:true}) // adds createdAt and updatedAt automatically
export const Company = mongoose.model("Company", companySchema);