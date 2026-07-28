import { setNotifications } from '@/redux/notificationSlice'
import { NOTIFICATION_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// Custom hook: fetches the logged-in user's notifications and saves them to Redux
const useGetNotifications = () => {
    const dispatch = useDispatch();
    // Only fetch notifications if somebody is logged in
    const { user } = useSelector(store => store.auth);
    useEffect(() => {
        if (!user) return;
        const fetchNotifications = async () => {
            try {
                const res = await axios.get(`${NOTIFICATION_API_END_POINT}/get`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setNotifications(res.data.notifications));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchNotifications();
    }, [user])
}

export default useGetNotifications
