// This is the main entry file that starts our backend server
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import notificationRoute from "./routes/notification.route.js";
import messageRoute from "./routes/message.route.js";
import { registerChatSocket } from "./sockets/chatSocket.js";

// Load variables from the .env file into process.env
dotenv.config({});

// Create the express app
const app = express();

// middleware
app.use(express.json()); // lets us read JSON data sent in requests
app.use(express.urlencoded({extended:true})); // lets us read form data sent in requests
app.use(cookieParser()); // lets us read cookies (used for login tokens)
// Which frontend URL(s) are allowed to call this API.
// Locally this defaults to the usual Vite dev ports; set CLIENT_URL in .env
// to your real frontend URL once you deploy (e.g. https://your-app.vercel.app).
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
if (process.env.CLIENT_URL) {
    allowedOrigins.push(process.env.CLIENT_URL);
}
const corsOptions = {
    origin: allowedOrigins,
    credentials:true // allow cookies to be sent with requests
}

app.use(cors(corsOptions));

// Number(...) matters here - process.env.PORT is always a text string, and without
// converting it, "8000" + 1 would give the wrong string "80001" instead of the number 8001.
const PORT = Number(process.env.PORT) || 3000;


// api's
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/notification", notificationRoute);
app.use("/api/v1/message", messageRoute);

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
