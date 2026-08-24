import mongoose from "mongoose";

// Connect our app to the MongoDB database using the URI from .env
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('mongodb connected successfully');
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1); // keep the server from staying up with no database
    }
}
export default connectDB;