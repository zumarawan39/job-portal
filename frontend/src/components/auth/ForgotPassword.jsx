import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

// Simple form where a user enters their email to request a password reset link
const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post(`${USER_API_END_POINT}/forgot-password`, { email }, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });
            if (res.data.success) {
                toast.success(res.data.message);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='min-h-screen bg-muted/30'>
            <Navbar />
            <div className='flex items-center justify-center px-4 py-16'>
                <Card className='w-full max-w-md shadow-soft-lg'>
                    <CardHeader className='space-y-1 text-center'>
                        <h1 className='text-2xl font-bold'>Forgot Password</h1>
                        <p className='text-sm text-muted-foreground'>Enter your email and we'll send you a reset link</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submitHandler} className='space-y-4'>
                            <div className='space-y-2'>
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={email}
                                    name="email"
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="patel@gmail.com"
                                />
                            </div>
                            {
                                loading ? <Button className="w-full"> <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait </Button> : <Button type="submit" className="w-full">Send Reset Link</Button>
                            }
                        </form>
                    </CardContent>
                    <CardFooter className='justify-center'>
                        <span className='text-sm text-muted-foreground'>Remembered your password? <Link to="/login" className='font-medium text-primary hover:underline'>Login</Link></span>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

export default ForgotPassword
