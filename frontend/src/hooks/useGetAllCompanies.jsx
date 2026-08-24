import { setCompanies} from '@/redux/companySlice'
import { COMPANY_API_END_POINT} from '@/utils/constant'
import axios from '@/utils/axiosInstance'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'

// Custom hook: fetches all companies created by the admin and saves them to Redux
const useGetAllCompanies = () => {
    const dispatch = useDispatch();
    // Runs once when the component using this hook first renders
    useEffect(()=>{
        const fetchCompanies = async () => {
            try {
                const res = await axios.get(`${COMPANY_API_END_POINT}/get`,{withCredentials:true});
                if(res.data.success){
                    dispatch(setCompanies(res.data.companies));
                }
            } catch (error) {
                console.error(error);
                toast.error(error?.response?.data?.message || "Failed to load companies.");
            }
        }
        fetchCompanies();
    },[])
}

export default useGetAllCompanies