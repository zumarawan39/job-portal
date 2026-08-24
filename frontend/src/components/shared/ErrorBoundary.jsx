import React from 'react'
import { Button } from '../ui/button'

// Catches uncaught render errors anywhere below it in the tree and shows a fallback
// UI instead of leaving the user with a blank white screen.
class ErrorBoundary extends React.Component {
    state = { hasError: false }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    componentDidCatch(error, info) {
        console.error("Uncaught render error:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className='flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/30 px-4 text-center'>
                    <h1 className='font-display text-2xl font-bold'>Something went wrong.</h1>
                    <p className='max-w-sm text-sm text-muted-foreground'>An unexpected error occurred. Try reloading the page.</p>
                    <Button onClick={() => window.location.reload()} className='mt-2'>Reload page</Button>
                </div>
            )
        }
        return this.props.children;
    }
}

export default ErrorBoundary
