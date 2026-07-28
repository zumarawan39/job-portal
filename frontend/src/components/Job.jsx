import React from 'react'
import { Button } from './ui/button'
import { Bookmark } from 'lucide-react'
import { Avatar, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { JOB_API_END_POINT } from '@/utils/constant'
import { toggleSavedJobIdLocally } from '@/redux/jobSlice'
import { toast } from 'sonner'

// Shows a single job card with title, company, and a Details button
const Job = ({job}) => {
    // Used to go to this job's details page when "Details" is clicked
    const navigate = useNavigate();
    const dispatch = useDispatch();
    // Read the logged-in user (to only show the save button to students) and the saved job ids
    const { user } = useSelector(store => store.auth);
    const { savedJobIds } = useSelector(store => store.job);
    const isSaved = savedJobIds.includes(job?._id);
    // const jobId = "lsekdhjgdsnfvsdkjf";

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
        return Math.floor(timeDifference/(1000*24*60*60));
    }
    
    return (
        <div className='relative p-5 rounded-md shadow-xl bg-white border border-gray-100'>
            <div className='flex items-center justify-between'>
                <p className='text-sm text-gray-500'>{daysAgoFunction(job?.createdAt) === 0 ? "Today" : `${daysAgoFunction(job?.createdAt)} days ago`}</p>
                {
                    // Only logged-in students can save jobs for later
                    user && user.role === 'student' && (
                        <Button
                            onClick={saveJobHandler}
                            variant="outline"
                            className="rounded-full"
                            size="icon"
                        >
                            <Bookmark className={isSaved ? 'fill-[#7209b7] text-[#7209b7]' : ''} />
                        </Button>
                    )
                }
            </div>

            <div className='flex items-center gap-2 my-2'>
                <Button className="p-6" variant="outline" size="icon">
                    <Avatar>
                        <AvatarImage src={job?.company?.logo} />
                    </Avatar>
                </Button>
                <div>
                    <h1 className='font-medium text-lg'>{job?.company?.name}</h1>
                    <p className='text-sm text-gray-500'>India</p>
                </div>
            </div>

            <div>
                <h1 className='font-bold text-lg my-2'>{job?.title}</h1>
                <p className='text-sm text-gray-600'>{job?.description}</p>
            </div>
            <div className='flex items-center gap-2 mt-4'>
                <Badge className={'text-blue-700 font-bold'} variant="ghost">{job?.position} Positions</Badge>
                <Badge className={'text-[#F83002] font-bold'} variant="ghost">{job?.jobType}</Badge>
                <Badge className={'text-[#7209b7] font-bold'} variant="ghost">{job?.salary}LPA</Badge>
            </div>
            <div className='flex items-center gap-4 mt-4'>
                <Button onClick={()=> navigate(`/description/${job?._id}`)} variant="outline">Details</Button>
                {
                    user && user.role === 'student' && (
                        <Button onClick={saveJobHandler} className="bg-[#7209b7]">{isSaved ? "Saved" : "Save For Later"}</Button>
                    )
                }
            </div>
        </div>
    )
}

export default Job