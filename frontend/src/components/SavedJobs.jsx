import React, { useEffect, useState } from 'react'
import Navbar from './shared/Navbar'
import Job from './Job'
import axios from 'axios'
import { JOB_API_END_POINT } from '@/utils/constant'
import { Bookmark } from 'lucide-react'

// Simple one-off page showing all jobs the logged-in student has saved for later
const SavedJobs = () => {
    const [savedJobs, setSavedJobs] = useState([]);

    useEffect(() => {
        const fetchSavedJobs = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/saved`, { withCredentials: true });
                if (res.data.success) {
                    setSavedJobs(res.data.jobs);
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchSavedJobs();
    }, []);

    return (
        <div>
            <Navbar />
            <div className='max-w-7xl mx-auto mt-5 px-4'>
                <h1 className='font-display text-2xl font-bold my-5'>Saved Jobs</h1>
                {
                    savedJobs.length <= 0 ? (
                        <div className='flex items-center justify-center rounded-xl border border-dashed border-border py-24'>
                            <div className='flex flex-col items-center gap-2 px-6 text-center'>
                                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
                                    <Bookmark className='h-6 w-6 text-muted-foreground' />
                                </div>
                                <h2 className='font-display text-lg font-semibold'>No saved jobs yet</h2>
                                <p className='max-w-xs text-sm text-muted-foreground'>Jobs you save for later will show up here.</p>
                            </div>
                        </div>
                    ) : (
                        <div className='grid grid-cols-1 gap-4 pb-5 sm:grid-cols-2 xl:grid-cols-3'>
                            {
                                savedJobs.map((job) => (
                                    <Job key={job?._id} job={job} />
                                ))
                            }
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default SavedJobs
