import { User } from "../models/user.model.js";

// Middleware that runs after isAuthenticated and only lets admins continue
const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                message: "Access denied. Admins only.",
                success: false
            })
        }
        next(); // move on to the actual route handler
    } catch (error) {
        console.log(error);
    }
}
export default isAdmin;
