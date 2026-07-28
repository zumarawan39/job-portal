import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getAdminJobs, getAllJobs, getJobById, postJob, getRecommendedJobs, toggleSaveJob, getSavedJobs } from "../controllers/job.controller.js";
import validate from "../middlewares/validate.js";
import { postJobSchema } from "../validators/jobValidators.js";

const router = express.Router();

// All routes below require the user to be logged in (isAuthenticated)
router.route("/post").post(isAuthenticated, validate(postJobSchema), postJob); // recruiter creates a new job
router.route("/get").get(isAuthenticated, getAllJobs); // student browses/searches all jobs
router.route("/getadminjobs").get(isAuthenticated, getAdminJobs); // recruiter sees jobs they created
router.route("/recommended").get(isAuthenticated, getRecommendedJobs); // skill-based recommendations - must come before /get/:id so "recommended" isn't matched as an id
router.route("/save/:id").post(isAuthenticated, toggleSaveJob); // save/unsave a job - must come before /get/:id
router.route("/saved").get(isAuthenticated, getSavedJobs); // get all saved jobs - must come before /get/:id
router.route("/get/:id").get(isAuthenticated, getJobById); // get one job by its id

export default router;
