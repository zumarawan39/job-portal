import { setAllJobs } from '@/redux/jobSlice'
import { JOB_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// Custom hook: fetches jobs matching the current search query + filters and saves them to Redux
const useGetAllJobs = () => {
    const dispatch = useDispatch();
    // Reads the current search keyword and job filters from the Redux store
    const { searchedQuery, filters = {} } = useSelector(store => store.job);
    useEffect(() => {
        const fetchAllJobs = async () => {
            try {
                // Build the query string, only including params that actually have a value
                const params = new URLSearchParams();
                if (searchedQuery) params.append("keyword", searchedQuery);
                if (filters.location) params.append("location", filters.location);
                if (filters.industry) params.append("industry", filters.industry);
                if (filters.salaryMin !== "" && filters.salaryMin !== undefined && filters.salaryMin !== null) {
                    params.append("salaryMin", filters.salaryMin);
                }
                if (filters.salaryMax !== "" && filters.salaryMax !== undefined && filters.salaryMax !== null) {
                    params.append("salaryMax", filters.salaryMax);
                }
                // Send the search keyword + filters to the backend so it can filter jobs
                const res = await axios.get(`${JOB_API_END_POINT}/get?${params.toString()}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setAllJobs(res.data.jobs));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllJobs();
    }, [searchedQuery, filters.location, filters.industry, filters.salaryMin, filters.salaryMax])
}

export default useGetAllJobs
