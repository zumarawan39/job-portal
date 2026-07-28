import { setAllAdminJobs } from '@/redux/jobSlice'
import { JOB_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

// Custom hook: fetches all jobs posted by the logged-in admin and saves them to Redux
const useGetAllAdminJobs = () => {
    const dispatch = useDispatch();
    // Runs once when the component using this hook first renders (empty dependency array)
    useEffect(()=>{
        const fetchAllAdminJobs = async () => {
            try {
                // Ask the backend for jobs created by this admin
                const res = await axios.get(`${JOB_API_END_POINT}/getadminjobs`,{withCredentials:true});
                if(res.data.success){
                    dispatch(setAllAdminJobs(res.data.jobs));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllAdminJobs();
    },[])
}

export default useGetAllAdminJobs