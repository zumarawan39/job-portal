import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import isAdmin from "../middlewares/isAdmin.js";
import {
    getStats,
    getAllUsers,
    deleteUser,
    getAllJobsAdmin,
    deleteJobAdmin,
    getAllCompaniesAdmin,
    deleteCompanyAdmin
} from "../controllers/admin.controller.js";

const router = express.Router();

// All routes below require the user to be logged in AND be an admin
router.route("/stats").get(isAuthenticated, isAdmin, getStats); // dashboard counts
router.route("/users").get(isAuthenticated, isAdmin, getAllUsers); // list every user
router.route("/users/:id").delete(isAuthenticated, isAdmin, deleteUser); // delete a user
router.route("/jobs").get(isAuthenticated, isAdmin, getAllJobsAdmin); // list every job
router.route("/jobs/:id").delete(isAuthenticated, isAdmin, deleteJobAdmin); // delete a job
router.route("/companies").get(isAuthenticated, isAdmin, getAllCompaniesAdmin); // list every company
router.route("/companies/:id").delete(isAuthenticated, isAdmin, deleteCompanyAdmin); // delete a company

export default router;
