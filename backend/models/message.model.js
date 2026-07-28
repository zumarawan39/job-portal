import mongoose from "mongoose";

// Defines what data a chat "Message" (between a recruiter and a student, tied to one application) looks like
const messageSchema = new mongoose.Schema({
    application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application', // which application this conversation belongs to
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // who sent this message
        required: true
    },
    text: {
        type: String,
        required: true
    }
}, { timestamps: true }); // adds createdAt and updatedAt automatically
export const Message = mongoose.model("Message", messageSchema);
