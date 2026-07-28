import React, { useState } from 'react'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { useDispatch } from 'react-redux'
import { setFilters, clearFilters } from '@/redux/jobSlice'

// Location and Industry filter options (sent to the backend as-is)
const locationOptions = ["Delhi NCR", "Bangalore", "Hyderabad", "Pune", "Mumbai"];
const industryOptions = ["Frontend Developer", "Backend Developer", "FullStack Developer"];
// Salary labels shown to the user, mapped to an explicit numeric min/max range sent to the backend
const salaryOptions = [
    { label: "0-40k", salaryMin: 0, salaryMax: 40000 },
    { label: "42-1lakh", salaryMin: 42000, salaryMax: 100000 },
    { label: "1lakh to 5lakh", salaryMin: 100000, salaryMax: 500000 },
];

// Shows radio-button filters (Location, Industry, Salary) to narrow down job search results.
// Each group keeps its own selection state so picking one group's option doesn't clear another's.
const FilterCard = () => {
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedIndustry, setSelectedIndustry] = useState('');
    const [selectedSalary, setSelectedSalary] = useState('');
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
        <div className='w-full bg-white p-3 rounded-md'>
            <div className='flex items-center justify-between'>
                <h1 className='font-bold text-lg'>Filter Jobs</h1>
                <Button onClick={clearFiltersHandler} variant="outline" size="sm">Clear Filters</Button>
            </div>
            <hr className='mt-3' />

            <div>
                <h1 className='font-bold text-lg'>Location</h1>
                <RadioGroup value={selectedLocation} onValueChange={locationChangeHandler}>
                    {
                        locationOptions.map((item, idx) => {
                            const itemId = `location-${idx}`
                            return (
                                <div key={itemId} className='flex items-center space-x-2 my-2'>
                                    <RadioGroupItem value={item} id={itemId} />
                                    <Label htmlFor={itemId}>{item}</Label>
                                </div>
                            )
                        })
                    }
                </RadioGroup>
            </div>

            <div>
                <h1 className='font-bold text-lg'>Industry</h1>
                <RadioGroup value={selectedIndustry} onValueChange={industryChangeHandler}>
                    {
                        industryOptions.map((item, idx) => {
                            const itemId = `industry-${idx}`
                            return (
                                <div key={itemId} className='flex items-center space-x-2 my-2'>
                                    <RadioGroupItem value={item} id={itemId} />
                                    <Label htmlFor={itemId}>{item}</Label>
                                </div>
                            )
                        })
                    }
                </RadioGroup>
            </div>

            <div>
                <h1 className='font-bold text-lg'>Salary</h1>
                <RadioGroup value={selectedSalary} onValueChange={salaryChangeHandler}>
                    {
                        salaryOptions.map((option, idx) => {
                            const itemId = `salary-${idx}`
                            return (
                                <div key={itemId} className='flex items-center space-x-2 my-2'>
                                    <RadioGroupItem value={option.label} id={itemId} />
                                    <Label htmlFor={itemId}>{option.label}</Label>
                                </div>
                            )
                        })
                    }
                </RadioGroup>
            </div>
        </div>
    )
}

export default FilterCard
