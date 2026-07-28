import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Input } from '../ui/input'
import { Button } from '../ui/button' 
import { useNavigate } from 'react-router-dom' 
import { useDispatch } from 'react-redux' 
import AdminJobsTable from './AdminJobsTable'
import useGetAllAdminJobs from '@/hooks/useGetAllAdminJobs'
import { setSearchJobByText } from '@/redux/jobSlice'

// Page for admins to see all jobs they posted, search them, and create new ones
const AdminJobs = () => {
  // Custom hook that fetches all jobs posted by this admin/recruiter
  useGetAllAdminJobs();
  // Text typed into the search box
  const [input, setInput] = useState("");
  // Lets us send the user to another page (like the create job page)
  const navigate = useNavigate();
  // Lets us send actions to the Redux store
  const dispatch = useDispatch();

  // Runs every time the search text changes, so the job list stays filtered live
  useEffect(() => {
    // Save the search text in Redux so the table component can filter jobs by it
    dispatch(setSearchJobByText(input));
  }, [input]);
  return (
    <div>
      <Navbar />
      <div className='max-w-6xl mx-auto my-10'>
        <div className='flex items-center justify-between my-5'>
          <Input
            className="w-fit"
            placeholder="Filter by name, role"
            onChange={(e) => setInput(e.target.value)}
          />
          <Button onClick={() => navigate("/admin/jobs/create")}>New Jobs</Button>
        </div>
        <AdminJobsTable />
      </div>
    </div>
  )
}

export default AdminJobs