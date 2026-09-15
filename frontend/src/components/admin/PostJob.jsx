import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import DashboardLayout from '../shared/DashboardLayout'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { useSelector } from 'react-redux'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import axios from '@/utils/axiosInstance'
import { JOB_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { Loader2, Building2, Briefcase } from 'lucide-react'
import { PK_CITIES, JOB_TYPES, EXPERIENCE_LEVELS } from '@/utils/jobOptions'

const nav = [
    { to: '/recruiter/companies', label: 'Companies', icon: Building2 },
    { to: '/recruiter/jobs', label: 'Jobs', icon: Briefcase },
]

// Form for creating a new job posting (admin only)
const PostJob = () => {
    const [input, setInput] = useState({
        title: "",
        description: "",
        requirements: "",
        salary: "",
        location: "",
        jobType: "",
        experience: "",
        // "" (not 0) so an empty field is caught by the required-field check below instead
        // of silently coercing to 0 and posting a job with zero openings.
        position: "",
        companyId: ""
    });
    // Whether the post request is in progress, used to show a spinner on the button
    const [loading, setLoading]= useState(false);
    const navigate = useNavigate();

    // Read the admin's companies from Redux so the user can pick which company this job belongs to
    const { companies } = useSelector(store => store.company);
    // Update form state whenever a text/number input changes
    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    // Save the selected company's id when the user picks a company from the dropdown
    const selectChangeHandler = (value) => {
        const selectedCompany = companies.find((company)=> company.name.toLowerCase() === value);
        setInput({...input, companyId:selectedCompany._id});
    };

    // Update form state when the job type / location dropdowns change
    const jobTypeChangeHandler = (value) => setInput({ ...input, jobType: value });
    const locationChangeHandler = (value) => setInput({ ...input, location: value });
    // Experience Level's dropdown value is a string (Radix Select requires string values),
    // so convert it back to the number the backend expects (years of experience).
    const experienceChangeHandler = (value) => setInput({ ...input, experience: value });

    // Sends the new job details to the backend to create the job posting
    const submitHandler = async (e) => {
        e.preventDefault();

        // Salary/experience/position used to be free-text fields, so a value like "0-40k" or
        // "Mid Level" would reach the backend and fail with a raw "expected number, received
        // NaN" error. They're now number inputs / dropdowns, but this check catches an empty
        // field before it round-trips to the server at all.
        if (input.salary === "" || input.experience === "" || input.position === "") {
            toast.error("Please fill in Salary, Experience Level and No. of Positions.");
            return;
        }

        const payload = {
            ...input,
            salary: Number(input.salary),
            experience: Number(input.experience),
            position: Number(input.position),
        };

        try {
            setLoading(true);
            // Create a new job with all the form data
            const res = await axios.post(`${JOB_API_END_POINT}/post`, payload,{
                headers:{
                    'Content-Type':'application/json'
                },
                withCredentials:true
            });
            if(res.data.success){
                toast.success(res.data.message);
                // Go back to the admin jobs list after successfully posting
                navigate("/recruiter/jobs");
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong.");
        } finally{
            setLoading(false);
        }
    }

    return (
        <div>
            <Navbar />
            <DashboardLayout nav={nav} title="Post a New Job" description="Fill in the details for your job posting">
                <div className='flex justify-center'>
                    <Card className="w-full max-w-4xl">
                        <CardContent className="pt-6">
                            <form onSubmit = {submitHandler}>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div>
                                        <Label>Title</Label>
                                        <Input
                                            type="text"
                                            name="title"
                                            value={input.title}
                                            onChange={changeEventHandler}
                                            className="my-1"
                                        />
                                    </div>
                                    <div>
                                        <Label>Description</Label>
                                        <Input
                                            type="text"
                                            name="description"
                                            value={input.description}
                                            onChange={changeEventHandler}
                                            className="my-1"
                                        />
                                    </div>
                                    <div>
                                        <Label>Requirements</Label>
                                        <Input
                                            type="text"
                                            name="requirements"
                                            value={input.requirements}
                                            onChange={changeEventHandler}
                                            className="my-1"
                                        />
                                    </div>
                                    <div>
                                        <Label>Monthly Salary (PKR)</Label>
                                        <Input
                                            type="number"
                                            name="salary"
                                            min="0"
                                            placeholder="85000"
                                            value={input.salary}
                                            onChange={changeEventHandler}
                                            className="my-1"
                                        />
                                    </div>
                                    <div>
                                        <Label>Location</Label>
                                        <Select value={input.location} onValueChange={locationChangeHandler}>
                                            <SelectTrigger className="my-1 w-full">
                                                <SelectValue placeholder="Select a city" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {
                                                        PK_CITIES.map((city) => (
                                                            <SelectItem key={city} value={city}>{city}</SelectItem>
                                                        ))
                                                    }
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Job Type</Label>
                                        <Select value={input.jobType} onValueChange={jobTypeChangeHandler}>
                                            <SelectTrigger className="my-1 w-full">
                                                <SelectValue placeholder="Select a job type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {
                                                        JOB_TYPES.map((type) => (
                                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                                        ))
                                                    }
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Experience Level</Label>
                                        <Select value={input.experience} onValueChange={experienceChangeHandler}>
                                            <SelectTrigger className="my-1 w-full">
                                                <SelectValue placeholder="Select an experience level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {
                                                        EXPERIENCE_LEVELS.map((level) => (
                                                            <SelectItem key={level.value} value={String(level.value)}>{level.label}</SelectItem>
                                                        ))
                                                    }
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>No. of Positions</Label>
                                        <Input
                                            type="number"
                                            name="position"
                                            min="1"
                                            placeholder="1"
                                            value={input.position}
                                            onChange={changeEventHandler}
                                            className="my-1"
                                        />
                                    </div>
                                    {
                                        // Only show the company picker if the admin has at least one company registered
                                        companies.length > 0 && (
                                            <div>
                                                <Label>Company</Label>
                                                <Select onValueChange={selectChangeHandler}>
                                                    <SelectTrigger className="my-1 w-full">
                                                        <SelectValue placeholder="Select a Company" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {
                                                                // List every company the admin can choose from
                                                                companies.map((company) => {
                                                                    return (
                                                                        <SelectItem key={company._id} value={company?.name?.toLowerCase()}>{company.name}</SelectItem>
                                                                    )
                                                                })
                                                            }

                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )
                                    }
                                </div>
                                {
                                    // Show a spinner button while posting, otherwise show the normal submit button
                                    loading ? <Button className="w-full my-4"> <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait </Button> : <Button type="submit" className="w-full my-4">Post New Job</Button>
                                }
                                {
                                    // Warn the admin they need a company before they can post a job
                                    companies.length === 0 && <p className='text-xs text-destructive font-bold text-center my-3'>*Please register a company first, before posting a jobs</p>
                                }
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        </div>
    )
}

export default PostJob
