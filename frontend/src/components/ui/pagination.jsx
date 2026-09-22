// Simple page-number pagination control: Prev/Next plus a small window of page numbers
import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

// Builds the list of page numbers to show, collapsing far-away pages into "..."
const getPageItems = (page, totalPages) => {
    const items = [];
    const windowSize = 1;
    const start = Math.max(2, page - windowSize);
    const end = Math.min(totalPages - 1, page + windowSize);

    items.push(1);
    if (start > 2) items.push('ellipsis-start');
    for (let p = start; p <= end; p++) items.push(p);
    if (end < totalPages - 1) items.push('ellipsis-end');
    if (totalPages > 1) items.push(totalPages);

    return items;
}

const Pagination = ({ page, totalPages, total, limit, onPageChange, className }) => {
    if (!totalPages || totalPages <= 1) return null;

    const items = getPageItems(page, totalPages);
    const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
    const rangeEnd = Math.min(page * limit, total);

    return (
        <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
            {typeof total === 'number' && (
                <p className='text-sm text-muted-foreground'>
                    Showing {rangeStart}-{rangeEnd} of {total}
                </p>
            )}
            <div className='flex items-center gap-1'>
                <Button
                    variant='outline'
                    size='icon'
                    className='h-8 w-8'
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                    aria-label='Previous page'
                >
                    <ChevronLeft className='h-4 w-4' />
                </Button>
                {items.map((item, idx) =>
                    typeof item === 'number' ? (
                        <Button
                            key={item}
                            variant={item === page ? 'default' : 'outline'}
                            size='icon'
                            className='h-8 w-8'
                            onClick={() => onPageChange(item)}
                        >
                            {item}
                        </Button>
                    ) : (
                        <span key={item + idx} className='px-1 text-sm text-muted-foreground'>...</span>
                    )
                )}
                <Button
                    variant='outline'
                    size='icon'
                    className='h-8 w-8'
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                    aria-label='Next page'
                >
                    <ChevronRight className='h-4 w-4' />
                </Button>
            </div>
        </div>
    )
}

export { Pagination }
