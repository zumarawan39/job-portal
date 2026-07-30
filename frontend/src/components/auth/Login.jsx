import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading, setUser } from '@/redux/authSlice'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// The roles a user can log in as, rendered as selectable pill buttons below
const ROLE_OPTIONS = [
    { value: 'student', label: 'Student' },
    { value: 'recruiter', label: 'Recruiter' },
    { value: 'admin', label: 'Admin' },
];

// Login form where users enter email/password and pick their role (student or recruiter)
const Login = () => {
    const [input, setInput] = useState({
        email: "",
        password: "",
        role: "",
    });
    // Read whether a login request is in progress, and the currently logged-in user, from Redux
    const { loading,user } = useSelector(store => store.auth);
    // Lets us redirect to the home page after logging in
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Update form state whenever an input (email, password, role) changes
    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    // Sends the login form data to the backend and logs the user in if it's valid
    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            // Show the loading spinner while the request is in flight
            dispatch(setLoading(true));
            // Send login credentials to the backend and check if they're valid
            const res = await axios.post(`${USER_API_END_POINT}/login`, input, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true,
            });
            if (res.data.requiresTwoFactor) {
                // Account has 2FA enabled: no cookie was set yet, send the user to enter their OTP
                toast.success(res.data.message);
                navigate("/verify-otp", { state: { userId: res.data.userId } });
            } else if (res.data.success) {
                // Save the logged-in user in Redux so the rest of the app knows who's logged in
                dispatch(setUser(res.data.user));
                navigate("/");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        } finally {
            dispatch(setLoading(false));
        }
    }
    // If a user is already logged in, skip the login page and go straight home
    useEffect(()=>{
        if(user){
            navigate("/");
        }
    },[])
    return (
        <div className='min-h-screen bg-muted/30'>
            <Navbar />
            <div className='flex items-center justify-center px-4 py-16'>
                <Card className='w-full max-w-md shadow-soft-lg'>
                    <CardHeader className='space-y-1 text-center'>
                        <h1 className='text-2xl font-bold'>Welcome back</h1>
                        <p className='text-sm text-muted-foreground'>Login to your account to continue</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submitHandler} className='space-y-4'>
                            <div className='space-y-2'>
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={input.email}
                                    name="email"
                                    onChange={changeEventHandler}
                                    placeholder="patel@gmail.com"
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label>Password</Label>
                                <Input
                                    type="password"
                                    value={input.password}
                                    name="password"
                                    onChange={changeEventHandler}
                                    placeholder="Enter your password"
                                />
                                <Link to="/forgot-password" className='inline-block text-sm text-primary hover:underline'>Forgot password?</Link>
                            </div>

                            <div className='space-y-2'>
                                <Label>Login as</Label>
                                <div className='flex flex-wrap gap-2'>
                                    {ROLE_OPTIONS.map((role) => (
                                        <label key={role.value} className='cursor-pointer'>
                                            <input
                                                type="radio"
                                                name="role"
                                                value={role.value}
                                                checked={input.role === role.value}
                                                onChange={changeEventHandler}
                                                className='sr-only'
                                            />
                                            <span
                                                className={cn(
                                                    'inline-flex select-none items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                                                    input.role === role.value
                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                        : 'border-border bg-background text-foreground/80 hover:bg-accent hover:text-accent-foreground'
                                                )}
                                            >
                                                {role.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {
                                // Show a spinner button while logging in, otherwise show the normal submit button
                                loading ? <Button className="w-full"> <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait </Button> : <Button type="submit" className="w-full">Login</Button>
                            }
                        </form>
                    </CardContent>
                    <CardFooter className='justify-center'>
                        <span className='text-sm text-muted-foreground'>Don't have an account? <Link to="/signup" className='font-medium text-primary hover:underline'>Signup</Link></span>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

export default Login
