import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { Application } from "../models/application.model.js";

// Builds a Mongo createdAt range filter from ?startDate=&endDate= (both optional, either end open)
const dateRangeFilter = (req) => {
    const { startDate, endDate } = req.query;
    if (!startDate && !endDate) return {};

    const createdAt = {};
    if (startDate) {
        const from = new Date(startDate);
        if (!isNaN(from)) createdAt.$gte = from;
    }
    if (endDate) {
        const to = new Date(endDate);
        if (!isNaN(to)) {
            to.setHours(23, 59, 59, 999); // include the whole end day
            createdAt.$lte = to;
        }
    }
    return Object.keys(createdAt).length ? { createdAt } : {};
}

// Reads ?page=&limit= into safe pagination values
const paginationParams = (req) => {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    return { page, limit, skip: (page - 1) * limit };
}

// Get overall counts for the admin dashboard, optionally scoped to a date range
export const getStats = async (req, res) => {
    try {
        const range = dateRangeFilter(req);

        const totalJobSeekers = await User.countDocuments({ ...range, role: 'jobseeker' });
        const totalRecruiters = await User.countDocuments({ ...range, role: 'recruiter' });
        const totalJobs = await Job.countDocuments(range);
        const totalCompanies = await Company.countDocuments(range);
        const totalApplications = await Application.countDocuments(range);

        // Applications split by status, for a pie/bar breakdown chart
        const applicationsByStatus = await Application.aggregate([
            { $match: range },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        // Jobs split by type, for a bar breakdown chart
        const jobsByType = await Job.aggregate([
            { $match: range },
            { $group: { _id: "$jobType", count: { $sum: 1 } } }
        ]);

        // Day-by-day signups/jobs/applications, for line/bar trend charts
        const dailySeries = async (Model, extraMatch = {}) => Model.aggregate([
            { $match: { ...range, ...extraMatch } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const [signupsOverTime, jobsOverTime, applicationsOverTime] = await Promise.all([
            dailySeries(User, { role: { $in: ['jobseeker', 'recruiter'] } }),
            dailySeries(Job),
            dailySeries(Application),
        ]);

        return res.status(200).json({
            success: true,
            stats: {
                totalJobSeekers,
                totalRecruiters,
                totalJobs,
                totalCompanies,
                totalApplications
            },
            charts: {
                applicationsByStatus: applicationsByStatus.map(s => ({ status: s._id || 'unknown', count: s.count })),
                jobsByType: jobsByType.map(j => ({ type: j._id || 'unspecified', count: j.count })),
                signupsOverTime: signupsOverTime.map(d => ({ date: d._id, count: d.count })),
                jobsOverTime: jobsOverTime.map(d => ({ date: d._id, count: d.count })),
                applicationsOverTime: applicationsOverTime.map(d => ({ date: d._id, count: d.count })),
            }
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong.",
            success: false,
        });
    }
}
// Get a page of users in the system (without passwords), newest first
export const getAllUsers = async (req, res) => {
    try {
        const { page, limit, skip } = paginationParams(req);
        const filter = dateRangeFilter(req);

        const [users, total] = await Promise.all([
            User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
            User.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            users,
            pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) }
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong.",
            success: false,
        });
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
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong.",
            success: false,
        });
    }
}
// Get a page of job postings in the system, newest first
export const getAllJobsAdmin = async (req, res) => {
    try {
        const { page, limit, skip } = paginationParams(req);
        const filter = dateRangeFilter(req);

        const [jobs, total] = await Promise.all([
            Job.find(filter).populate('company').populate('created_by', '-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
            Job.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            jobs,
            pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) }
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong.",
            success: false,
        });
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
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong.",
            success: false,
        });
    }
}
// Get a page of companies in the system, newest first
export const getAllCompaniesAdmin = async (req, res) => {
    try {
        const { page, limit, skip } = paginationParams(req);
        const filter = dateRangeFilter(req);

        const [companies, total] = await Promise.all([
            Company.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Company.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            companies,
            pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) }
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong.",
            success: false,
        });
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
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong.",
            success: false,
        });
    }
}
