import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Uploaded files (profile photos, resumes, company logos) are saved here and
// served back out via the /uploads static route registered in index.js.
export const uploadsDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Saves an in-memory uploaded file (from multer's memoryStorage) to disk and
// returns the absolute URL to fetch it back, built from the current request's
// own host so it works the same in dev and once deployed.
const saveFileLocally = (file, req) => {
    const ext = path.extname(file.originalname);
    const filename = `${crypto.randomUUID()}${ext}`;
    fs.writeFileSync(path.join(uploadsDir, filename), file.buffer);
    return `${req.protocol}://${req.get("host")}/uploads/${filename}`;
};

export default saveFileLocally;
