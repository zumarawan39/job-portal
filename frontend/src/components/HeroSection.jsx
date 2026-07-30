import React, { useState } from 'react'
import { Button } from './ui/button'
import { MessageSquare, Search, Sparkles, Target } from 'lucide-react'
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';

const features = [
    { icon: Target, label: 'Skill-matched recommendations' },
    { icon: MessageSquare, label: 'Real-time recruiter chat' },
    { icon: Sparkles, label: 'Track every application' },
];

// Shows the big banner on the home page with a search box to look up jobs
const HeroSection = () => {
    const [query, setQuery] = useState("");
    const dispatch = useDispatch();
    // Used to go to the /browse page after searching
    const navigate = useNavigate();

    const searchJobHandler = () => {
        // Save the typed search text in Redux so the Browse page can filter jobs by it
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    }

    return (
        <div className='border-b border-border bg-gradient-to-b from-accent/40 to-background'>
            <div className='max-w-4xl mx-auto px-4 text-center'>
                <div className='flex flex-col gap-5 py-16'>
                    <span className='mx-auto flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary'>
                        <Sparkles className='h-3.5 w-3.5' /> Matched to your skills, not just keywords
                    </span>
                    <h1 className='text-4xl font-bold sm:text-5xl'>Search, Apply &amp; <br /> Get Your <span className='text-primary'>Dream Job</span></h1>
                    <p className='mx-auto max-w-lg text-muted-foreground'>
                        Browse open roles, filter by location and salary, and see exactly how your skills stack up against every listing.
                    </p>
                    <div
                        onKeyDown={(e) => e.key === 'Enter' && searchJobHandler()}
                        className='mx-auto flex w-full max-w-xl items-center gap-2 rounded-full border border-border bg-card p-1.5 pl-5 shadow-soft transition-shadow focus-within:shadow-soft-lg'
                    >
                        <Search className='h-4 w-4 flex-shrink-0 text-muted-foreground' />
                        <input
                            type="text"
                            placeholder='Job title, skill, or company'
                            onChange={(e) => setQuery(e.target.value)}
                            className='w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground'
                        />
                        <Button onClick={searchJobHandler} className="rounded-full flex-shrink-0">
                            Search
                        </Button>
                    </div>
                    <div className='mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2'>
                        {
                            features.map(({ icon: Icon, label }) => (
                                <span key={label} className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                                    <Icon className='h-4 w-4 text-primary' /> {label}
                                </span>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HeroSection
