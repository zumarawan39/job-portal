import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";

// Escapes regex special characters in user-supplied search text before it's used
// in a Mongo $regex query, so a search term can't be interpreted as regex syntax
// (which would otherwise allow query manipulation or a catastrophic-backtracking pattern).
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Recruiter/admin creates a new job posting
export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;
        const userId = req.id;

        // salary/experience/position are only checked for presence here, not truthiness -
        // validate(postJobSchema) already guarantees they're numbers, and a truthy check would
        // wrongly reject legitimate 0 values (e.g. an "Entry Level" job with 0 years experience).
        if (!title || !description || !requirements || salary === undefined || !location || !jobType || experience === undefined || !position || !companyId) {
            return res.status(400).json({
                message: "Something is missing.",
                success: false
            })
        };
        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(","), // turn comma-separated text into an array
            salary, // already coerced to a number by validate(postJobSchema)
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
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong.",
            success: false,
        });
    }
}
// Student browses/searches all jobs, optionally filtered by keyword/location/industry/salary range
export const getAllJobs = async (req, res) => {
    try {
        const { keyword, location, industry, salaryMin, salaryMax } = req.query;

        // only add a condition for each filter that was actually provided, and only
        // if it's a plain string - a crafted query string like ?keyword[$gt]= would
        // otherwise arrive here as an object and get passed straight into $regex
        const conditions = [];

        if (keyword && typeof keyword === "string") {
            // $regex with "i" option means case-insensitive partial text search
            const safeKeyword = escapeRegex(keyword);
            conditions.push({
                $or: [
                    { title: { $regex: safeKeyword, $options: "i" } },
                    { description: { $regex: safeKeyword, $options: "i" } },
                ]
            });
        }

        if (location && typeof location === "string") {
            conditions.push({ location: { $regex: escapeRegex(location), $options: "i" } });
        }

        if (industry && typeof industry === "string") {
            // maps to the frontend's "Industry" filter (e.g. "Finance", "Support") - there's no
            // dedicated industry field on the Job model, so match against title, description or
            // requirements. Title-only matching missed jobs like "Accountant" for an industry of
            // "Finance", since that word never appears in the title itself.
            const safeIndustry = escapeRegex(industry);
            conditions.push({
                $or: [
                    { title: { $regex: safeIndustry, $options: "i" } },
                    { description: { $regex: safeIndustry, $options: "i" } },
                    { requirements: { $regex: safeIndustry, $options: "i" } },
                ]
            });
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
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong.",
            success: false,
        });
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
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong.",
            success: false,
        });
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
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong.",
            success: false,
        });
    }
}
// Suggest jobs for the logged-in student based on the skills on their profile
export const getRecommendedJobs = async (req, res) => {
    try {
        const user = await User.findById(req.id);
        const skills = (user?.profile?.skills || []).map(s => s.toLowerCase());

        // no skills on file yet - just show the newest jobs
        if (skills.length === 0) {
            const jobs = await Job.find().populate('company').sort({ createdAt: -1 }).limit(6);
            return res.status(200).json({
                success: true,
                jobs
            })
        }

        const allJobs = await Job.find().populate('company');

        // score each job by how many of the user's skills show up in its title/description/requirements
        const scoredJobs = allJobs.map(job => {
            const text = `${job.title} ${job.description} ${(job.requirements || []).join(' ')}`.toLowerCase();
            const score = skills.filter(skill => text.includes(skill)).length;
            return { job, score };
        });

        // best matches first, newest first as a tiebreaker
        scoredJobs.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return new Date(b.job.createdAt) - new Date(a.job.createdAt);
        });

        const matched = scoredJobs.filter(j => j.score > 0).map(j => j.job);
        let jobs = matched.slice(0, 6);

        // not enough matches - fill the rest with the newest jobs not already included
        if (jobs.length < 6) {
            const includedIds = new Set(jobs.map(j => j._id.toString()));
            const remaining = allJobs
                .filter(j => !includedIds.has(j._id.toString()))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            for (const job of remaining) {
                if (jobs.length >= 6) break;
                jobs.push(job);
            }
        }

        return res.status(200).json({
            success: true,
            jobs
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong.",
            success: false,
        });
    }
}
// Save (bookmark) a job for later, or remove it if it's already saved
export const toggleSaveJob = async (req, res) => {
    try {
        const user = await User.findById(req.id);
        const jobId = req.params.id;

        const alreadySaved = user.savedJobs.some(id => id.toString() === jobId);
        if (alreadySaved) {
            user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
        } else {
            user.savedJobs.push(jobId);
        }
        await user.save();

        return res.status(200).json({
            success: true,
            saved: !alreadySaved,
            message: !alreadySaved ? "Job saved." : "Job removed from saved jobs."
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong.",
            success: false,
        });
    }
}
// Get all jobs the logged-in user has saved for later
export const getSavedJobs = async (req, res) => {
    try {
        const user = await User.findById(req.id).populate({
            path: 'savedJobs',
            populate: { path: 'company' }
        });

        return res.status(200).json({
            success: true,
            jobs: user.savedJobs
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong.",
            success: false,
        });
    }
}
