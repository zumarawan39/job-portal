import { setRecommendedJobs } from '@/redux/jobSlice'
import { JOB_API_END_POINT } from '@/utils/constant'
import axios from '@/utils/axiosInstance'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'

// Custom hook: fetches skill-based recommended jobs for the logged-in student and saves them to Redux
const useGetRecommendedJobs = () => {
    const dispatch = useDispatch();
    // Only students get personalized recommendations
    const { user } = useSelector(store => store.auth);
    useEffect(() => {
        if (!(user && user.role === 'student')) return;
        const fetchRecommendedJobs = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/recommended`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setRecommendedJobs(res.data.jobs));
                }
            } catch (error) {
                console.error(error);
                toast.error(error?.response?.data?.message || "Failed to load recommended jobs.");
            }
        }
        fetchRecommendedJobs();
    }, [user])
}

export default useGetRecommendedJobs
