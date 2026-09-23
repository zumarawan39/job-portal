import React, { useState } from 'react'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader } from './ui/card'
import { useDispatch, useSelector } from 'react-redux'
import { setFilters, clearFilters } from '@/redux/jobSlice'
import { PK_CITIES, INDUSTRY_OPTIONS, SALARY_RANGES } from '@/utils/jobOptions'
import { X } from 'lucide-react'

// Location and Industry options shared with the post-job form via jobOptions.js
const locationOptions = PK_CITIES;
const industryOptions = INDUSTRY_OPTIONS;
// Salary labels shown to the user, mapped to an explicit numeric min/max range sent to the backend
const salaryOptions = SALARY_RANGES;
const CUSTOM_SALARY_LABEL = 'Custom Range';
const hasValue = (value) => value !== '' && value !== undefined && value !== null;

// Shows radio-button filters (Location, Industry, Salary) to narrow down job search results
const FilterCard = () => {
    // Seed each group's selection from the current Redux filters so a remount shows what's applied
    const { filters } = useSelector(store => store.job);
    const [selectedLocation, setSelectedLocation] = useState(filters?.location || '');
    const [selectedIndustry, setSelectedIndustry] = useState(filters?.industry || '');
    const presetSalaryMatch = SALARY_RANGES.find(
        (option) => option.salaryMin === filters?.salaryMin && option.salaryMax === filters?.salaryMax
    );
    const [selectedSalary, setSelectedSalary] = useState(() => {
        if (presetSalaryMatch) return presetSalaryMatch.label;
        if (hasValue(filters?.salaryMin) || hasValue(filters?.salaryMax)) return CUSTOM_SALARY_LABEL;
        return '';
    });
    // Pre-fill the custom inputs when the active filter is a custom (non-preset) salary range
    const [customMin, setCustomMin] = useState(() => (!presetSalaryMatch && hasValue(filters?.salaryMin)) ? String(filters.salaryMin) : '');
    const [customMax, setCustomMax] = useState(() => (!presetSalaryMatch && hasValue(filters?.salaryMax)) ? String(filters.salaryMax) : '');
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
        if (label === CUSTOM_SALARY_LABEL) {
            // Wait for the user to type a range and hit Apply before filtering
            return;
        }
        const range = salaryOptions.find((option) => option.label === label);
        if (range) {
            setCustomMin('');
            setCustomMax('');
            dispatch(setFilters({ salaryMin: range.salaryMin, salaryMax: range.salaryMax }));
        }
    }

    const applyCustomSalaryHandler = () => {
        const min = hasValue(customMin) ? Number(customMin) : '';
        const max = hasValue(customMax) ? Number(customMax) : '';
        if (min !== '' && max !== '' && min > max) return;
        dispatch(setFilters({ salaryMin: min, salaryMax: max }));
    }

    const customSalaryKeyDownHandler = (e) => {
        if (e.key === 'Enter') applyCustomSalaryHandler();
    }

    const clearFiltersHandler = () => {
        setSelectedLocation('');
        setSelectedIndustry('');
        setSelectedSalary('');
        setCustomMin('');
        setCustomMax('');
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
                        <div className='flex items-center space-x-2'>
                            <RadioGroupItem value={CUSTOM_SALARY_LABEL} id='salary-custom' />
                            <Label htmlFor='salary-custom' className='cursor-pointer font-normal'>{CUSTOM_SALARY_LABEL}</Label>
                        </div>
                    </RadioGroup>
                    {
                        selectedSalary === CUSTOM_SALARY_LABEL && (
                            <div className='mt-3 flex flex-col gap-2'>
                                <div className='flex items-center gap-2'>
                                    <Input
                                        type='number'
                                        min='0'
                                        inputMode='numeric'
                                        placeholder='Min'
                                        value={customMin}
                                        onChange={(e) => setCustomMin(e.target.value)}
                                        onKeyDown={customSalaryKeyDownHandler}
                                        className='h-9 text-sm'
                                    />
                                    <span className='text-sm text-muted-foreground'>-</span>
                                    <Input
                                        type='number'
                                        min='0'
                                        inputMode='numeric'
                                        placeholder='Max'
                                        value={customMax}
                                        onChange={(e) => setCustomMax(e.target.value)}
                                        onKeyDown={customSalaryKeyDownHandler}
                                        className='h-9 text-sm'
                                    />
                                </div>
                                <Button onClick={applyCustomSalaryHandler} size='sm' className='h-8 self-end text-xs'>
                                    Apply
                                </Button>
                            </div>
                        )
                    }
                </div>
            </CardContent>
        </Card>
    )
}

export default FilterCard
