import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Avatar, AvatarImage } from '../ui/avatar'
import { LogOut, User2, Bell, Bookmark, LayoutDashboard } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { USER_API_END_POINT, NOTIFICATION_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { markAllReadLocally, markOneReadLocally } from '@/redux/notificationSlice'
import useGetNotifications from '@/hooks/useGetNotifications'
import useGetSavedJobs from '@/hooks/useGetSavedJobs'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Top navigation bar shown on every page, with links and login/logout controls
const Navbar = () => {
    // Fetches the logged-in user's notifications and keeps them in Redux
    useGetNotifications();
    // Fetches the logged-in student's saved job ids and keeps them in Redux
    useGetSavedJobs();
    // Read the logged-in user from Redux (null if nobody is logged in), used to decide what links/buttons to show
    const { user } = useSelector(store => store.auth);
    // Read notifications + unread count from the notification slice
    const { notifications, unreadCount } = useSelector(store => store.notification);
    const dispatch = useDispatch();
    // Lets us send the user to the home page after logging out
    const navigate = useNavigate();
    // Used to highlight whichever nav link matches the current page
    const location = useLocation();

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

    // Logs the user out by clearing their session on the backend and in Redux
    const logoutHandler = async () => {
        try {
            // Ask the backend to clear the login session/cookie
            const res = await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true });
            if (res.data.success) {
                // Clear the logged-in user from Redux so the app treats us as logged out
                dispatch(setUser(null));
                navigate("/");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    }
    // Public job-seeker links (used for logged-out visitors and students)
    const publicLinks = [
        { to: '/', label: 'Home' },
        { to: '/jobs', label: 'Jobs' },
        { to: '/browse', label: 'Browse' },
    ];
    const isLinkActive = (to) => location.pathname === to;

    return (
        <div className='sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80'>
            <div className='flex items-center justify-between mx-auto max-w-7xl h-16 px-4'>
                <Link to='/' className='font-display text-2xl font-bold tracking-tight'>
                    Job<span className='text-brand-orange'>Portal</span>
                </Link>
                <div className='flex items-center gap-8'>
                    <ul className='hidden font-medium items-center gap-1 md:flex'>
                        {
                            // Show the right nav links depending on the logged-in user's role:
                            // real platform admins and recruiters get a single Dashboard link
                            // (their sidebar handles deeper navigation from there), everyone
                            // else (students / logged-out) gets the normal job-seeker links
                            user && user.role === 'admin' ? (
                                <li>
                                    <Link
                                        to='/platform-admin'
                                        className={cn(
                                            'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm transition-colors',
                                            isLinkActive('/platform-admin') ? 'text-primary' : 'text-foreground/80 hover:text-foreground'
                                        )}
                                    >
                                        <LayoutDashboard className='h-4 w-4' /> Admin Dashboard
                                    </Link>
                                </li>
                            ) : user && user.role === 'recruiter' ? (
                                <li>
                                    <Link
                                        to='/admin/companies'
                                        className={cn(
                                            'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm transition-colors',
                                            location.pathname.startsWith('/admin') ? 'text-primary' : 'text-foreground/80 hover:text-foreground'
                                        )}
                                    >
                                        <LayoutDashboard className='h-4 w-4' /> Dashboard
                                    </Link>
                                </li>
                            ) : (
                                publicLinks.map((link) => (
                                    <li key={link.to}>
                                        <Link
                                            to={link.to}
                                            className={cn(
                                                'rounded-md px-3 py-2 text-sm transition-colors',
                                                isLinkActive(link.to) ? 'text-primary' : 'text-foreground/80 hover:text-foreground'
                                            )}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))
                            )
                        }
                    </ul>
                    {
                        // Show a notification bell for any logged-in user (student, recruiter, or admin)
        user && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button className='relative flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-accent hover:text-accent-foreground' aria-label="Notifications">
                                        <Bell className='h-5 w-5' />
                                        {
                                            unreadCount > 0 && (
                                                <span className='absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground'>
                                                    {unreadCount}
                                                </span>
                                            )
                                        }
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <div className='flex items-center justify-between mb-2'>
                                        <h4 className='font-medium'>Notifications</h4>
                                        <Button onClick={markAllReadHandler} variant="link" className="text-sm p-0 h-auto">Mark all as read</Button>
                                    </div>
                                    <div className='flex flex-col gap-1 max-h-80 overflow-y-auto'>
                                        {
                                            notifications.length === 0 ? (
                                                <p className='text-sm text-muted-foreground py-4 text-center'>No notifications yet</p>
                                            ) : (
                                                notifications.map((notification) => (
                                                    <div
                                                        key={notification._id}
                                                        onClick={() => markOneReadHandler(notification)}
                                                        className={cn(
                                                            'flex items-start gap-2 rounded-md p-2 cursor-pointer transition-colors hover:bg-accent',
                                                            !notification.isRead && 'bg-accent/60'
                                                        )}
                                                    >
                                                        {
                                                            !notification.isRead && (
                                                                <span className='mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0'></span>
                                                            )
                                                        }
                                                        <div>
                                                            <p className={notification.isRead ? 'text-sm text-muted-foreground' : 'text-sm font-semibold'}>{notification.message}</p>
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
                        // If nobody is logged in, show Login/Signup buttons, otherwise show the user's profile menu
                        !user ? (
                            <div className='flex items-center gap-2'>
                                <Link to="/login"><Button variant="outline">Login</Button></Link>
                                <Link to="/signup"><Button>Signup</Button></Link>
                            </div>
                        ) : (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Avatar className="cursor-pointer ring-1 ring-border">
                                        <AvatarImage src={user?.profile?.profilePhoto} alt={user?.fullname} />
                                    </Avatar>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <div className=''>
                                        <div className='flex gap-3'>
                                            <Avatar className="cursor-pointer">
                                                <AvatarImage src={user?.profile?.profilePhoto} alt={user?.fullname} />
                                            </Avatar>
                                            <div className='min-w-0'>
                                                <h4 className='font-medium truncate'>{user?.fullname}</h4>
                                                <p className='text-sm text-muted-foreground truncate'>{user?.profile?.bio || user?.email}</p>
                                            </div>
                                        </div>
                                        <div className='flex flex-col my-2 text-foreground/80'>
                                            {
                                                // Only students get a "View Profile" link (recruiters don't have a public profile page)
                                                user && user.role === 'student' && (
                                                    <>
                                                        <Link to="/profile" className='flex items-center gap-2 rounded-md px-2 py-1.5 -mx-2 hover:bg-accent hover:text-accent-foreground transition-colors'>
                                                            <User2 className='h-4 w-4' />
                                                            <span className='text-sm'>View Profile</span>
                                                        </Link>
                                                        <Link to="/saved-jobs" className='flex items-center gap-2 rounded-md px-2 py-1.5 -mx-2 hover:bg-accent hover:text-accent-foreground transition-colors'>
                                                            <Bookmark className='h-4 w-4' />
                                                            <span className='text-sm'>Saved Jobs</span>
                                                        </Link>
                                                    </>
                                                )
                                            }

                                            <button onClick={logoutHandler} className='flex items-center gap-2 rounded-md px-2 py-1.5 -mx-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors'>
                                                <LogOut className='h-4 w-4' />
                                                <span className='text-sm'>Logout</span>
                                            </button>
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
