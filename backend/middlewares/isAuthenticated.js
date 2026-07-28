import jwt from "jsonwebtoken";

// Middleware that checks if the user sent a valid login token before letting them continue
const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token; // read the token saved in the cookie
        if (!token) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false,
            })
        }
        // verify the token was really created by us and hasn't expired
        const decode = await jwt.verify(token, process.env.SECRET_KEY);
        if(!decode){
            return res.status(401).json({
                message:"Invalid token",
                success:false
            })
        };
        req.id = decode.userId; // attach the logged-in user's id to the request so later code can use it
        next(); // move on to the actual route handler
    } catch (error) {
        console.log(error);
    }
}
export default isAuthenticated;