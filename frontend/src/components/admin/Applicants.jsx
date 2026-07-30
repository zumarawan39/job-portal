import React, { useEffect } from 'react'
import Navbar from '../shared/Navbar'
import DashboardLayout from '../shared/DashboardLayout'
import ApplicantsTable from './ApplicantsTable'
import axios from 'axios';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAllApplicants } from '@/redux/applicationSlice';
import { Building2, Briefcase } from 'lucide-react'

const nav = [
    { to: '/admin/companies', label: 'Companies', icon: Building2 },
    { to: '/admin/jobs', label: 'Jobs', icon: Briefcase },
]

// Page that shows all applicants who applied to one specific job (admin only)
const Applicants = () => {
    // Read the job id from the URL (e.g. /admin/jobs/:id/applicants)
    const params = useParams();
    const dispatch = useDispatch();
    // Read the applicants data for this job from the application slice in Redux
    const {applicants} = useSelector(store=>store.application);

    // Runs once when the page loads, to fetch the applicants for this job
    useEffect(() => {
        const fetchAllApplicants = async () => {
            try {
                // Get the job (with its list of applications) using the job id from the URL
                const res = await axios.get(`${APPLICATION_API_END_POINT}/${params.id}/applicants`, { withCredentials: true });
                // Save the applicants list in Redux so the table component can show it
                dispatch(setAllApplicants(res.data.job));
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllApplicants();
    }, []);
    return (
        <div>
            <Navbar />
            <DashboardLayout
                nav={nav}
                title="Applicants"
                description={`${applicants?.applications?.length || 0} applicant${applicants?.applications?.length === 1 ? '' : 's'} for this job`}
            >
                <ApplicantsTable />
            </DashboardLayout>
        </div>
    )
}

export default Applicants
