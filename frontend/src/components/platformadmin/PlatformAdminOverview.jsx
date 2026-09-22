import React, { useEffect, useState } from 'react'
import axios from '@/utils/axiosInstance'
import { Users, Briefcase, Building2, FileText } from 'lucide-react'
import {
    ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import Navbar from '../shared/Navbar'
import DashboardLayout from '../shared/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { cn } from '@/lib/utils'
import { ADMIN_API_END_POINT } from '@/utils/constant'
import { platformAdminNav } from './platformAdminNav'
import AdminDateRangeFilter from './AdminDateRangeFilter'

// Chart colors pull from the same CSS variables the rest of the UI uses, so they
// automatically match the active light/dark theme.
const CHART_COLORS = {
    signups: 'hsl(var(--primary))',
    jobs: 'hsl(var(--warning))',
    applications: 'hsl(var(--success))',
    grid: 'hsl(var(--border))',
    text: 'hsl(var(--muted-foreground))',
};
const PIE_COLORS = ['hsl(var(--primary))', 'hsl(var(--warning))', 'hsl(var(--success))', 'hsl(var(--destructive))', 'hsl(var(--accent-foreground))'];

// Merges three { date, count }[] series into one recharts-friendly array keyed by date
const mergeSeries = (signups = [], jobs = [], applications = []) => {
    const byDate = new Map();
    const add = (series, key) => {
        series.forEach(({ date, count }) => {
            const row = byDate.get(date) || { date };
            row[key] = count;
            byDate.set(date, row);
        });
    }
    add(signups, 'signups');
    add(jobs, 'jobs');
    add(applications, 'applications');
    return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

// Platform-admin landing page: site-wide stat cards, trend/breakdown charts, and a date filter.
// Users/Jobs/Companies each have their own list page (see the other PlatformAdmin* components).
const PlatformAdminOverview = () => {
    const [stats, setStats] = useState({
        totalJobSeekers: 0,
        totalRecruiters: 0,
        totalJobs: 0,
        totalCompanies: 0,
        totalApplications: 0,
    });
    const [charts, setCharts] = useState({
        applicationsByStatus: [],
        jobsByType: [],
        signupsOverTime: [],
        jobsOverTime: [],
        applicationsOverTime: [],
    });
    const [range, setRange] = useState({ startDate: '', endDate: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${ADMIN_API_END_POINT}/stats`, {
                    withCredentials: true,
                    params: { startDate: range.startDate || undefined, endDate: range.endDate || undefined },
                });
                if (res.data.success) {
                    setStats(res.data.stats);
                    setCharts(res.data.charts);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, [range.startDate, range.endDate]);

    const statCards = [
        { label: "Job Seekers", value: stats.totalJobSeekers, icon: Users, chipClass: "bg-primary/10 text-primary" },
        { label: "Recruiters", value: stats.totalRecruiters, icon: Users, chipClass: "bg-success/10 text-success" },
        { label: "Jobs", value: stats.totalJobs, icon: Briefcase, chipClass: "bg-warning/10 text-warning" },
        { label: "Companies", value: stats.totalCompanies, icon: Building2, chipClass: "bg-muted text-brand-orange" },
        { label: "Applications", value: stats.totalApplications, icon: FileText, chipClass: "bg-accent text-accent-foreground" },
    ];

    const trendData = mergeSeries(charts.signupsOverTime, charts.jobsOverTime, charts.applicationsOverTime);
    const hasTrendData = trendData.length > 0;
    const hasJobTypeData = charts.jobsByType.length > 0;
    const hasStatusData = charts.applicationsByStatus.length > 0;

    return (
        <div>
            <Navbar />
            <DashboardLayout nav={platformAdminNav} title="Platform Overview" description="Site-wide stats at a glance">
                <div className='flex flex-col gap-6'>
                    <AdminDateRangeFilter value={range} onChange={setRange} />

                    <div className='grid grid-cols-2 gap-4 md:grid-cols-5'>
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
                                                <p className='font-mono text-2xl font-bold tabular-nums'>{loading ? '—' : (card.value ?? 0)}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })
                        }
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className='text-base'>Signups, jobs &amp; applications over time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {hasTrendData ? (
                                <ResponsiveContainer width='100%' height={300}>
                                    <LineChart data={trendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray='3 3' stroke={CHART_COLORS.grid} />
                                        <XAxis dataKey='date' tick={{ fontSize: 12, fill: CHART_COLORS.text }} />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: CHART_COLORS.text }} />
                                        <Tooltip />
                                        <Legend />
                                        <Line type='monotone' dataKey='signups' name='Signups' stroke={CHART_COLORS.signups} strokeWidth={2} dot={false} />
                                        <Line type='monotone' dataKey='jobs' name='Jobs posted' stroke={CHART_COLORS.jobs} strokeWidth={2} dot={false} />
                                        <Line type='monotone' dataKey='applications' name='Applications' stroke={CHART_COLORS.applications} strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className='py-12 text-center text-sm text-muted-foreground'>No activity in this date range</p>
                            )}
                        </CardContent>
                    </Card>

                    <div className='grid gap-6 md:grid-cols-2'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-base'>Jobs by type</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {hasJobTypeData ? (
                                    <ResponsiveContainer width='100%' height={260}>
                                        <BarChart data={charts.jobsByType} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray='3 3' stroke={CHART_COLORS.grid} />
                                            <XAxis dataKey='type' tick={{ fontSize: 12, fill: CHART_COLORS.text }} />
                                            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: CHART_COLORS.text }} />
                                            <Tooltip />
                                            <Bar dataKey='count' name='Jobs' fill={CHART_COLORS.jobs} radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className='py-12 text-center text-sm text-muted-foreground'>No jobs in this date range</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className='text-base'>Applications by status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {hasStatusData ? (
                                    <ResponsiveContainer width='100%' height={260}>
                                        <PieChart>
                                            <Pie
                                                data={charts.applicationsByStatus}
                                                dataKey='count'
                                                nameKey='status'
                                                cx='50%'
                                                cy='50%'
                                                outerRadius={90}
                                                label={({ status, count }) => `${status}: ${count}`}
                                            >
                                                {charts.applicationsByStatus.map((entry, index) => (
                                                    <Cell key={entry.status} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className='py-12 text-center text-sm text-muted-foreground'>No applications in this date range</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DashboardLayout>
        </div>
    )
}

export default PlatformAdminOverview
