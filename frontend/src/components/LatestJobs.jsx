import React from 'react'
import Job from './Job';
import { useSelector } from 'react-redux';

// Shows the latest 6 job openings on the home page
const LatestJobs = () => {
    // Read all jobs from the job slice of Redux state
    const { allJobs } = useSelector(store => store.job);

    return (
        <div className='max-w-7xl mx-auto my-20 px-4'>
            <h1 className='text-3xl font-bold'>Latest &amp; Top <span className='text-primary'>Job Openings</span></h1>
            <div className='grid grid-cols-1 gap-5 my-6 sm:grid-cols-2 lg:grid-cols-3'>
                {
                    // Show a message if there are no jobs, otherwise show a card for the first 6 jobs
                    allJobs.length <= 0 ? <span className='text-muted-foreground'>No jobs available yet.</span> : allJobs?.slice(0, 6).map((job) => <Job key={job._id} job={job} />)
                }
            </div>
        </div>
    )
}

export default LatestJobs
