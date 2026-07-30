import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Briefcase, Building2, FileText } from 'lucide-react'
import Navbar from '../shared/Navbar'
import DashboardLayout from '../shared/DashboardLayout'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { cn } from '@/lib/utils'
import { ADMIN_API_END_POINT } from '@/utils/constant'

const nav = [
    { to: '/platform-admin#overview', label: 'Overview', icon: LayoutDashboard },
    { to: '/platform-admin#users', label: 'Users', icon: Users },
    { to: '/platform-admin#jobs', label: 'Jobs', icon: Briefcase },
    { to: '/platform-admin#companies', label: 'Companies', icon: Building2 },
]

// Picks a Badge color per role so the Users table reads at a glance
const roleBadgeVariant = (role) => {
    switch (role) {
        case 'recruiter':
            return 'default';
        case 'admin':
        case 'platformadmin':
            return 'destructive';
        default:
            return 'secondary';
    }
}

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

    const location = useLocation();

    // The sidebar uses in-page anchors (this page has no sub-routes), so scroll to
    // the matching section ourselves whenever the hash changes.
    useEffect(() => {
        if (location.hash) {
            const el = document.querySelector(location.hash);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [location.hash]);

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
        { label: "Students", value: stats.totalStudents, icon: Users, chipClass: "bg-primary/10 text-primary" },
        { label: "Recruiters", value: stats.totalRecruiters, icon: Users, chipClass: "bg-success/10 text-success" },
        { label: "Jobs", value: stats.totalJobs, icon: Briefcase, chipClass: "bg-warning/10 text-warning" },
        { label: "Companies", value: stats.totalCompanies, icon: Building2, chipClass: "bg-muted text-brand-orange" },
        { label: "Applications", value: stats.totalApplications, icon: FileText, chipClass: "bg-accent text-accent-foreground" },
    ];

    return (
        <div>
            <Navbar />
            <DashboardLayout nav={nav} title="Platform Overview" description="Site-wide stats and management">
                {/* Stat cards */}
                <div id="overview" className='scroll-mt-20 grid grid-cols-2 md:grid-cols-5 gap-4 mb-10'>
                    {
                        statCards.map((card) => {
                            const Icon = card.icon;
                            return (
                                <Card key={card.label}>
                                    <CardContent className='flex items-center gap-3 p-5'>
                                        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', card.chipClass)}>
                                            <Icon className='h-5 w-5' />
                                        </div>
                                        <div className='min-w-0'>
                                            <p className='text-sm text-muted-foreground'>{card.label}</p>
                                            <p className='font-mono text-2xl font-bold tabular-nums'>{card.value ?? 0}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })
                    }
                </div>

                {/* Users table */}
                <section id="users" className='scroll-mt-20 mb-10'>
                    <Card>
                        <CardHeader className='flex-row items-center gap-2 space-y-0'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                                <Users className='h-4 w-4' />
                            </div>
                            <CardTitle>Users</CardTitle>
                        </CardHeader>
                        <CardContent>
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
                                        users.length > 0 ? users.map((u) => (
                                            <TableRow key={u._id}>
                                                <TableCell>{u.fullname}</TableCell>
                                                <TableCell>{u.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant={roleBadgeVariant(u.role)}>{u.role}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button onClick={() => deleteUserHandler(u._id)} variant="destructive" size="sm">Delete</Button>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className='text-center text-muted-foreground py-8'>
                                                    No users yet
                                                </TableCell>
                                            </TableRow>
                                        )
                                    }
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </section>

                {/* Jobs table */}
                <section id="jobs" className='scroll-mt-20 mb-10'>
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
                </section>

                {/* Companies table */}
                <section id="companies" className='scroll-mt-20 mb-10'>
                    <Card>
                        <CardHeader className='flex-row items-center gap-2 space-y-0'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-brand-orange'>
                                <Building2 className='h-4 w-4' />
                            </div>
                            <CardTitle>Companies</CardTitle>
                        </CardHeader>
                        <CardContent>
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
                                        companies.length > 0 ? companies.map((company) => (
                                            <TableRow key={company._id}>
                                                <TableCell>{company.name}</TableCell>
                                                <TableCell>{company.location}</TableCell>
                                                <TableCell>{company.website}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button onClick={() => deleteCompanyHandler(company._id)} variant="destructive" size="sm">Delete</Button>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className='text-center text-muted-foreground py-8'>
                                                    No companies yet
                                                </TableCell>
                                            </TableRow>
                                        )
                                    }
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </section>
            </DashboardLayout>
        </div>
    )
}

export default PlatformAdminDashboard
