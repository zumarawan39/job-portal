import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getCompany, getCompanyById, registerCompany, updateCompany } from "../controllers/company.controller.js";
import { singleUpload } from "../middlewares/mutler.js";
import validate from "../middlewares/validate.js";
import { registerCompanySchema, updateCompanySchema } from "../validators/companyValidators.js";

const router = express.Router();

// All routes below require the user to be logged in (isAuthenticated)
router.route("/register").post(isAuthenticated,validate(registerCompanySchema),registerCompany); // create a new company
router.route("/get").get(isAuthenticated,getCompany); // get all companies for the logged-in recruiter
router.route("/get/:id").get(isAuthenticated,getCompanyById); // get one company by its id
router.route("/update/:id").put(isAuthenticated,singleUpload,validate(updateCompanySchema),updateCompany); // update company info + logo upload

export default router;

