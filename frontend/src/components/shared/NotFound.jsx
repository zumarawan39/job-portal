import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/button'

// Shown for any URL that doesn't match a known route, or when a route itself throws while rendering
const NotFound = () => {
    return (
        <div className='flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/30 px-4 text-center'>
            <h1 className='font-display text-6xl font-bold text-primary'>404</h1>
            <p className='text-lg font-semibold'>This page doesn't exist.</p>
            <p className='max-w-sm text-sm text-muted-foreground'>The link may be broken, or the page may have been moved.</p>
            <Button asChild className='mt-2'>
                <Link to='/'>Back to home</Link>
            </Button>
        </div>
    )
}

export default NotFound
