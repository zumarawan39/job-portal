import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getMessages } from "../controllers/message.controller.js";

const router = express.Router();

// Must be logged in to view a conversation's chat history
router.route("/:applicationId").get(isAuthenticated, getMessages); // get all messages for one application

export default router;
