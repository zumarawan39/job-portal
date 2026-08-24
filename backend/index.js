// This is the main entry file that starts our backend server
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import adminRoute from "./routes/admin.route.js";
import notificationRoute from "./routes/notification.route.js";
import messageRoute from "./routes/message.route.js";
import { registerChatSocket } from "./sockets/chatSocket.js";
import { uploadsDir } from "./utils/localStorage.js";

// Load variables from the .env file into process.env
dotenv.config({});

// Fail fast if required config is missing, instead of starting a server
// that will silently error on every DB query or every login attempt.
const requiredEnvVars = ["MONGO_URI", "SECRET_KEY"];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variable(s): ${missingEnvVars.join(", ")}`);
    process.exit(1);
}

// Create the express app
const app = express();

// middleware
// The frontend always lives on a different origin than this API (different port
// locally, different domain in prod), so uploaded images need to stay loadable
// cross-origin - the default "same-origin" resource policy would silently block them.
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json()); // lets us read JSON data sent in requests
app.use(express.urlencoded({extended:true})); // lets us read form data sent in requests
app.use(cookieParser()); // lets us read cookies (used for login tokens)
// Serves uploaded profile photos/resumes/company logos back out (saved by utils/localStorage.js)
app.use("/uploads", express.static(uploadsDir));
// Which frontend URL(s) are allowed to call this API.
// Locally this defaults to the usual Vite dev ports; set CLIENT_URL in .env
// to your real frontend URL(s) once you deploy (e.g. https://your-app.vercel.app).
// CLIENT_URL can be a single origin or a comma-separated list for multiple frontends.
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
if (process.env.CLIENT_URL) {
    allowedOrigins.push(...process.env.CLIENT_URL.split(",").map((origin) => origin.trim()));
}
const corsOptions = {
    origin: allowedOrigins,
    credentials:true // allow cookies to be sent with requests
}

app.use(cors(corsOptions));

// Number(...) matters here - process.env.PORT is always a text string, and without
// converting it, "8000" + 1 would give the wrong string "80001" instead of the number 8001
// when the retry-on-busy-port logic below kicks in.
const PORT = Number(process.env.PORT) || 3000;


// api's
// Every route below is grouped under its own base path
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/notification", notificationRoute);
app.use("/api/v1/message", messageRoute);

// Safety net: catches anything thrown/passed to next(err) that a route
// handler didn't already respond to, so requests fail with a clear JSON
// error instead of hanging until the client times out.
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        message: "Something went wrong.",
        success: false,
    });
});

// Socket.io needs to attach to the raw http server, not directly to the express app
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true
    }
});
registerChatSocket(io); // wire up the real-time chat "join_room"/"send_message" events

// Start the server, then connect to the database.
// If the port is already taken, keep trying the next one instead of crashing.
const startServer = (port) => {
    const server = httpServer.listen(port, () => {
        connectDB();
        console.log(`Server running at port ${port}`);
    });

    server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
            console.log(`Port ${port} is in use, trying port ${port + 1}...`);
            startServer(port + 1);
        } else {
            throw err;
        }
    });
};

startServer(PORT);
