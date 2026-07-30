import React, { useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader } from './ui/card'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Briefcase, Calendar, Clock, MapPin, Users, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

// Shows full details of a single job and lets the user apply to it
const JobDescription = () => {
    // Read the currently viewed job from the job slice of Redux state
    const {singleJob} = useSelector(store => store.job);
    // Read the logged-in user from the auth slice of Redux state
    const {user} = useSelector(store=>store.auth);
    // Check if the logged-in user has already applied to this job
    const isIntiallyApplied = singleJob?.applications?.some(application => application.applicant === user?._id) || false;
    const [isApplied, setIsApplied] = useState(isIntiallyApplied);

    // Read the job id from the URL (e.g. /description/:id)
    const params = useParams();
    const jobId = params.id;
    const dispatch = useDispatch();

    // Sends a request to apply the logged-in user to this job
    const applyJobHandler = async () => {
        try {
            // Ask the backend to apply the current user to this job
            const res = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`, {withCredentials:true});

            if(res.data.success){
                setIsApplied(true); // Update the local state
                const updatedSingleJob = {...singleJob, applications:[...singleJob.applications,{applicant:user?._id}]}
                dispatch(setSingleJob(updatedSingleJob)); // helps us to real time UI update
                toast.success(res.data.message);

            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    }

    // Re-runs whenever the job id or user changes, so it loads the right job details each time
    useEffect(()=>{
        const fetchSingleJob = async () => {
            try {
                // Fetch the full details of this job from the backend
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`,{withCredentials:true});
                if(res.data.success){
                    // Store the fetched job in Redux so it can be shown on this page
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(res.data.job.applications.some(application=>application.applicant === user?._id)) // Ensure the state is in sync with fetched data
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchSingleJob();
    },[jobId,dispatch, user?._id]);

    return (
        <div className='max-w-7xl mx-auto my-10 px-4'>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                {/* Main content */}
                <Card className='lg:col-span-2'>
                    <CardHeader className='pb-4'>
                        <h1 className='font-display text-2xl font-bold leading-snug'>{singleJob?.title}</h1>
                        {
                            singleJob?.company?.name && (
                                <p className='text-sm text-muted-foreground'>{singleJob?.company?.name}</p>
                            )
                        }
                        <div className='flex flex-wrap gap-2 pt-2'>
                            <Badge variant="outline" className="gap-1.5 font-medium">
                                <Users className='h-3.5 w-3.5' /> {singleJob?.position} Positions
                            </Badge>
                            <Badge variant="outline" className="gap-1.5 font-medium">
                                <Clock className='h-3.5 w-3.5' /> {singleJob?.experienceLevel} yrs experience
                            </Badge>
                            <Badge variant="outline" className="gap-1.5 font-medium">
                                <MapPin className='h-3.5 w-3.5' /> {singleJob?.location}
                            </Badge>
                            <Badge variant="secondary" className="gap-1.5 font-medium">
                                <Briefcase className='h-3.5 w-3.5' /> {singleJob?.jobType}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className='pt-0'>
                        <div className='border-t border-border pt-5'>
                            <h2 className='mb-2 font-display text-base font-semibold'>Job Description</h2>
                            <p className='whitespace-pre-line text-sm leading-relaxed text-foreground/80'>{singleJob?.description}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Sticky summary sidebar */}
                <Card className='h-fit lg:sticky lg:top-20'>
                    <CardHeader className='pb-3'>
                        <div className='flex items-center gap-2 font-mono text-2xl font-bold text-brand-orange'>
                            <Wallet className='h-5 w-5' /> {singleJob?.salary} LPA
                        </div>
                        <p className='text-xs text-muted-foreground'>Annual salary</p>
                    </CardHeader>
                    <CardContent className='flex flex-col gap-3 pt-0'>
                        <div className='flex items-center justify-between border-t border-border pt-3 text-sm'>
                            <span className='flex items-center gap-2 text-muted-foreground'><Users className='h-4 w-4' /> Positions</span>
                            <span className='font-medium'>{singleJob?.position}</span>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                            <span className='flex items-center gap-2 text-muted-foreground'><Users className='h-4 w-4' /> Total Applicants</span>
                            <span className='font-medium'>{singleJob?.applications?.length}</span>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                            <span className='flex items-center gap-2 text-muted-foreground'><Calendar className='h-4 w-4' /> Posted Date</span>
                            <span className='font-medium'>{singleJob?.createdAt.split("T")[0]}</span>
                        </div>
                        <Button
                            onClick={isApplied ? null : applyJobHandler}
                            disabled={isApplied}
                            className={cn('mt-2 w-full', isApplied && 'cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted')}
                        >
                            {isApplied ? 'Already Applied' : 'Apply Now'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default JobDescription