import React from 'react'
import { Button } from './ui/button'
import { Bookmark, MapPin } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { JOB_API_END_POINT } from '@/utils/constant'
import { toggleSavedJobIdLocally } from '@/redux/jobSlice'
import { toast } from 'sonner'
import MatchScore, { computeSkillMatch } from './shared/MatchScore'
import { cn } from '@/lib/utils'

// Shows a single job card with title, company, and a Details button
const Job = ({ job }) => {
    // Used to go to this job's details page when "Details" is clicked
    const navigate = useNavigate();
    const dispatch = useDispatch();
    // Read the logged-in user (to only show the save button to students) and the saved job ids
    const { user } = useSelector(store => store.auth);
    const { savedJobIds = [] } = useSelector(store => store.job);
    const isSaved = savedJobIds.includes(job?._id);
    const isStudent = user?.role === 'student';
    const skillMatch = isStudent ? computeSkillMatch(user?.profile?.skills, job) : null;

    // Toggles whether this job is saved for later by the logged-in student
    const saveJobHandler = async () => {
        try {
            const res = await axios.post(`${JOB_API_END_POINT}/save/${job?._id}`, {}, { withCredentials: true });
            if (res.data.success) {
                dispatch(toggleSavedJobIdLocally(job?._id));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    }

    // Calculates how many days ago the job was posted
    const daysAgoFunction = (mongodbTime) => {
        const createdAt = new Date(mongodbTime);
        const currentTime = new Date();
        const timeDifference = currentTime - createdAt;
        return Math.floor(timeDifference / (1000 * 24 * 60 * 60));
    }

    return (
        <div className='relative flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-soft-lg'>
            <div className='flex items-center justify-between'>
                <p className='text-xs font-medium text-muted-foreground'>{daysAgoFunction(job?.createdAt) === 0 ? "Today" : `${daysAgoFunction(job?.createdAt)} days ago`}</p>
                {
                    // Only logged-in students can save jobs for later
                    isStudent && (
                        <Button
                            onClick={saveJobHandler}
                            variant="outline"
                            className="rounded-full"
                            size="icon"
                            aria-label={isSaved ? 'Unsave job' : 'Save job for later'}
                        >
                            <Bookmark className={cn('h-4 w-4', isSaved && 'fill-primary text-primary')} />
                        </Button>
                    )
                }
            </div>

            <div className='flex items-center gap-3 my-3'>
                <Avatar className="h-11 w-11 rounded-lg border border-border">
                    <AvatarImage src={job?.company?.logo} className="object-contain" />
                    <AvatarFallback className="rounded-lg bg-accent text-sm font-semibold text-accent-foreground">
                        {job?.company?.name?.charAt(0)?.toUpperCase() || '?'}
                    </AvatarFallback>
                </Avatar>
                <div className='min-w-0'>
                    <h2 className='truncate font-medium leading-tight'>{job?.company?.name}</h2>
                    <p className='flex items-center gap-1 text-sm text-muted-foreground'>
                        <MapPin className='h-3 w-3' /> {job?.location || 'Remote'}
                    </p>
                </div>
            </div>

            <div className='flex-1'>
                <h1 className='font-bold text-lg leading-snug'>{job?.title}</h1>
                <p className='mt-1 line-clamp-2 text-sm text-muted-foreground'>{job?.description}</p>
            </div>

            {
                skillMatch && (
                    <MatchScore matched={skillMatch.matched} total={skillMatch.total} className="mt-3" />
                )
            }

            <div className='flex flex-wrap items-center gap-2 mt-4'>
                <Badge variant="secondary" className="font-semibold">{job?.position} Positions</Badge>
                <Badge variant="outline" className="font-semibold text-primary border-primary/30">{job?.jobType}</Badge>
                <Badge variant="outline" className="font-mono font-semibold text-brand-orange border-brand-orange/30">{job?.salary} LPA</Badge>
            </div>
            <div className='flex items-center gap-3 mt-4'>
                <Button onClick={() => navigate(`/description/${job?._id}`)} variant="outline" className="flex-1">Details</Button>
                {
                    isStudent && (
                        <Button onClick={saveJobHandler} className="flex-1">{isSaved ? "Saved" : "Save For Later"}</Button>
                    )
                }
            </div>
        </div>
    )
}

export default Job
