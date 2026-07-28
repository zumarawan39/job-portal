import React, { useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { MoreHorizontal } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import ChatBox from '../chat/ChatBox';

const shortlistingStatus = ["Accepted", "Rejected"];

// Table listing applicants for a job, with buttons to accept/reject each one,
// message them, and schedule an interview
const ApplicantsTable = () => {
    // Read the applicants data (for the current job) from Redux
    const { applicants } = useSelector(store => store.application);
    // Tracks which application's chat dialog is currently open (null = none)
    const [chatApplicationId, setChatApplicationId] = useState(null);

    // Sends a request to update one applicant's status (Accepted/Rejected)
    const statusHandler = async (status, id) => {
        console.log('called');
        try {
            axios.defaults.withCredentials = true;
            // Tell the backend to change this application's status
            const res = await axios.post(`${APPLICATION_API_END_POINT}/status/${id}/update`, { status });
            console.log(res);
            if (res.data.success) {
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }

    return (
        <div>
            <Table>
                <TableCaption>A list of your recent applied user</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>FullName</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Resume</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Contact Applicant</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        // Render one row per applicant who applied to this job
                        applicants && applicants?.applications?.map((item) => (
                            <tr key={item._id}>
                                <TableCell>{item?.applicant?.fullname}</TableCell>
                                <TableCell>{item?.applicant?.email}</TableCell>
                                <TableCell>{item?.applicant?.phoneNumber}</TableCell>
                                <TableCell >
                                    {
                                        item.applicant?.profile?.resume ? <a className="text-blue-600 cursor-pointer" href={item?.applicant?.profile?.resume} target="_blank" rel="noopener noreferrer">{item?.applicant?.profile?.resumeOriginalName}</a> : <span>NA</span>
                                    }
                                </TableCell>
                                <TableCell>{item?.applicant.createdAt.split("T")[0]}</TableCell>
                                <TableCell>
                                    <div className='flex items-center gap-2'>
                                        <Button size="sm" variant="outline" onClick={() => setChatApplicationId(item._id)}>Message</Button>
                                    </div>
                                </TableCell>
                                <TableCell className="float-right cursor-pointer">
                                    <Popover>
                                        <PopoverTrigger>
                                            <MoreHorizontal />
                                        </PopoverTrigger>
                                        <PopoverContent className="w-32">
                                            {
                                                // Show "Accepted"/"Rejected" options for setting this applicant's status
                                                shortlistingStatus.map((status, index) => {
                                                    return (
                                                        <div onClick={() => statusHandler(status, item?._id)} key={index} className='flex w-fit items-center my-2 cursor-pointer'>
                                                            <span>{status}</span>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </PopoverContent>
                                    </Popover>

                                </TableCell>

                            </tr>
                        ))
                    }

                </TableBody>

            </Table>

            {/* Chat dialog */}
            <Dialog open={!!chatApplicationId}>
                <DialogContent className="sm:max-w-[500px]" onInteractOutside={() => setChatApplicationId(null)}>
                    <DialogHeader>
                        <DialogTitle>Chat</DialogTitle>
                    </DialogHeader>
                    {
                        chatApplicationId && <ChatBox applicationId={chatApplicationId} />
                    }
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ApplicantsTable
