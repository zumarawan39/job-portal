import React, { useEffect, useState } from 'react'
import axios from '@/utils/axiosInstance'
import { toast } from 'sonner'
import { Building2 } from 'lucide-react'
import Navbar from '../shared/Navbar'
import DashboardLayout from '../shared/DashboardLayout'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { ADMIN_API_END_POINT } from '@/utils/constant'
import { platformAdminNav } from './platformAdminNav'

// Platform-admin page: every company registered on the platform, with the ability to delete one.
const PlatformAdminCompanies = () => {
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await axios.get(`${ADMIN_API_END_POINT}/companies`, { withCredentials: true });
                if (res.data.success) {
                    setCompanies(res.data.companies);
                }
            } catch (error) {
                console.error(error);
            }
        }
        fetchCompanies();
    }, []);

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
            console.error(error);
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    }

    return (
        <div>
            <Navbar />
            <DashboardLayout nav={platformAdminNav} title="Companies" description="Every company registered on the platform">
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
            </DashboardLayout>
        </div>
    )
}

export default PlatformAdminCompanies
