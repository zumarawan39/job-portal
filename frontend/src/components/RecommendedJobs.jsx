import React from 'react'
import Job from './Job';
import { useSelector } from 'react-redux';
import useGetRecommendedJobs from '@/hooks/useGetRecommendedJobs';

// Shows a "Recommended For You" section on the home page with skill-based job matches
// for the logged-in student. Renders nothing for recruiters, admins, or logged-out users.
const RecommendedJobs = () => {
    // Fetches the recommended jobs for the logged-in student and stores them in Redux
    useGetRecommendedJobs();
    const { recommendedJobs } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);

    if (!(user && user.role === 'student') || recommendedJobs.length === 0) {
        return null;
    }

    return (
        <div className='max-w-7xl mx-auto my-20'>
            <h1 className='text-4xl font-bold'><span className='text-[#6A38C2]'>Recommended </span>For You</h1>
            <div className='grid grid-cols-3 gap-4 my-5'>
                {
                    recommendedJobs.slice(0, 6).map((job) => <Job key={job._id} job={job} />)
                }
            </div>
        </div>
    )
}

export default RecommendedJobs
