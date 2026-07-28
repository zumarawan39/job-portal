import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import CompaniesTable from './CompaniesTable'
import { useNavigate } from 'react-router-dom'
import useGetAllCompanies from '@/hooks/useGetAllCompanies'
import { useDispatch } from 'react-redux'
import { setSearchCompanyByText } from '@/redux/companySlice'

// Page for admins to see all their registered companies, search them, and add new ones
const Companies = () => {
    // Custom hook that fetches all companies belonging to this admin/recruiter
    useGetAllCompanies();
    // Text typed into the search box
    const [input, setInput] = useState("");
    // Lets us send the user to another page (like the create company page)
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Runs every time the search text changes, so the company list stays filtered live
    useEffect(()=>{
        // Save the search text in Redux so the table component can filter companies by it
        dispatch(setSearchCompanyByText(input));
    },[input]);
    return (
        <div>
            <Navbar />
            <div className='max-w-6xl mx-auto my-10'>
                <div className='flex items-center justify-between my-5'>
                    <Input
                        className="w-fit"
                        placeholder="Filter by name"
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <Button onClick={() => navigate("/admin/companies/create")}>New Company</Button>
                </div>
                <CompaniesTable/>
            </div>
        </div>
    )
}

export default Companies