import React, { useState } from 'react'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader } from './ui/card'
import { useDispatch, useSelector } from 'react-redux'
import { setFilters, clearFilters } from '@/redux/jobSlice'
import { PK_CITIES, INDUSTRY_OPTIONS, SALARY_RANGES } from '@/utils/jobOptions'
import { X } from 'lucide-react'

// Location and Industry filter options (sent to the backend as-is; industry values are
// matched against job title/description/requirements via a substring regex on the backend,
// so these are broad role-family words rather than exact titles). Shared with the post-job
// form via jobOptions.js so a recruiter can never post a job no filter option can reach.
const locationOptions = PK_CITIES;
const industryOptions = INDUSTRY_OPTIONS;
// Salary labels shown to the user, mapped to an explicit numeric min/max range sent to the backend
const salaryOptions = SALARY_RANGES;

// Shows radio-button filters (Location, Industry, Salary) to narrow down job search results.
// Each group keeps its own selection state so picking one group's option doesn't clear another's.
const FilterCard = () => {
    // Seed each group's visual selection from the current Redux filters (not just '') so a
    // remount (e.g. navigating away and back, or a page reload) shows the selection that's
    // actually being applied, instead of an empty-looking sidebar silently filtering results.
    const { filters } = useSelector(store => store.job);
    const [selectedLocation, setSelectedLocation] = useState(filters?.location || '');
    const [selectedIndustry, setSelectedIndustry] = useState(filters?.industry || '');
    const [selectedSalary, setSelectedSalary] = useState(() => {
        const match = SALARY_RANGES.find(
            (option) => option.salaryMin === filters?.salaryMin && option.salaryMax === filters?.salaryMax
        );
        return match?.label || '';
    });
    const dispatch = useDispatch();

    const locationChangeHandler = (value) => {
        setSelectedLocation(value);
        dispatch(setFilters({ location: value }));
    }

    const industryChangeHandler = (value) => {
        setSelectedIndustry(value);
        dispatch(setFilters({ industry: value }));
    }

    const salaryChangeHandler = (label) => {
        setSelectedSalary(label);
        const range = salaryOptions.find((option) => option.label === label);
        if (range) {
            dispatch(setFilters({ salaryMin: range.salaryMin, salaryMax: range.salaryMax }));
        }
    }

    const clearFiltersHandler = () => {
        setSelectedLocation('');
        setSelectedIndustry('');
        setSelectedSalary('');
        dispatch(clearFilters());
    }

    return (
        <Card className='w-full lg:sticky lg:top-20'>
            <CardHeader className='flex-row items-center justify-between space-y-0 p-4 pb-3'>
                <h1 className='font-display text-base font-semibold'>Filter Jobs</h1>
                <Button
                    onClick={clearFiltersHandler}
                    variant="ghost"
                    size="sm"
                    className='h-auto gap-1 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-destructive'
                >
                    <X className='h-3.5 w-3.5' /> Clear Filters
                </Button>
            </CardHeader>
            <CardContent className='flex flex-col gap-5 p-4 pt-0'>
                <div>
                    <h2 className='mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>Location</h2>
                    <RadioGroup value={selectedLocation} onValueChange={locationChangeHandler} className='max-h-56 gap-2.5 overflow-y-auto pr-1'>
                        {
                            locationOptions.map((item, idx) => {
                                const itemId = `location-${idx}`
                                return (
                                    <div key={itemId} className='flex items-center space-x-2'>
                                        <RadioGroupItem value={item} id={itemId} />
                                        <Label htmlFor={itemId} className='cursor-pointer font-normal'>{item}</Label>
                                    </div>
                                )
                            })
                        }
                    </RadioGroup>
                </div>

                <div className='border-t border-border pt-4'>
                    <h2 className='mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>Industry</h2>
                    <RadioGroup value={selectedIndustry} onValueChange={industryChangeHandler} className='gap-2.5'>
                        {
                            industryOptions.map((item, idx) => {
                                const itemId = `industry-${idx}`
                                return (
                                    <div key={itemId} className='flex items-center space-x-2'>
                                        <RadioGroupItem value={item} id={itemId} />
                                        <Label htmlFor={itemId} className='cursor-pointer font-normal'>{item}</Label>
                                    </div>
                                )
                            })
                        }
                    </RadioGroup>
                </div>

                <div className='border-t border-border pt-4'>
                    <h2 className='mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>Salary</h2>
                    <RadioGroup value={selectedSalary} onValueChange={salaryChangeHandler} className='gap-2.5'>
                        {
                            salaryOptions.map((option, idx) => {
                                const itemId = `salary-${idx}`
                                return (
                                    <div key={itemId} className='flex items-center space-x-2'>
                                        <RadioGroupItem value={option.label} id={itemId} />
                                        <Label htmlFor={itemId} className='cursor-pointer font-normal'>{option.label}</Label>
                                    </div>
                                )
                            })
                        }
                    </RadioGroup>
                </div>
            </CardContent>
        </Card>
    )
}

export default FilterCard
