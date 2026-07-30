import React, { useEffect } from 'react'
import Navbar from './shared/Navbar'
import Job from './Job';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import { SearchX } from 'lucide-react';

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
            <div className='max-w-7xl mx-auto my-10 px-4'>
                <h1 className='font-display text-2xl font-bold'>Search Results <span className='text-muted-foreground'>({allJobs.length})</span></h1>
                {
                    allJobs.length <= 0 ? (
                        <div className='mt-8 flex items-center justify-center rounded-xl border border-dashed border-border py-24'>
                            <div className='flex flex-col items-center gap-2 px-6 text-center'>
                                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
                                    <SearchX className='h-6 w-6 text-muted-foreground' />
                                </div>
                                <h2 className='font-display text-lg font-semibold'>No results found</h2>
                                <p className='max-w-xs text-sm text-muted-foreground'>Try a different search term to find what you're looking for.</p>
                            </div>
                        </div>
                    ) : (
                        <div className='grid grid-cols-1 gap-4 mt-6 sm:grid-cols-2 xl:grid-cols-3'>
                            {
                                // Render a Job card for every job in the search results
                                allJobs.map((job) => {
                                    return (
                                        <Job key={job._id} job={job}/>
                                    )
                                })
                            }
                        </div>
                    )
                }

            </div>
        </div>
    )
}

export default Browse