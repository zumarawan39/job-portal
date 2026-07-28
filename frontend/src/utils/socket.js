import { io } from "socket.io-client";
import { API_BASE_URL } from "./constant";

// Single shared socket.io connection used everywhere in the app for real-time chat
const socket = io(API_BASE_URL, { withCredentials: true, autoConnect: true });

export default socket;
