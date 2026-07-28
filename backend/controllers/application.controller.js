import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";
import sendEmail from "../utils/sendEmail.js";
import createVideoRoom from "../utils/dailyVideo.js";

// Let a logged-in student apply to a job
export const applyJob = async (req, res) => {
    try {
        const userId = req.id; // comes from the isAuthenticated middleware
        const jobId = req.params.id;
        if (!jobId) {
            return res.status(400).json({
                message: "Job id is required.",
                success: false
            })
        };
        // check if the user has already applied for the job
        const existingApplication = await Application.findOne({ job: jobId, applicant: userId });

        if (existingApplication) {
            return res.status(400).json({
                message: "You have already applied for this jobs",
                success: false
            });
        }

        // check if the jobs exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            })
        }
        // create a new application
        const newApplication = await Application.create({
            job:jobId,
            applicant:userId,
        });

        // link this application to the job so we can find it later
        job.applications.push(newApplication._id);
        await job.save();
        return res.status(201).json({
            message:"Job applied successfully.",
            success:true
        })
    } catch (error) {
        console.log(error);
    }
};
// Get all jobs a logged-in student has applied to
export const getAppliedJobs = async (req,res) => {
    try {
        const userId = req.id;
        // find this user's applications, and also fetch (populate) the related job and company details
        const application = await Application.find({applicant:userId}).sort({createdAt:-1}).populate({
            path:'job',
            options:{sort:{createdAt:-1}},
            populate:{
                path:'company',
                options:{sort:{createdAt:-1}},
            }
        });
        if(!application){
            return res.status(404).json({
                message:"No Applications",
                success:false
            })
        };
        return res.status(200).json({
            application,
            success:true
        })
    } catch (error) {
        console.log(error);
    }
}
// Recruiter/admin views how many people applied to a job
export const getApplicants = async (req,res) => {
    try {
        const jobId = req.params.id;
        // find the job, and also fetch (populate) each application plus the applicant's details
        const job = await Job.findById(jobId).populate({
            path:'applications',
            options:{sort:{createdAt:-1}},
            populate:{
                path:'applicant'
            }
        });
        if(!job){
            return res.status(404).json({
                message:'Job not found.',
                success:false
            })
        };
        return res.status(200).json({
            job,
            succees:true
        });
    } catch (error) {
        console.log(error);
    }
}
// Recruiter updates an applicant's status (e.g. accepted/rejected/pending)
export const updateStatus = async (req,res) => {
    try {
        const {status} = req.body;
        const applicationId = req.params.id;
        if(!status){
            return res.status(400).json({
                message:'status is required',
                success:false
            })
        };

        // find the application by applicantion id
        const application = await Application.findOne({_id:applicationId});
        if(!application){
            return res.status(404).json({
                message:"Application not found.",
                success:false
            })
        };

        // update the status (always store it in lowercase, e.g. "accepted")
        application.status = status.toLowerCase();
        await application.save();

        // let the applicant know their status changed by creating an in-app notification
        const job = await Job.findById(application.job);
        await Notification.create({
            user: application.applicant,
            message: `Your application for "${job?.title}" has been ${application.status}.`,
            type: 'application_status',
            relatedJob: application.job
        });

        // also try to email them - wrapped separately so a broken/missing email setup never breaks this response
        try {
            const applicant = await User.findById(application.applicant);
            if (applicant) {
                await sendEmail({
                    to: applicant.email,
                    subject: "Update on your job application",
                    html: `<p>Your application for "${job?.title}" has been <b>${application.status}</b>.</p>`
                });
            }
        } catch (error) {
            console.log(error);
        }

        return res.status(200).json({
            message:"Status updated successfully.",
            success:true
        });

    } catch (error) {
        console.log(error);
    }
}
// Recruiter schedules an interview (date/time + a meeting link they paste in from Google Meet/Zoom/etc)
export const scheduleInterview = async (req, res) => {
    try {
        const applicationId = req.params.id;
        const { scheduledAt, meetingLink, notes } = req.body;

        const application = await Application.findById(applicationId).populate('job');
        if (!application) {
            return res.status(404).json({
                message: "Application not found.",
                success: false
            })
        };

        // only the recruiter who owns this job can schedule an interview for it
        if (application.job.created_by.toString() !== req.id) {
            return res.status(403).json({
                message: "Not authorized.",
                success: false
            })
        };

        // if the recruiter didn't paste in their own meeting link, try to auto-create one via
        // Daily.co - falls back to whatever (or nothing) the recruiter provided if that fails
        let finalMeetingLink = meetingLink;
        if (!finalMeetingLink) {
            const autoRoomUrl = await createVideoRoom();
            if (autoRoomUrl) {
                finalMeetingLink = autoRoomUrl;
            }
        }

        application.interview = { scheduledAt, meetingLink: finalMeetingLink, notes };
        await application.save();

        // let the applicant know an interview was scheduled by creating an in-app notification
        try {
            await Notification.create({
                user: application.applicant,
                message: `An interview has been scheduled for your application to "${application.job.title}".`,
                type: 'application_status',
                relatedJob: application.job._id
            });
        } catch (error) {
            console.log(error);
        }

        return res.status(200).json({
            success: true,
            message: "Interview scheduled.",
            application
        });
    } catch (error) {
        console.log(error);
    }
}
