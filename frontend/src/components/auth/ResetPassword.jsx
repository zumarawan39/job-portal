import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader } from '../ui/card'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

// Form where a user sets a new password using the reset token from the emailed link
const ResetPassword = () => {
    const { token } = useParams();
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post(`${USER_API_END_POINT}/reset-password/${token}`, { password }, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });
            if (res.data.success) {
                toast.success(res.data.message);
                navigate("/login");
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
                        <h1 className='text-2xl font-bold'>Reset Password</h1>
                        <p className='text-sm text-muted-foreground'>Choose a new password for your account</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submitHandler} className='space-y-4'>
                            <div className='space-y-2'>
                                <Label>New Password</Label>
                                <Input
                                    type="password"
                                    value={password}
                                    name="password"
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter new password"
                                />
                            </div>
                            {
                                loading ? <Button className="w-full"> <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait </Button> : <Button type="submit" className="w-full">Reset Password</Button>
                            }
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default ResetPassword
