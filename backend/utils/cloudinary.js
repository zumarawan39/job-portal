import {v2 as cloudinary} from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

// Set up cloudinary (used to store uploaded images/files online) with our account keys
cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
});
export default cloudinary;