import React, { useEffect, useState } from 'react'
import axios from '@/utils/axiosInstance'
import { Users, Briefcase, Building2, FileText } from 'lucide-react'
import Navbar from '../shared/Navbar'
import DashboardLayout from '../shared/DashboardLayout'
import { Card, CardContent } from '../ui/card'
import { cn } from '@/lib/utils'
import { ADMIN_API_END_POINT } from '@/utils/constant'
import { platformAdminNav } from './platformAdminNav'

// Platform-admin landing page: just the site-wide stat cards. Users/Jobs/Companies each
// have their own page now (see the other Platform Admin* components in this folder) instead
// of being sections stacked on one long scrolling page.
const PlatformAdminOverview = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalRecruiters: 0,
        totalJobs: 0,
        totalCompanies: 0,
        totalApplications: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${ADMIN_API_END_POINT}/stats`, { withCredentials: true });
                if (res.data.success) {
                    setStats(res.data.stats);
                }
            } catch (error) {
                console.error(error);
            }
        }
        fetchStats();
    }, []);

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
            <DashboardLayout nav={platformAdminNav} title="Platform Overview" description="Site-wide stats at a glance">
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
                                            <p className='font-mono text-2xl font-bold tabular-nums'>{card.value ?? 0}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })
                    }
                </div>
            </DashboardLayout>
        </div>
    )
}

export default PlatformAdminOverview
