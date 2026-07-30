import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import DashboardLayout from '../shared/DashboardLayout'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { useSelector } from 'react-redux'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import axios from 'axios'
import { JOB_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { Loader2, Building2, Briefcase } from 'lucide-react'

const companyArray = [];

const nav = [
    { to: '/admin/companies', label: 'Companies', icon: Building2 },
    { to: '/admin/jobs', label: 'Jobs', icon: Briefcase },
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
        position: 0,
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

    // Sends the new job details to the backend to create the job posting
    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            // Create a new job with all the form data
            const res = await axios.post(`${JOB_API_END_POINT}/post`, input,{
                headers:{
                    'Content-Type':'application/json'
                },
                withCredentials:true
            });
            if(res.data.success){
                toast.success(res.data.message);
                // Go back to the admin jobs list after successfully posting
                navigate("/admin/jobs");
            }
        } catch (error) {
            toast.error(error.response.data.message);
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
                                        <Label>Salary</Label>
                                        <Input
                                            type="text"
                                            name="salary"
                                            value={input.salary}
                                            onChange={changeEventHandler}
                                            className="my-1"
                                        />
                                    </div>
                                    <div>
                                        <Label>Location</Label>
                                        <Input
                                            type="text"
                                            name="location"
                                            value={input.location}
                                            onChange={changeEventHandler}
                                            className="my-1"
                                        />
                                    </div>
                                    <div>
                                        <Label>Job Type</Label>
                                        <Input
                                            type="text"
                                            name="jobType"
                                            value={input.jobType}
                                            onChange={changeEventHandler}
                                            className="my-1"
                                        />
                                    </div>
                                    <div>
                                        <Label>Experience Level</Label>
                                        <Input
                                            type="text"
                                            name="experience"
                                            value={input.experience}
                                            onChange={changeEventHandler}
                                            className="my-1"
                                        />
                                    </div>
                                    <div>
                                        <Label>No of Postion</Label>
                                        <Input
                                            type="number"
                                            name="position"
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
