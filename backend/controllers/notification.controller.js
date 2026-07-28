import { Notification } from "../models/notification.model.js";

// Get the logged-in user's most recent notifications
export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.id }).sort({ createdAt: -1 }).limit(50);
        return res.status(200).json({
            success: true,
            notifications
        })
    } catch (error) {
        console.log(error);
    }
}
// Mark a single notification as read
export const markAsRead = async (req, res) => {
    try {
        await Notification.findOneAndUpdate({ _id: req.params.id, user: req.id }, { isRead: true });
        return res.status(200).json({
            success: true,
            message: "Marked as read."
        })
    } catch (error) {
        console.log(error);
    }
}
// Mark all of the logged-in user's unread notifications as read
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ user: req.id, isRead: false }, { isRead: true });
        return res.status(200).json({
            success: true,
            message: "All notifications marked as read."
        })
    } catch (error) {
        console.log(error);
    }
}
