import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Wraps real platform-admin-only pages and blocks anyone who isn't a logged-in platform admin.
// (Not to be confused with src/components/admin/* which is actually the recruiter's management area.)
const PlatformAdminRoute = ({ children }) => {
    // Read the logged-in user from the auth slice in Redux (null if nobody is logged in)
    const { user } = useSelector(store => store.auth);

    // Lets us redirect the user away from this page if they're not allowed here
    const navigate = useNavigate();

    // Runs once when this route is opened, to check if the user is allowed to see it
    useEffect(() => {
        // If nobody is logged in, or the logged-in user is not a platform admin,
        // send them back to the home page instead of showing the admin dashboard
        if (user === null || user.role !== 'admin') {
            navigate("/");
        }
    }, []);

    // If the check above passes, just render the admin page passed in as children
    return (
        <>
            {children}
        </>
    )
};
export default PlatformAdminRoute;
