import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

// Shared shell for the recruiter panel and the platform-admin dashboard: a left sidebar
// of section links (given via the `nav` prop) plus a content area with an optional
// title/description/actions header. Sits below the normal <Navbar/>, it doesn't replace it.
const DashboardLayout = ({ title, description, nav, actions, children }) => {
    const location = useLocation();

    return (
        <div className='min-h-[calc(100vh-4rem)] bg-muted/30'>
            <div className='max-w-7xl mx-auto px-4 py-8 md:flex md:items-start md:gap-8'>
                <aside className='mb-6 md:mb-0 md:w-56 md:flex-shrink-0'>
                    <nav className='flex gap-2 overflow-x-auto pb-2 md:flex-col md:overflow-visible md:pb-0'>
                        {
                            nav.map((item) => {
                                const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        className={cn(
                                            'flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                            active
                                                ? 'bg-primary text-primary-foreground shadow-soft'
                                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                        )}
                                    >
                                        {Icon && <Icon className='h-4 w-4' />}
                                        {item.label}
                                    </Link>
                                )
                            })
                        }
                    </nav>
                </aside>
                <div className='min-w-0 flex-1'>
                    {
                        (title || actions) && (
                            <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                                <div>
                                    {title && <h1 className='text-2xl font-bold'>{title}</h1>}
                                    {description && <p className='mt-1 text-sm text-muted-foreground'>{description}</p>}
                                </div>
                                {actions && <div className='flex items-center gap-2'>{actions}</div>}
                            </div>
                        )
                    }
                    {children}
                </div>
            </div>
        </div>
    )
}

export default DashboardLayout
