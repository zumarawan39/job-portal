import React, { useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { MoreHorizontal } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import ChatBox from '../chat/ChatBox';
import InterviewDetails from '../InterviewDetails';

const shortlistingStatus = ["Accepted", "Rejected"];

// Table listing applicants for a job, with buttons to accept/reject each one,
// message them, and schedule an interview
const ApplicantsTable = () => {
    // Read the applicants data (for the current job) from Redux
    const { applicants } = useSelector(store => store.application);
    // Tracks which application's chat dialog is currently open (null = none)
    const [chatApplicationId, setChatApplicationId] = useState(null);
    // Tracks which application's interview-scheduling dialog is currently open (null = none)
    const [scheduleApplicationId, setScheduleApplicationId] = useState(null);
    const [interviewInput, setInterviewInput] = useState({ scheduledAt: "", meetingLink: "", notes: "" });
    const [scheduling, setScheduling] = useState(false);

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

    const openScheduleDialog = (id) => {
        setInterviewInput({ scheduledAt: "", meetingLink: "", notes: "" });
        setScheduleApplicationId(id);
    }

    const scheduleInputChangeHandler = (e) => {
        setInterviewInput({ ...interviewInput, [e.target.name]: e.target.value });
    }

    // Submits the interview scheduling form for the currently open application
    const scheduleSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            setScheduling(true);
            const res = await axios.post(`${APPLICATION_API_END_POINT}/${scheduleApplicationId}/schedule-interview`, interviewInput, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                setScheduleApplicationId(null);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setScheduling(false);
        }
    }

    return (
        <div>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableCaption className="pb-4">A list of your recent applied user</TableCaption>
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
                                    <TableRow key={item._id}>
                                        <TableCell className="font-medium">{item?.applicant?.fullname}</TableCell>
                                        <TableCell>{item?.applicant?.email}</TableCell>
                                        <TableCell>{item?.applicant?.phoneNumber}</TableCell>
                                        <TableCell >
                                            {
                                                item.applicant?.profile?.resume ? <a className="text-primary hover:underline cursor-pointer" href={item?.applicant?.profile?.resume} target="_blank" rel="noopener noreferrer">{item?.applicant?.profile?.resumeOriginalName}</a> : <span className="text-muted-foreground">NA</span>
                                            }
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{item?.applicant.createdAt.split("T")[0]}</TableCell>
                                        <TableCell>
                                            <div className='flex items-center gap-2'>
                                                <Button size="sm" variant="outline" onClick={() => setChatApplicationId(item._id)}>Message</Button>
                                                <Button size="sm" className="bg-primary" onClick={() => openScheduleDialog(item._id)}>Schedule Interview</Button>
                                            </div>
                                            <InterviewDetails interview={item.interview} />
                                        </TableCell>
                                        <TableCell className="text-right cursor-pointer">
                                            <Popover>
                                                <PopoverTrigger className="rounded-md p-1 hover:bg-accent">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </PopoverTrigger>
                                                <PopoverContent className="w-32 p-1">
                                                    {
                                                        // Show "Accepted"/"Rejected" options for setting this applicant's status
                                                        shortlistingStatus.map((status, index) => {
                                                            return (
                                                                <div onClick={() => statusHandler(status, item?._id)} key={index} className='flex w-full items-center rounded-sm px-2 py-1.5 text-sm my-1 cursor-pointer hover:bg-accent hover:text-accent-foreground'>
                                                                    <span>{status}</span>
                                                                </div>
                                                            )
                                                        })
                                                    }
                                                </PopoverContent>
                                            </Popover>

                                        </TableCell>

                                    </TableRow>
                                ))
                            }

                        </TableBody>

                    </Table>
                </CardContent>
            </Card>

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

            {/* Schedule interview dialog */}
            <Dialog open={!!scheduleApplicationId}>
                <DialogContent className="sm:max-w-[425px]" onInteractOutside={() => setScheduleApplicationId(null)}>
                    <DialogHeader>
                        <DialogTitle>Schedule Interview</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={scheduleSubmitHandler}>
                        <div className='grid gap-4 py-4'>
                            <div>
                                <Label htmlFor="scheduledAt">Date &amp; Time</Label>
                                <Input
                                    id="scheduledAt"
                                    name="scheduledAt"
                                    type="datetime-local"
                                    value={interviewInput.scheduledAt}
                                    onChange={scheduleInputChangeHandler}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="meetingLink">Meeting Link</Label>
                                <Input
                                    id="meetingLink"
                                    name="meetingLink"
                                    type="text"
                                    value={interviewInput.meetingLink}
                                    onChange={scheduleInputChangeHandler}
                                    placeholder="Paste a Google Meet / Zoom link"
                                />
                            </div>
                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={interviewInput.notes}
                                    onChange={scheduleInputChangeHandler}
                                    rows={3}
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="Any details the candidate should know"
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={scheduling}>{scheduling ? "Scheduling..." : "Schedule"}</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ApplicantsTable
