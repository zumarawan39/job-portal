import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { Application } from "../models/application.model.js";

// Get overall counts for the admin dashboard
export const getStats = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
        const totalJobs = await Job.countDocuments();
        const totalCompanies = await Company.countDocuments();
        const totalApplications = await Application.countDocuments();

        return res.status(200).json({
            success: true,
            stats: {
                totalStudents,
                totalRecruiters,
                totalJobs,
                totalCompanies,
                totalApplications
            }
        })
    } catch (error) {
        console.log(error);
    }
}
// Get every user in the system (without passwords), newest first
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            users
        })
    } catch (error) {
        console.log(error);
    }
}
// Delete any user by id
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            })
        }
        return res.status(200).json({
            message: "User deleted successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
// Get every job posting in the system, newest first
export const getAllJobsAdmin = async (req, res) => {
    try {
        const jobs = await Job.find().populate('company').populate('created_by', '-password').sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            jobs
        })
    } catch (error) {
        console.log(error);
    }
}
// Delete any job posting by id
export const deleteJobAdmin = async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            })
        }
        return res.status(200).json({
            message: "Job deleted successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
// Get every company in the system, newest first
export const getAllCompaniesAdmin = async (req, res) => {
    try {
        const companies = await Company.find().sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            companies
        })
    } catch (error) {
        console.log(error);
    }
}
// Delete any company by id
export const deleteCompanyAdmin = async (req, res) => {
    try {
        const company = await Company.findByIdAndDelete(req.params.id);
        if (!company) {
            return res.status(404).json({
                message: "Company not found",
                success: false
            })
        }
        return res.status(200).json({
            message: "Company deleted successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
