import React, { useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { useSelector } from 'react-redux'
import ChatBox from './chat/ChatBox'
import InterviewDetails from './InterviewDetails'

// Shows a table listing all the jobs the logged-in user has applied to
const AppliedJobTable = () => {
    // Read the list of applied jobs from the job slice of Redux state
    const {allAppliedJobs} = useSelector(store=>store.job);
    // Tracks which application's chat dialog is currently open (null = none)
    const [chatApplicationId, setChatApplicationId] = useState(null);

    return (
        <div>
            <Table>
                <TableCaption>A list of your applied jobs</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Job Role</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Message</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        // Show a message if there are no applied jobs, otherwise list each applied job as a row
                        allAppliedJobs.length <= 0 ? <span>You haven't applied any job yet.</span> : allAppliedJobs.map((appliedJob) => (
                            <TableRow key={appliedJob._id}>
                                <TableCell>{appliedJob?.createdAt?.split("T")[0]}</TableCell>
                                <TableCell>{appliedJob.job?.title}</TableCell>
                                <TableCell>{appliedJob.job?.company?.name}</TableCell>
                                <TableCell>
                                    <Badge className={`${appliedJob?.status === "rejected" ? 'bg-red-400' : appliedJob.status === 'pending' ? 'bg-gray-400' : 'bg-green-400'}`}>{appliedJob.status.toUpperCase()}</Badge>
                                    {/* If a recruiter has scheduled an interview for this application, show the details here */}
                                    <InterviewDetails interview={appliedJob.interview} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" variant="outline" onClick={() => setChatApplicationId(appliedJob._id)}>Message</Button>
                                </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
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

export default AppliedJobTable
