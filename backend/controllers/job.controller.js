import { Job } from "../models/job.model.js";

// Recruiter/admin creates a new job posting
export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;
        const userId = req.id;

        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
            return res.status(400).json({
                message: "Somethin is missing.",
                success: false
            })
        };
        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(","), // turn comma-separated text into an array
            salary: Number(salary), // make sure salary is stored as a number
            location,
            jobType,
            experienceLevel: experience,
            position,
            company: companyId,
            created_by: userId
        });
        return res.status(201).json({
            message: "New job created successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
}
// Student browses/searches all jobs, optionally filtered by keyword/location/industry/salary range
export const getAllJobs = async (req, res) => {
    try {
        const { keyword, location, industry, salaryMin, salaryMax } = req.query;

        // only add a condition for each filter that was actually provided
        const conditions = [];

        if (keyword) {
            // $regex with "i" option means case-insensitive partial text search
            conditions.push({
                $or: [
                    { title: { $regex: keyword, $options: "i" } },
                    { description: { $regex: keyword, $options: "i" } },
                ]
            });
        }

        if (location) {
            conditions.push({ location: { $regex: location, $options: "i" } });
        }

        if (industry) {
            // maps to the frontend's "Industry" filter (e.g. "Frontend Developer") - matched against the job title
            conditions.push({ title: { $regex: industry, $options: "i" } });
        }

        if (salaryMin) {
            conditions.push({ salary: { $gte: Number(salaryMin) } });
        }

        if (salaryMax) {
            conditions.push({ salary: { $lte: Number(salaryMax) } });
        }

        // if no filters were given at all, fall back to matching every job
        const query = conditions.length > 0 ? { $and: conditions } : {};

        // also fetch (populate) the related company info, newest jobs first
        const jobs = await Job.find(query).populate({
            path: "company"
        }).sort({ createdAt: -1 });
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
// Get one job's full details by its id (including its applications)
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path:"applications"
        });
        if (!job) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({ job, success: true });
    } catch (error) {
        console.log(error);
    }
}
// Recruiter/admin sees all jobs they have created so far
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;
        const jobs = await Job.find({ created_by: adminId }).populate({
            path:'company',
            createdAt:-1
        });
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
