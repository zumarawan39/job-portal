import React from 'react'
import Navbar from './shared/Navbar'
import FilterCard from './FilterCard'
import Job from './Job';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { SearchX } from 'lucide-react';

// Shows the filter sidebar plus a grid of jobs matching the current search/filter.
// Filtering now happens on the backend (see useGetAllJobs), so this just renders
// whatever the backend already returned.
const Jobs = () => {
    // Read all (already-filtered) jobs from the job slice of Redux state
    const { allJobs } = useSelector(store => store.job);

    return (
        <div>
            <Navbar />
            <div className='max-w-7xl mx-auto mt-5 px-4'>
                <div className='flex flex-col gap-5 lg:flex-row'>
                    <div className='lg:w-[270px] lg:flex-shrink-0'>
                        <FilterCard />
                    </div>
                    {
                        // Show a proper empty state if there are no results, otherwise render the job cards
                        allJobs.length <= 0 ? (
                            <div className='flex flex-1 items-center justify-center rounded-xl border border-dashed border-border py-24'>
                                <div className='flex flex-col items-center gap-2 px-6 text-center'>
                                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
                                        <SearchX className='h-6 w-6 text-muted-foreground' />
                                    </div>
                                    <h2 className='font-display text-lg font-semibold'>No jobs found</h2>
                                    <p className='max-w-xs text-sm text-muted-foreground'>Try adjusting or clearing your filters to see more results.</p>
                                </div>
                            </div>
                        ) : (
                            <div className='flex-1 h-[88vh] overflow-y-auto pb-5'>
                                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
                                    {
                                        // Render a Job card (with fade/slide animation) for each job
                                        allJobs.map((job) => (
                                            <motion.div
                                                initial={{ opacity: 0, x: 100 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -100 }}
                                                transition={{ duration: 0.3 }}
                                                key={job?._id}>
                                                <Job job={job} />
                                            </motion.div>
                                        ))
                                    }
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>


        </div>
    )
}

export default Jobs
