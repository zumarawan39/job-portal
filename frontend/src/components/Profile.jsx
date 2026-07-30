import React, { useState } from 'react'
import Navbar from './shared/Navbar'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Contact, Mail, Pen } from 'lucide-react'
import { Badge } from './ui/badge'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import AppliedJobTable from './AppliedJobTable'
import UpdateProfileDialog from './UpdateProfileDialog'
import { useDispatch, useSelector } from 'react-redux'
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { toast } from 'sonner'

// const skills = ["Html", "Css", "Javascript", "Reactjs"]
const isResume = true;

// Shows the logged-in user's profile info, skills, resume, and their applied jobs
const Profile = () => {
    // Custom hook that fetches the user's applied jobs from the backend and stores them in Redux
    useGetAppliedJobs();
    // Controls whether the update-profile dialog is shown
    const [open, setOpen] = useState(false);
    // Read the logged-in user from the auth slice of Redux state
    const {user} = useSelector(store=>store.auth);
    const dispatch = useDispatch();

    // Turns two-factor (email OTP) login on/off for this account
    const twoFactorChangeHandler = async () => {
        try {
            const res = await axios.post(`${USER_API_END_POINT}/two-factor`, { enabled: !user?.twoFactorEnabled }, { withCredentials: true });
            if (res.data.success) {
                dispatch(setUser({ ...user, twoFactorEnabled: res.data.twoFactorEnabled }));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    }

    return (
        <div className='min-h-screen bg-background'>
            <Navbar />
            <div className='max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6'>
                <Card>
                    <CardContent className="p-8">
                        <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
                            <div className='flex items-center gap-4'>
                                <Avatar className="h-24 w-24 border border-border">
                                    {
                                        user?.profile?.profilePhoto ? (
                                            <AvatarImage src={user.profile.profilePhoto} alt={user?.fullname} />
                                        ) : null
                                    }
                                    <AvatarFallback className="bg-accent text-2xl font-semibold text-accent-foreground">
                                        {user?.fullname?.charAt(0)?.toUpperCase() || '?'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h1 className='text-xl font-semibold'>{user?.fullname}</h1>
                                    <p className='text-sm text-muted-foreground'>{user?.profile?.bio}</p>
                                </div>
                            </div>
                            <Button onClick={() => setOpen(true)} variant="outline" size="icon" aria-label="Edit profile">
                                <Pen className='h-4 w-4' />
                            </Button>
                        </div>

                        <div className='flex items-center gap-2 mt-6'>
                            <label className='relative inline-flex cursor-pointer items-center'>
                                <input
                                    type="checkbox"
                                    className='peer sr-only'
                                    checked={user?.twoFactorEnabled || false}
                                    onChange={twoFactorChangeHandler}
                                />
                                <span className='h-6 w-11 rounded-full bg-muted transition-colors peer-checked:bg-primary after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-background after:shadow-sm after:transition-transform after:content-[""] peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2'></span>
                            </label>
                            <Label className="cursor-default">Enable two-factor login (email code)</Label>
                        </div>

                        <div className='mt-6 flex flex-col gap-2 text-sm'>
                            <div className='flex items-center gap-3'>
                                <Mail className='h-4 w-4 text-muted-foreground' />
                                <span>{user?.email}</span>
                            </div>
                            <div className='flex items-center gap-3'>
                                <Contact className='h-4 w-4 text-muted-foreground' />
                                <span>{user?.phoneNumber}</span>
                            </div>
                        </div>

                        <div className='mt-6'>
                            <h2 className='text-sm font-semibold'>Skills</h2>
                            <div className='mt-2 flex flex-wrap items-center gap-1.5'>
                                {
                                    // Show each skill as a badge, or "NA" if the user has no skills listed
                                    user?.profile?.skills.length !== 0 ? user?.profile?.skills.map((item, index) => <Badge key={index} variant="secondary">{item}</Badge>) : <span className='text-sm text-muted-foreground'>NA</span>
                                }
                            </div>
                        </div>

                        <div className='mt-6'>
                            <Label className="text-sm font-semibold">Resume</Label>
                            <div className='mt-1'>
                                {
                                    // Show a link to the uploaded resume, or "NA" if there isn't one
                                    isResume ? <a target='blank' href={user?.profile?.resume} className='text-sm text-primary hover:underline cursor-pointer'>{user?.profile?.resumeOriginalName}</a> : <span className='text-sm text-muted-foreground'>NA</span>
                                }
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Applied Jobs</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {/* Applied Job Table   */}
                        <AppliedJobTable />
                    </CardContent>
                </Card>
            </div>
            <UpdateProfileDialog open={open} setOpen={setOpen}/>
        </div>
    )
}

export default Profile
