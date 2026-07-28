import { setSavedJobIds } from '@/redux/jobSlice'
import { JOB_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// Custom hook: fetches the ids of jobs the logged-in student has saved and stores them in Redux,
// so any Job card anywhere in the app can know whether it's currently saved
const useGetSavedJobs = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(store => store.auth);
    useEffect(() => {
        // Only students save jobs - skip for recruiters/admins/logged-out visitors
        if (!user || user.role !== 'student') return;
        const fetchSavedJobs = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/saved`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setSavedJobIds(res.data.jobs.map(job => job._id)));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchSavedJobs();
    }, [user])
}

export default useGetSavedJobs
