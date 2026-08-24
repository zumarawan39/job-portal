// A shared axios instance so every API call gets the same defaults and the same
// handling when the session has expired, instead of each call site repeating
// `{ withCredentials: true }` and reacting to a 401 (or not) on its own.
import axios from "axios";
import { toast } from "sonner";
import store from "@/redux/store";
import { setUser } from "@/redux/authSlice";

const axiosInstance = axios.create({
    withCredentials: true,
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401 && window.location.pathname !== "/login") {
            store.dispatch(setUser(null));
            toast.error("Your session has expired. Please log in again.");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
