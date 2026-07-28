import { Message } from "../models/message.model.js";

// Sets up the real-time chat behaviour for every connected socket
export const registerChatSocket = (io) => {
    io.on("connection", (socket) => {
        // let a client join the "room" for one application so it only gets that conversation's messages
        socket.on("join_room", (applicationId) => {
            socket.join(applicationId);
        });

        // save a new chat message to the database, then broadcast it to everyone in that application's room
        socket.on("send_message", async ({ applicationId, senderId, text }) => {
            try {
                const message = await Message.create({ application: applicationId, sender: senderId, text });
                const populated = await message.populate('sender', 'fullname profile.profilePhoto role');
                io.to(applicationId).emit("receive_message", populated);
            } catch (error) {
                console.log(error);
            }
        });
    });
}

