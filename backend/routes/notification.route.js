import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getMyNotifications, markAsRead, markAllAsRead } from "../controllers/notification.controller.js";

const router = express.Router();

// All routes below require the user to be logged in (isAuthenticated)
router.route("/get").get(isAuthenticated, getMyNotifications); // list my notifications
router.route("/:id/read").post(isAuthenticated, markAsRead); // mark one as read
router.route("/read-all").post(isAuthenticated, markAllAsRead); // mark all as read

export default router;
