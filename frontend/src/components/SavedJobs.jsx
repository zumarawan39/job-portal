import React, { useEffect, useState } from 'react'
import Navbar from './shared/Navbar'
import Job from './Job'
import axios from 'axios'
import { JOB_API_END_POINT } from '@/utils/constant'

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
            <div className='max-w-7xl mx-auto mt-5'>
                <h1 className='font-bold text-xl my-5'>Saved Jobs</h1>
                {
                    savedJobs.length <= 0 ? (
                        <span>You haven't saved any jobs yet.</span>
                    ) : (
                        <div className='grid grid-cols-3 gap-4 pb-5'>
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
