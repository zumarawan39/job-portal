import multer from "multer";

// Store uploaded files in memory (RAM) instead of saving them to disk first
const storage = multer.memoryStorage();
// Middleware to handle a single uploaded file from a form field named "file"
export const singleUpload = multer({storage}).single("file");