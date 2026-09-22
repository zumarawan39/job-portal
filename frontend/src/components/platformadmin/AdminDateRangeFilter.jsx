import React from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { cn } from '@/lib/utils'

// Formats a Date as YYYY-MM-DD for <input type="date"> / API query params
const toDateInput = (date) => date.toISOString().slice(0, 10);

// Preset ranges shown as quick-pick buttons; "All time" clears the filter entirely
const PRESETS = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'All time', days: null },
];

// A small date-range filter bar: preset buttons + custom start/end date inputs.
// Controlled by the parent via `value` ({ startDate, endDate } as 'YYYY-MM-DD' strings or '')
// and reported back through `onChange`.
const AdminDateRangeFilter = ({ value, onChange, className }) => {
    const applyPreset = (days) => {
        if (days === null) {
            onChange({ startDate: '', endDate: '' });
            return;
        }
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - (days - 1));
        onChange({ startDate: toDateInput(start), endDate: toDateInput(end) });
    }

    const activePreset = (() => {
        if (!value.startDate && !value.endDate) return 'All time';
        const days = Math.round((new Date(value.endDate) - new Date(value.startDate)) / (1000 * 60 * 60 * 24)) + 1;
        const match = PRESETS.find(p => p.days === days && toDateInput(new Date()) === value.endDate);
        return match?.label;
    })();

    return (
        <div className={cn('flex flex-wrap items-center gap-2', className)}>
            <div className='flex flex-wrap gap-1'>
                {PRESETS.map((preset) => (
                    <Button
                        key={preset.label}
                        type='button'
                        size='sm'
                        variant={activePreset === preset.label ? 'default' : 'outline'}
                        onClick={() => applyPreset(preset.days)}
                    >
                        {preset.label}
                    </Button>
                ))}
            </div>
            <div className='flex items-center gap-2'>
                <Input
                    type='date'
                    value={value.startDate || ''}
                    max={value.endDate || undefined}
                    onChange={(e) => onChange({ ...value, startDate: e.target.value })}
                    className='h-9 w-[150px]'
                    aria-label='Start date'
                />
                <span className='text-sm text-muted-foreground'>to</span>
                <Input
                    type='date'
                    value={value.endDate || ''}
                    min={value.startDate || undefined}
                    onChange={(e) => onChange({ ...value, endDate: e.target.value })}
                    className='h-9 w-[150px]'
                    aria-label='End date'
                />
            </div>
        </div>
    )
}

export default AdminDateRangeFilter
