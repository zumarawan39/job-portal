import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import validate from "../middlewares/validate.js";
import { applyJob, getApplicants, getAppliedJobs, updateStatus, scheduleInterview } from "../controllers/application.controller.js";
import { updateStatusSchema, scheduleInterviewSchema } from "../validators/applicationValidators.js";

const router = express.Router();

// All routes below require the user to be logged in (isAuthenticated)
router.route("/apply/:id").get(isAuthenticated, applyJob); // student applies to a job
router.route("/get").get(isAuthenticated, getAppliedJobs); // student sees jobs they applied to
router.route("/:id/applicants").get(isAuthenticated, getApplicants); // recruiter sees applicants for a job
router.route("/status/:id/update").post(isAuthenticated, validate(updateStatusSchema), updateStatus); // recruiter updates an applicant's status
router.route("/:id/schedule-interview").post(isAuthenticated, validate(scheduleInterviewSchema), scheduleInterview); // recruiter schedules an interview


export default router;

