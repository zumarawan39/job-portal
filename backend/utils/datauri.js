import DataUriParser from "datauri/parser.js"

import path from "path";

// Convert an uploaded file (in memory) into a data URI string so it can be sent to cloudinary
const getDataUri = (file) => {
    const parser = new DataUriParser();
    const extName = path.extname(file.originalname).toString(); // get file extension, e.g. ".png"
    return parser.format(extName, file.buffer);
}

export default getDataUri;