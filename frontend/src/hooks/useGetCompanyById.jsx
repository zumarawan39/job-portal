import { setSingleCompany } from '@/redux/companySlice'
import { setAllJobs } from '@/redux/jobSlice'
import { COMPANY_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant'
import axios from '@/utils/axiosInstance'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'

// Custom hook: fetches one company's details by its ID and saves it to Redux
const useGetCompanyById = (companyId) => {
    const dispatch = useDispatch();
    // Re-runs whenever the companyId changes, so switching companies refetches data
    useEffect(()=>{
        const fetchSingleCompany = async () => {
            try {
                const res = await axios.get(`${COMPANY_API_END_POINT}/get/${companyId}`,{withCredentials:true});
                if(res.data.success){
                    dispatch(setSingleCompany(res.data.company));
                }
            } catch (error) {
                console.error(error);
                toast.error(error?.response?.data?.message || "Failed to load company details.");
            }
        }
        fetchSingleCompany();
    },[companyId, dispatch])
}

export default useGetCompanyById