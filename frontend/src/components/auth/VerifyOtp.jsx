import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
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
        <div>
            <Navbar />
            <div className='flex items-center justify-center max-w-7xl mx-auto'>
                <form onSubmit={submitHandler} className='w-1/2 border border-gray-200 rounded-md p-4 my-10'>
                    <h1 className='font-bold text-xl mb-5'>Verify Your Identity</h1>
                    <div className='my-2'>
                        <Label>Enter the 6-digit code sent to your email</Label>
                        <Input
                            type="text"
                            value={otp}
                            name="otp"
                            maxLength={6}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="123456"
                        />
                    </div>
                    {
                        loading ? <Button className="w-full my-4"> <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait </Button> : <Button type="submit" className="w-full my-4">Verify</Button>
                    }
                </form>
            </div>
        </div>
    )
}

export default VerifyOtp
