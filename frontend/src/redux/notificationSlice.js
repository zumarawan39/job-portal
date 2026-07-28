import { createSlice } from "@reduxjs/toolkit";

// Holds the logged-in user's application-status notifications and how many are unread
const notificationSlice = createSlice({
    name: "notification",
    initialState: {
        notifications: [],
        unreadCount: 0,
    },
    reducers: {
        // actions
        // Replaces the full notifications list and recomputes how many are unread
        setNotifications: (state, action) => {
            state.notifications = action.payload;
            state.unreadCount = action.payload.filter((n) => n.isRead === false).length;
        },
        // Marks a single notification (by id) as read locally and decrements the unread count
        markOneReadLocally: (state, action) => {
            const id = action.payload;
            const notification = state.notifications.find((n) => n._id === id);
            if (notification && !notification.isRead) {
                notification.isRead = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        // Marks every notification as read locally and resets the unread count to 0
        markAllReadLocally: (state) => {
            state.notifications.forEach((n) => {
                n.isRead = true;
            });
            state.unreadCount = 0;
        }
    }
});
export const {
    setNotifications,
    markOneReadLocally,
    markAllReadLocally
} = notificationSlice.actions;
export default notificationSlice.reducer;
