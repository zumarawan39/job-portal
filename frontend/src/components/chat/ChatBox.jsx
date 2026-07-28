import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { MESSAGE_API_END_POINT } from '@/utils/constant'
import socket from '@/utils/socket'
import { useSelector } from 'react-redux'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

// Real-time chat between a recruiter and a student for one specific job application.
// Joins the application's socket room, loads history over REST, then listens for new messages.
const ChatBox = ({ applicationId }) => {
    const { user } = useSelector(store => store.auth);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const bottomRef = useRef(null);

    // Load chat history and join the room for this application
    useEffect(() => {
        if (!applicationId) return;

        const fetchHistory = async () => {
            try {
                const res = await axios.get(`${MESSAGE_API_END_POINT}/${applicationId}`, { withCredentials: true });
                if (res.data.success) {
                    setMessages(res.data.messages);
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchHistory();
        socket.emit("join_room", applicationId);
    }, [applicationId]);

    // Listen for incoming messages while this chat is open
    useEffect(() => {
        const handler = (message) => {
            if (message.application === applicationId) {
                setMessages((prev) => [...prev, message]);
            }
        }
        socket.on("receive_message", handler);
        return () => {
            socket.off("receive_message", handler);
        }
    }, [applicationId]);

    // Keep the view scrolled to the latest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendHandler = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        socket.emit("send_message", { applicationId, senderId: user._id, text });
        setText("");
    }

    const formatTime = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return (
        <div className='flex flex-col h-[60vh]'>
            <div className='flex-1 overflow-y-auto flex flex-col gap-2 p-2'>
                {
                    messages.length === 0 ? (
                        <p className='text-sm text-muted-foreground text-center my-4'>No messages yet. Say hello!</p>
                    ) : (
                        messages.map((message) => {
                            const isOwn = message.sender?._id === user?._id;
                            return (
                                <div key={message._id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[75%] rounded-lg px-3 py-2 ${isOwn ? 'bg-[#6A38C2] text-white' : 'bg-gray-100 text-gray-800'}`}>
                                        <p className='text-xs font-medium opacity-80'>{message.sender?.fullname}</p>
                                        <p className='text-sm'>{message.text}</p>
                                    </div>
                                    <span className='text-xs text-muted-foreground mt-0.5'>{formatTime(message.createdAt)}</span>
                                </div>
                            )
                        })
                    )
                }
                <div ref={bottomRef} />
            </div>
            <form onSubmit={sendHandler} className='flex items-center gap-2 p-2 border-t'>
                <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                />
                <Button type="submit">Send</Button>
            </form>
        </div>
    )
}

export default ChatBox
