import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Card, CardContent } from '../ui/card'
import { Eye, MoreHorizontal } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

// Table that lists jobs posted by the admin, with a view-applicants action
const AdminJobsTable = () => {
    // Read the list of all admin jobs and the current search text from the job slice in Redux
    const {allAdminJobs, searchJobByText} = useSelector(store=>store.job);

    // Jobs left after filtering by the search text, this is what actually gets rendered
    const [filterJobs, setFilterJobs] = useState(allAdminJobs);
    // Lets us send the user to the applicants page
    const navigate = useNavigate();

    // Re-run the filter whenever the job list or the search text changes
    useEffect(()=>{
        console.log('called');
        // Keep only jobs whose title or company name matches the search text
        const filteredJobs = allAdminJobs.filter((job)=>{
            if(!searchJobByText){
                return true;
            };
            return job?.title?.toLowerCase().includes(searchJobByText.toLowerCase()) || job?.company?.name.toLowerCase().includes(searchJobByText.toLowerCase());

        });
        setFilterJobs(filteredJobs);
    },[allAdminJobs,searchJobByText])
    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableCaption className="pb-4">A list of your recent  posted jobs</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Company Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            // Render one table row per filtered job
                            filterJobs?.map((job) => (
                                <TableRow key={job._id}>
                                    <TableCell className="font-medium">{job?.company?.name}</TableCell>
                                    <TableCell>{job?.title}</TableCell>
                                    <TableCell className="text-muted-foreground">{job?.createdAt.split("T")[0]}</TableCell>
                                    <TableCell className="text-right cursor-pointer">
                                        <Popover>
                                            <PopoverTrigger className="rounded-md p-1 hover:bg-accent">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </PopoverTrigger>
                                            <PopoverContent className="w-40 p-1">
                                                <div onClick={()=> navigate(`/admin/jobs/${job._id}/applicants`)} className='flex items-center w-full gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground'>
                                                    <Eye className='w-4 h-4'/>
                                                    <span>Applicants</span>
                                                </div>
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
    )
}

export default AdminJobsTable
