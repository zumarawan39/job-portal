import mongoose from "mongoose";

// Defines what data a "Notification" (e.g. application status update) looks like in the database
const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // who this notification is for
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['application_status', 'general'],
        default: 'general'
    },
    relatedJob: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job' // optional job this notification is about
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true }); // adds createdAt and updatedAt automatically
export const Notification = mongoose.model("Notification", notificationSchema);
