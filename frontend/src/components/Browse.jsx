import React, { useEffect } from 'react'
import Navbar from './shared/Navbar'
import Job from './Job';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import useGetAllJobs from '@/hooks/useGetAllJobs';

// const randomJobs = [1, 2,45];

// Shows all jobs matching the current search query, in a grid of Job cards
const Browse = () => {
    // Custom hook that fetches all jobs from the backend and stores them in Redux
    useGetAllJobs();
    // Read the fetched jobs list from the job slice of Redux state
    const {allJobs} = useSelector(store=>store.job);
    const dispatch = useDispatch();
    // Runs once on mount; the returned cleanup function clears the search query when leaving this page
    useEffect(()=>{
        return ()=>{
            // Reset the search query in Redux so it doesn't carry over to other pages
            dispatch(setSearchedQuery(""));
        }
    },[])
    return (
        <div>
            <Navbar />
            <div className='max-w-7xl mx-auto my-10'>
                <h1 className='font-bold text-xl my-10'>Search Results ({allJobs.length})</h1>
                <div className='grid grid-cols-3 gap-4'>
                    {
                        // Render a Job card for every job in the search results
                        allJobs.map((job) => {
                            return (
                                <Job key={job._id} job={job}/>
                            )
                        })
                    }
                </div>

            </div>
        </div>
    )
}

export default Browse