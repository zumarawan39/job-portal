import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import DashboardLayout from '../shared/DashboardLayout'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import AdminJobsTable from './AdminJobsTable'
import useGetAllAdminJobs from '@/hooks/useGetAllAdminJobs'
import { setSearchJobByText } from '@/redux/jobSlice'
import { Building2, Briefcase } from 'lucide-react'

const nav = [
  { to: '/admin/companies', label: 'Companies', icon: Building2 },
  { to: '/admin/jobs', label: 'Jobs', icon: Briefcase },
]

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
      <DashboardLayout
        nav={nav}
        title="Jobs"
        description="Manage the jobs you've posted"
        actions={
          <>
            <Input
              className="w-full sm:w-56"
              placeholder="Filter by name, role"
              onChange={(e) => setInput(e.target.value)}
            />
            <Button onClick={() => navigate("/admin/jobs/create")}>New Jobs</Button>
          </>
        }
      >
        <AdminJobsTable />
      </DashboardLayout>
    </div>
  )
}

export default AdminJobs
