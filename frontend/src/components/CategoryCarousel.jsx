import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { Button } from './ui/button';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSearchedQuery } from '@/redux/jobSlice';

// List of job categories shown as clickable buttons in the carousel
const category = [
    "Frontend Developer",
    "Backend Developer",
    "Data Science",
    "Graphic Designer",
    "FullStack Developer"
]

// Shows a scrollable carousel of job category buttons on the home page
const CategoryCarousel = () => {
    const dispatch = useDispatch();
    // Used to go to the /browse page after picking a category
    const navigate = useNavigate();
    const searchJobHandler = (query) => {
        // Save the chosen category as the search query so the Browse page can filter jobs by it
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    }

    return (
        <div className='max-w-2xl mx-auto my-16 px-4'>
            <p className='mb-4 text-center text-sm font-medium text-muted-foreground'>Or browse by category</p>
            <Carousel className="w-full">
                <CarouselContent>
                    {
                        // Render a carousel item with a button for each category
                        category.map((cat, index) => (
                            <CarouselItem key={cat} className="basis-auto">
                                <Button onClick={()=>searchJobHandler(cat)} variant="outline" className="rounded-full hover:border-primary hover:bg-accent hover:text-accent-foreground">{cat}</Button>
                            </CarouselItem>
                        ))
                    }
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </div>
    )
}

export default CategoryCarousel