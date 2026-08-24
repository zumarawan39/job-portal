import { setAllAppliedJobs } from "@/redux/jobSlice";
import { APPLICATION_API_END_POINT } from "@/utils/constant";
import axios from "@/utils/axiosInstance"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { toast } from "sonner"

// Custom hook: fetches the jobs the logged-in user has already applied to
const useGetAppliedJobs = () => {
    const dispatch = useDispatch();

    // Runs once when the component using this hook first renders
    useEffect(()=>{
        const fetchAppliedJobs = async () => {
            try {
                const res = await axios.get(`${APPLICATION_API_END_POINT}/get`, {withCredentials:true});
                if(res.data.success){
                    dispatch(setAllAppliedJobs(res.data.application));
                }
            } catch (error) {
                console.error(error);
                toast.error(error?.response?.data?.message || "Failed to load applied jobs.");
            }
        }
        fetchAppliedJobs();
    },[])
};
export default useGetAppliedJobs;