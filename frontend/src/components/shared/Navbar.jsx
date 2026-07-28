import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Avatar, AvatarImage } from '../ui/avatar'
import { LogOut, User2, Bell, Bookmark } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { USER_API_END_POINT, NOTIFICATION_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { markAllReadLocally, markOneReadLocally } from '@/redux/notificationSlice'
import useGetNotifications from '@/hooks/useGetNotifications'
import useGetSavedJobs from '@/hooks/useGetSavedJobs'
import { toast } from 'sonner'

const Navbar = () => {
    // Fetches the logged-in user's notifications and keeps them in Redux
    useGetNotifications();
    // Fetches the logged-in student's saved job ids and keeps them in Redux
    useGetSavedJobs();
    const { user } = useSelector(store => store.auth);
    // Read notifications + unread count from the notification slice
    const { notifications, unreadCount } = useSelector(store => store.notification);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Marks a single notification as read, both on the backend and in Redux
    const markOneReadHandler = async (notification) => {
        if (notification.isRead) return;
        try {
            const res = await axios.post(`${NOTIFICATION_API_END_POINT}/${notification._id}/read`, {}, { withCredentials: true });
            if (res.data.success) {
                dispatch(markOneReadLocally(notification._id));
            }
        } catch (error) {
            console.log(error);
        }
    }

    // Marks all notifications as read, both on the backend and in Redux
    const markAllReadHandler = async () => {
        try {
            const res = await axios.post(`${NOTIFICATION_API_END_POINT}/read-all`, {}, { withCredentials: true });
            if (res.data.success) {
                dispatch(markAllReadLocally());
            }
        } catch (error) {
            console.log(error);
        }
    }

    // Formats a date as a short relative-ish string (e.g. "2026-07-23")
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString();
    }

    const logoutHandler = async () => {
        try {
            const res = await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true });
            if (res.data.success) {
                dispatch(setUser(null));
                navigate("/");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    }
    return (
        <div className='bg-white'>
            <div className='flex items-center justify-between mx-auto max-w-7xl h-16'>
                <div>
                    <h1 className='text-2xl font-bold'>Job<span className='text-[#F83002]'>Portal</span></h1>
                </div>
                <div className='flex items-center gap-12'>
                    <ul className='flex font-medium items-center gap-5'>
                        {
                            user && user.role === 'recruiter' ? (
                                <>
                                    <li><Link to="/admin/companies">Companies</Link></li>
                                    <li><Link to="/admin/jobs">Jobs</Link></li>
                                </>
                            ) : (
                                <>
                                    <li><Link to="/">Home</Link></li>
                                    <li><Link to="/jobs">Jobs</Link></li>
                                    <li><Link to="/browse">Browse</Link></li>
                                </>
                            )
                        }


                    </ul>
                    {
                        // Show a notification bell for any logged-in user (student, recruiter, or admin)
                        user && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <div className='relative cursor-pointer'>
                                        <Bell />
                                        {
                                            unreadCount > 0 && (
                                                <span className='absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                                                    {unreadCount}
                                                </span>
                                            )
                                        }
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <div className='flex items-center justify-between mb-2'>
                                        <h4 className='font-medium'>Notifications</h4>
                                        <Button onClick={markAllReadHandler} variant="link" className="text-sm p-0 h-auto">Mark all as read</Button>
                                    </div>
                                    <div className='flex flex-col gap-2 max-h-80 overflow-y-auto'>
                                        {
                                            notifications.length === 0 ? (
                                                <p className='text-sm text-muted-foreground'>No notifications</p>
                                            ) : (
                                                notifications.map((notification) => (
                                                    <div
                                                        key={notification._id}
                                                        onClick={() => markOneReadHandler(notification)}
                                                        className={`flex items-start gap-2 p-2 rounded-md cursor-pointer ${notification.isRead ? '' : 'bg-gray-100'}`}
                                                    >
                                                        {
                                                            !notification.isRead && (
                                                                <span className='mt-1.5 h-2 w-2 rounded-full bg-red-600 flex-shrink-0'></span>
                                                            )
                                                        }
                                                        <div>
                                                            <p className={notification.isRead ? 'text-sm text-gray-600' : 'text-sm font-bold'}>{notification.message}</p>
                                                            <p className='text-xs text-muted-foreground'>{formatDate(notification.createdAt)}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )
                                        }
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )
                    }
                    {
                        !user ? (
                            <div className='flex items-center gap-2'>
                                <Link to="/login"><Button variant="outline">Login</Button></Link>
                                <Link to="/signup"><Button className="bg-[#6A38C2] hover:bg-[#5b30a6]">Signup</Button></Link>
                            </div>
                        ) : (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Avatar className="cursor-pointer">
                                        <AvatarImage src={user?.profile?.profilePhoto} alt="@shadcn" />
                                    </Avatar>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <div className=''>
                                        <div className='flex gap-2 space-y-2'>
                                            <Avatar className="cursor-pointer">
                                                <AvatarImage src={user?.profile?.profilePhoto} alt="@shadcn" />
                                            </Avatar>
                                            <div>
                                                <h4 className='font-medium'>{user?.fullname}</h4>
                                                <p className='text-sm text-muted-foreground'>{user?.profile?.bio}</p>
                                            </div>
                                        </div>
                                        <div className='flex flex-col my-2 text-gray-600'>
                                            {
                                                user && user.role === 'student' && (
                                                    <>
                                                        <div className='flex w-fit items-center gap-2 cursor-pointer'>
                                                            <User2 />
                                                            <Button variant="link"> <Link to="/profile">View Profile</Link></Button>
                                                        </div>
                                                        <div className='flex w-fit items-center gap-2 cursor-pointer'>
                                                            <Bookmark />
                                                            <Button variant="link"> <Link to="/saved-jobs">Saved Jobs</Link></Button>
                                                        </div>
                                                    </>
                                                )
                                            }

                                            <div className='flex w-fit items-center gap-2 cursor-pointer'>
                                                <LogOut />
                                                <Button onClick={logoutHandler} variant="link">Logout</Button>
                                            </div>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )
                    }

                </div>
            </div>

        </div>
    )
}

export default Navbar
