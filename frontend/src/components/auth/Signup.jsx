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
import { setLoading } from '@/redux/authSlice'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// The roles a new user can sign up as, rendered as selectable pill buttons below
const ROLE_OPTIONS = [
    { value: 'student', label: 'Student' },
    { value: 'recruiter', label: 'Recruiter' },
];

// Signup form where new users create an account, choosing student or recruiter role
const Signup = () => {

    const [input, setInput] = useState({
        fullname: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "",
        file: ""
    });
    // Read whether a signup request is in progress, and the currently logged-in user, from Redux
    const {loading,user} = useSelector(store=>store.auth);
    const dispatch = useDispatch();
    // Lets us redirect to the login page after successful signup
    const navigate = useNavigate();

    // Update form state whenever a text input changes
    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }
    // Update form state with the selected profile picture file
    const changeFileHandler = (e) => {
        setInput({ ...input, file: e.target.files?.[0] });
    }
    // Sends the signup form data (including profile picture) to the backend to create the account
    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();    //formdata object
        formData.append("fullname", input.fullname);
        formData.append("email", input.email);
        formData.append("phoneNumber", input.phoneNumber);
        formData.append("password", input.password);
        formData.append("role", input.role);
        if (input.file) {
            formData.append("file", input.file);
        }

        try {
            // Show the loading spinner while the request is in flight
            dispatch(setLoading(true));
            // Register a new user account on the backend (multipart because it includes a file)
            const res = await axios.post(`${USER_API_END_POINT}/register`, formData, {
                headers: { 'Content-Type': "multipart/form-data" },
                withCredentials: true,
            });
            if (res.data.success) {
                // Send the new user to the login page so they can sign in
                navigate("/login");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        } finally{
            dispatch(setLoading(false));
        }
    }

    // If a user is already logged in, skip the signup page and go straight home
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
                        <h1 className='text-2xl font-bold'>Create an account</h1>
                        <p className='text-sm text-muted-foreground'>Sign up to get started with JobPortal</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submitHandler} className='space-y-4'>
                            <div className='space-y-2'>
                                <Label>Full Name</Label>
                                <Input
                                    type="text"
                                    value={input.fullname}
                                    name="fullname"
                                    onChange={changeEventHandler}
                                    placeholder="patel"
                                />
                            </div>
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
                                <Label>Phone Number</Label>
                                <Input
                                    type="text"
                                    value={input.phoneNumber}
                                    name="phoneNumber"
                                    onChange={changeEventHandler}
                                    placeholder="8080808080"
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
                            </div>
                            <div className='space-y-2'>
                                <Label>Sign up as</Label>
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
                            <div className='space-y-2'>
                                <Label>Profile Photo</Label>
                                <Input
                                    accept="image/*"
                                    type="file"
                                    onChange={changeFileHandler}
                                    className="cursor-pointer"
                                />
                            </div>
                            {
                                // Show a spinner button while signing up, otherwise show the normal submit button
                                loading ? <Button className="w-full"> <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait </Button> : <Button type="submit" className="w-full">Signup</Button>
                            }
                        </form>
                    </CardContent>
                    <CardFooter className='justify-center'>
                        <span className='text-sm text-muted-foreground'>Already have an account? <Link to="/login" className='font-medium text-primary hover:underline'>Login</Link></span>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

export default Signup
