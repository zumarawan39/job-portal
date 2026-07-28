import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Wraps admin-only pages and blocks anyone who isn't a logged-in recruiter
const ProtectedRoute = ({children}) => {
    // Read the logged-in user from the auth slice in Redux (null if nobody is logged in)
    const {user} = useSelector(store=>store.auth);

    // Lets us redirect the user away from this page if they're not allowed here
    const navigate = useNavigate();

    // Runs once when this route is opened, to check if the user is allowed to see it
    useEffect(()=>{
        // If nobody is logged in, or the logged-in user is not a recruiter (admin),
        // send them back to the home page instead of showing the admin page
        if(user === null || user.role !== 'recruiter'){
            navigate("/");
        }
    },[]);

    // If the check above passes, just render the admin page passed in as children
    return (
        <>
        {children}
        </>
    )
};
export default ProtectedRoute;