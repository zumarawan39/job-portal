import React, { useEffect, useState } from 'react'
import axios from '@/utils/axiosInstance'
import { toast } from 'sonner'
import { Briefcase } from 'lucide-react'
import Navbar from '../shared/Navbar'
import DashboardLayout from '../shared/DashboardLayout'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Pagination } from '../ui/pagination'
import { ADMIN_API_END_POINT } from '@/utils/constant'
import { platformAdminNav } from './platformAdminNav'
import AdminDateRangeFilter from './AdminDateRangeFilter'

const PAGE_SIZE = 10;

// Platform-admin page: every job posted on the platform, paginated and date-filterable, with the ability to delete one.
const PlatformAdminJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [range, setRange] = useState({ startDate: '', endDate: '' });
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await axios.get(`${ADMIN_API_END_POINT}/jobs`, {
                    withCredentials: true,
                    params: { page, limit: PAGE_SIZE, startDate: range.startDate || undefined, endDate: range.endDate || undefined },
                });
                if (res.data.success) {
                    setJobs(res.data.jobs);
                    setPagination(res.data.pagination);
                }
            } catch (error) {
                console.error(error);
            }
        }
        fetchJobs();
    }, [page, range.startDate, range.endDate]);

    // Any filter change should reset back to page 1
    const handleRangeChange = (next) => {
        setRange(next);
        setPage(1);
    }

    // Deletes a job after confirmation, then removes it from local state
    const deleteJobHandler = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const res = await axios.delete(`${ADMIN_API_END_POINT}/jobs/${id}`, { withCredentials: true });
            if (res.data.success) {
                setJobs(jobs.filter((j) => j._id !== id));
                setPagination((prev) => ({ ...prev, total: Math.max(prev.total - 1, 0) }));
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
                <div className='flex flex-col gap-4'>
                    <AdminDateRangeFilter value={range} onChange={handleRangeChange} />
                    <Card>
                        <CardHeader className='flex-row items-center gap-2 space-y-0'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning'>
                                <Briefcase className='h-4 w-4' />
                            </div>
                            <CardTitle>Jobs</CardTitle>
                        </CardHeader>
                        <CardContent className='flex flex-col gap-4'>
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
                            <Pagination
                                page={pagination.page || page}
                                totalPages={pagination.totalPages}
                                total={pagination.total}
                                limit={PAGE_SIZE}
                                onPageChange={setPage}
                            />
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        </div>
    )
}

export default PlatformAdminJobs
