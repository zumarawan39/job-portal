// One-off script to promote an existing signed-up user to admin.
// There is no admin signup form on purpose (keeps signup simple: only student/recruiter).
// Run manually with: node scripts/makeAdmin.js someone@example.com
import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";

dotenv.config({});

const email = process.argv[2];

const run = async () => {
    if (!email) {
        console.log("Please provide an email address. Usage: node scripts/makeAdmin.js someone@example.com");
        process.exit();
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);

        const user = await User.findOne({ email });
        if (!user) {
            console.log(`No user found with email: ${email}`);
            process.exit();
        }

        user.role = 'admin';
        await user.save();

        console.log(`Success! ${user.email} is now an admin.`);
        process.exit();
    } catch (error) {
        console.log(error);
        process.exit();
    }
}

run();
