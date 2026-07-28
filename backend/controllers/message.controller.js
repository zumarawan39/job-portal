import { Application } from "../models/application.model.js";
import { Message } from "../models/message.model.js";

// Get the full chat history for one application, only if the requester is the applicant or the recruiter who owns the job
export const getMessages = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await Application.findById(applicationId).populate('job');
        if (!application) {
            return res.status(404).json({
                message: "Application not found.",
                success: false
            })
        }

        const isApplicant = application.applicant.toString() === req.id;
        const isRecruiter = application.job.created_by.toString() === req.id;
        if (!isApplicant && !isRecruiter) {
            return res.status(403).json({
                message: "Not authorized to view this conversation.",
                success: false
            })
        }

        const messages = await Message.find({ application: applicationId }).sort({ createdAt: 1 }).populate('sender', 'fullname profile.profilePhoto role');

        return res.status(200).json({
            success: true,
            messages
        })
    } catch (error) {
        console.log(error);
    }
}
