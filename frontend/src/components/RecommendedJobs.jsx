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
        <div className='max-w-7xl mx-auto my-20 px-4'>
            <h1 className='text-3xl font-bold'><span className='text-primary'>Recommended</span> For You</h1>
            <p className='mt-1 text-sm text-muted-foreground'>Based on the skills listed on your profile.</p>
            <div className='grid grid-cols-1 gap-5 my-6 sm:grid-cols-2 lg:grid-cols-3'>
                {
                    recommendedJobs.slice(0, 6).map((job) => <Job key={job._id} job={job} />)
                }
            </div>
        </div>
    )
}

export default RecommendedJobs
