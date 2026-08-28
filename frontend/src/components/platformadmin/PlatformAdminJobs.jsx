import React, { useEffect, useState } from 'react'
import axios from '@/utils/axiosInstance'
import { toast } from 'sonner'
import { Briefcase } from 'lucide-react'
import Navbar from '../shared/Navbar'
import DashboardLayout from '../shared/DashboardLayout'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { ADMIN_API_END_POINT } from '@/utils/constant'
import { platformAdminNav } from './platformAdminNav'

// Platform-admin page: every job posted on the platform, with the ability to delete one.
const PlatformAdminJobs = () => {
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await axios.get(`${ADMIN_API_END_POINT}/jobs`, { withCredentials: true });
                if (res.data.success) {
                    setJobs(res.data.jobs);
                }
            } catch (error) {
                console.error(error);
            }
        }
        fetchJobs();
    }, []);

    // Deletes a job after confirmation, then removes it from local state
    const deleteJobHandler = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const res = await axios.delete(`${ADMIN_API_END_POINT}/jobs/${id}`, { withCredentials: true });
            if (res.data.success) {
                setJobs(jobs.filter((j) => j._id !== id));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    }

    return (
        <div>
            <Navbar />
            <DashboardLayout nav={platformAdminNav} title="Jobs" description="Every job posted on the platform">
                <Card>
                    <CardHeader className='flex-row items-center gap-2 space-y-0'>
                        <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning'>
                            <Briefcase className='h-4 w-4' />
                        </div>
                        <CardTitle>Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableCaption>A list of all posted jobs</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Salary</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {
                                    jobs.length > 0 ? jobs.map((job) => (
                                        <TableRow key={job._id}>
                                            <TableCell>{job.title}</TableCell>
                                            <TableCell>{job.company?.name}</TableCell>
                                            <TableCell>{job.location}</TableCell>
                                            <TableCell>{job.salary}</TableCell>
                                            <TableCell className="text-right">
                                                <Button onClick={() => deleteJobHandler(job._id)} variant="destructive" size="sm">Delete</Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className='text-center text-muted-foreground py-8'>
                                                No jobs yet
                                            </TableCell>
                                        </TableRow>
                                    )
                                }
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </DashboardLayout>
        </div>
    )
}

export default PlatformAdminJobs
