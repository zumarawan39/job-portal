import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader } from '../ui/card'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { setUser } from '@/redux/authSlice'
import { Loader2 } from 'lucide-react'

// Second step of login when the account has two-factor auth enabled:
// user enters the 6-digit code that was emailed to them
const VerifyOtp = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const userId = location.state?.userId;

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    // If someone lands on this page directly (no userId passed along), send them back to login
    useEffect(() => {
        if (!userId) {
            navigate("/login");
        }
    }, [userId, navigate]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post(`${USER_API_END_POINT}/verify-otp`, { userId, otp }, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });
            if (res.data.success) {
                dispatch(setUser(res.data.user));
                navigate("/");
                toast.success(res.data.message);
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
                        <h1 className='text-2xl font-bold'>Verify Your Identity</h1>
                        <p className='text-sm text-muted-foreground'>Enter the 6-digit code sent to your email</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submitHandler} className='space-y-4'>
                            <div className='space-y-2'>
                                <Label>Verification code</Label>
                                <Input
                                    type="text"
                                    value={otp}
                                    name="otp"
                                    maxLength={6}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="123456"
                                    className='text-center font-mono text-lg tracking-[0.5em]'
                                />
                            </div>
                            {
                                loading ? <Button className="w-full"> <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait </Button> : <Button type="submit" className="w-full">Verify</Button>
                            }
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default VerifyOtp
