import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import Navbar from '../shared/Navbar'
import { Button } from '../ui/button'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { ADMIN_API_END_POINT } from '@/utils/constant'

// Real platform-admin dashboard: shows site-wide stats and lets the admin manage
// (view + delete) all users, jobs, and companies. Separate from the recruiter
// "admin" pages under src/components/admin/*.
const PlatformAdminDashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalRecruiters: 0,
        totalJobs: 0,
        totalCompanies: 0,
        totalApplications: 0,
    });
    const [users, setUsers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [companies, setCompanies] = useState([]);

    // Fetch all four pieces of dashboard data once when the page loads
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${ADMIN_API_END_POINT}/stats`, { withCredentials: true });
                if (res.data.success) {
                    setStats(res.data.stats);
                }
            } catch (error) {
                console.log(error);
            }
        }
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${ADMIN_API_END_POINT}/users`, { withCredentials: true });
                if (res.data.success) {
                    setUsers(res.data.users);
                }
            } catch (error) {
                console.log(error);
            }
        }
        const fetchJobs = async () => {
            try {
                const res = await axios.get(`${ADMIN_API_END_POINT}/jobs`, { withCredentials: true });
                if (res.data.success) {
                    setJobs(res.data.jobs);
                }
            } catch (error) {
                console.log(error);
            }
        }
        const fetchCompanies = async () => {
            try {
                const res = await axios.get(`${ADMIN_API_END_POINT}/companies`, { withCredentials: true });
                if (res.data.success) {
                    setCompanies(res.data.companies);
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchStats();
        fetchUsers();
        fetchJobs();
        fetchCompanies();
    }, []);

    // Deletes a user after confirmation, then removes it from local state
    const deleteUserHandler = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const res = await axios.delete(`${ADMIN_API_END_POINT}/users/${id}`, { withCredentials: true });
            if (res.data.success) {
                setUsers(users.filter((u) => u._id !== id));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    }

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
            console.log(error);
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    }

    // Deletes a company after confirmation, then removes it from local state
    const deleteCompanyHandler = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const res = await axios.delete(`${ADMIN_API_END_POINT}/companies/${id}`, { withCredentials: true });
            if (res.data.success) {
                setCompanies(companies.filter((c) => c._id !== id));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    }

    const statCards = [
        { label: "Students", value: stats.totalStudents },
        { label: "Recruiters", value: stats.totalRecruiters },
        { label: "Jobs", value: stats.totalJobs },
        { label: "Companies", value: stats.totalCompanies },
        { label: "Applications", value: stats.totalApplications },
    ];

    return (
        <div>
            <Navbar />
            <div className='max-w-7xl mx-auto my-10 px-4'>
                <h1 className='font-bold text-2xl mb-5'>Platform Admin Dashboard</h1>

                {/* Stat cards */}
                <div className='grid grid-cols-2 md:grid-cols-5 gap-4 mb-10'>
                    {
                        statCards.map((card) => (
                            <div key={card.label} className='w-full bg-white p-4 rounded-md shadow-xl border border-gray-100'>
                                <h2 className='text-sm text-gray-500 font-medium'>{card.label}</h2>
                                <p className='text-3xl font-bold mt-2'>{card.value ?? 0}</p>
                            </div>
                        ))
                    }
                </div>

                {/* Users table */}
                <div className='bg-white p-4 rounded-md shadow-xl mb-10'>
                    <h2 className='font-bold text-lg mb-3'>Users</h2>
                    <Table>
                        <TableCaption>A list of all registered users</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Full Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                users.map((u) => (
                                    <TableRow key={u._id}>
                                        <TableCell>{u.fullname}</TableCell>
                                        <TableCell>{u.email}</TableCell>
                                        <TableCell>{u.role}</TableCell>
                                        <TableCell className="text-right">
                                            <Button onClick={() => deleteUserHandler(u._id)} variant="destructive" size="sm">Delete</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </div>

                {/* Jobs table */}
                <div className='bg-white p-4 rounded-md shadow-xl mb-10'>
                    <h2 className='font-bold text-lg mb-3'>Jobs</h2>
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
                                jobs.map((job) => (
                                    <TableRow key={job._id}>
                                        <TableCell>{job.title}</TableCell>
                                        <TableCell>{job.company?.name}</TableCell>
                                        <TableCell>{job.location}</TableCell>
                                        <TableCell>{job.salary}</TableCell>
                                        <TableCell className="text-right">
                                            <Button onClick={() => deleteJobHandler(job._id)} variant="destructive" size="sm">Delete</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </div>

                {/* Companies table */}
                <div className='bg-white p-4 rounded-md shadow-xl mb-10'>
                    <h2 className='font-bold text-lg mb-3'>Companies</h2>
                    <Table>
                        <TableCaption>A list of all registered companies</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Website</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                companies.map((company) => (
                                    <TableRow key={company._id}>
                                        <TableCell>{company.name}</TableCell>
                                        <TableCell>{company.location}</TableCell>
                                        <TableCell>{company.website}</TableCell>
                                        <TableCell className="text-right">
                                            <Button onClick={() => deleteCompanyHandler(company._id)} variant="destructive" size="sm">Delete</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}

export default PlatformAdminDashboard
