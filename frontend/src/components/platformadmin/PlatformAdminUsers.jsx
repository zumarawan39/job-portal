import React, { useEffect, useState } from 'react'
import axios from '@/utils/axiosInstance'
import { toast } from 'sonner'
import { Users } from 'lucide-react'
import Navbar from '../shared/Navbar'
import DashboardLayout from '../shared/DashboardLayout'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { ADMIN_API_END_POINT } from '@/utils/constant'
import { platformAdminNav } from './platformAdminNav'

// Picks a Badge color per role so the table reads at a glance
const roleBadgeVariant = (role) => {
    switch (role) {
        case 'recruiter':
            return 'default';
        case 'admin':
            return 'destructive';
        default:
            return 'secondary';
    }
}

// Platform-admin page: every registered account, with the ability to delete one.
const PlatformAdminUsers = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${ADMIN_API_END_POINT}/users`, { withCredentials: true });
                if (res.data.success) {
                    setUsers(res.data.users);
                }
            } catch (error) {
                console.error(error);
            }
        }
        fetchUsers();
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
            console.error(error);
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    }

    return (
        <div>
            <Navbar />
            <DashboardLayout nav={platformAdminNav} title="Users" description="Every account registered on the platform">
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
            </DashboardLayout>
        </div>
    )
}

export default PlatformAdminUsers
