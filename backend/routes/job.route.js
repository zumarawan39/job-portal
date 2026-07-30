import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getAdminJobs, getAllJobs, getJobById, postJob, getRecommendedJobs, toggleSaveJob, getSavedJobs } from "../controllers/job.controller.js";
import validate from "../middlewares/validate.js";
import { postJobSchema } from "../validators/jobValidators.js";

const router = express.Router();

// Browsing/searching jobs is public (no login needed) - the Home/Jobs/Browse/JobDescription
// pages are all public routes on the frontend with no login guard, and neither controller
// below reads req.id, so requiring isAuthenticated here only blocked anonymous visitors
// from ever seeing a single job listing. Posting, per-recruiter/admin views, recommendations,
// and saving are still gated since those really are personal/recruiter-only actions.
router.route("/post").post(isAuthenticated, validate(postJobSchema), postJob); // recruiter creates a new job
router.route("/get").get(getAllJobs); // anyone browses/searches all jobs
router.route("/getadminjobs").get(isAuthenticated, getAdminJobs); // recruiter sees jobs they created
router.route("/recommended").get(isAuthenticated, getRecommendedJobs); // skill-based recommendations - must come before /get/:id so "recommended" isn't matched as an id
router.route("/save/:id").post(isAuthenticated, toggleSaveJob); // save/unsave a job - must come before /get/:id
router.route("/saved").get(isAuthenticated, getSavedJobs); // get all saved jobs - must come before /get/:id
router.route("/get/:id").get(getJobById); // anyone views one job's details

export default router;

