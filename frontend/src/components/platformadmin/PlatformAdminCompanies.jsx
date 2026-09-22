import React, { useEffect, useState } from 'react'
import axios from '@/utils/axiosInstance'
import { toast } from 'sonner'
import { Building2 } from 'lucide-react'
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

// Platform-admin page: every company registered on the platform, paginated and date-filterable, with the ability to delete one.
const PlatformAdminCompanies = () => {
    const [companies, setCompanies] = useState([]);
    const [range, setRange] = useState({ startDate: '', endDate: '' });
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await axios.get(`${ADMIN_API_END_POINT}/companies`, {
                    withCredentials: true,
                    params: { page, limit: PAGE_SIZE, startDate: range.startDate || undefined, endDate: range.endDate || undefined },
                });
                if (res.data.success) {
                    setCompanies(res.data.companies);
                    setPagination(res.data.pagination);
                }
            } catch (error) {
                console.error(error);
            }
        }
        fetchCompanies();
    }, [page, range.startDate, range.endDate]);

    // Any filter change should reset back to page 1
    const handleRangeChange = (next) => {
        setRange(next);
        setPage(1);
    }

    // Deletes a company after confirmation, then removes it from local state
    const deleteCompanyHandler = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const res = await axios.delete(`${ADMIN_API_END_POINT}/companies/${id}`, { withCredentials: true });
            if (res.data.success) {
                setCompanies(companies.filter((c) => c._id !== id));
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
            <DashboardLayout nav={platformAdminNav} title="Companies" description="Every company registered on the platform">
                <div className='flex flex-col gap-4'>
                    <AdminDateRangeFilter value={range} onChange={handleRangeChange} />
                    <Card>
                        <CardHeader className='flex-row items-center gap-2 space-y-0'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-brand-orange'>
                                <Building2 className='h-4 w-4' />
                            </div>
                            <CardTitle>Companies</CardTitle>
                        </CardHeader>
                        <CardContent className='flex flex-col gap-4'>
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

export default PlatformAdminCompanies
