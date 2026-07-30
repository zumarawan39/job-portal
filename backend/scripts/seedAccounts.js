// One-off script to create test accounts and job postings: 1 admin, 5 job seekers,
// and 10 companies each with their own recruiter account and 3 job postings (30 total).
// Every account uses the password "1234".
// Safe to re-run - it only deletes/recreates records matching the fixed emails/names
// below, never any other data in the DB.
// Run with: node scripts/seedAccounts.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";

dotenv.config({});

const PASSWORD = "1234";

const ADMIN = { fullname: "Admin User", email: "admin@jobportal.com", phoneNumber: 3000000000 };

const JOB_SEEKERS = [
    { fullname: "Ahmed Raza", email: "ahmed.raza@student.com", phoneNumber: 3001000001, bio: "Frontend-leaning full stack developer.", skills: ["React", "JavaScript", "Node.js", "MongoDB", "CSS"] },
    { fullname: "Fatima Noor", email: "fatima.noor@student.com", phoneNumber: 3001000002, bio: "Data-focused analyst, loves spreadsheets and SQL.", skills: ["Python", "SQL", "Data Analysis", "Excel"] },
    { fullname: "Hassan Ali", email: "hassan.ali@student.com", phoneNumber: 3001000003, bio: "Backend/cloud engineer.", skills: ["Java", "Spring Boot", "AWS", "Docker"] },
    { fullname: "Mariam Yousaf", email: "mariam.yousaf@student.com", phoneNumber: 3001000004, bio: "Digital marketer with an eye for growth.", skills: ["SEO", "Content Writing", "Social Media"] },
    { fullname: "Omar Farooq", email: "omar.farooq@student.com", phoneNumber: 3001000005, bio: "Product-minded UI/UX designer.", skills: ["Figma", "UI/UX", "Adobe XD"] },
];

// Each entry is one company + the recruiter who owns it + 3 jobs that company posts
const COMPANIES = [
    {
        company: "TechNova Solutions", location: "Karachi", website: "https://technova.example.com", recruiter: "Ali Khan", email: "ali.khan@technova.com",
        jobs: [
            { title: "Frontend Developer", description: "Build and maintain our customer-facing React dashboards.", requirements: ["React", "JavaScript", "CSS", "Tailwind"], salary: 90000, experienceLevel: 2, jobType: "Full-time", position: 2 },
            { title: "Backend Developer", description: "Design and scale our Node.js/MongoDB backend services.", requirements: ["Node.js", "MongoDB", "Express", "JavaScript"], salary: 110000, experienceLevel: 3, jobType: "Full-time", position: 1 },
            { title: "FullStack Developer", description: "Own features end-to-end across our React frontend and Node backend.", requirements: ["React", "Node.js", "MongoDB"], salary: 130000, experienceLevel: 3, jobType: "Full-time", position: 1 },
        ],
    },
    {
        company: "Bright Marketing Co", location: "Lahore", website: "https://brightmarketing.example.com", recruiter: "Sara Ahmed", email: "sara.ahmed@brightmarketing.com",
        jobs: [
            { title: "Digital Marketing Executive", description: "Run SEO and social media campaigns for our clients.", requirements: ["SEO", "Content Writing", "Social Media"], salary: 45000, experienceLevel: 1, jobType: "Full-time", position: 3 },
            { title: "SEO Specialist", description: "Improve organic search rankings for a portfolio of client websites.", requirements: ["SEO", "Google Analytics", "Content Writing"], salary: 38000, experienceLevel: 1, jobType: "Full-time", position: 2 },
            { title: "Social Media Manager", description: "Plan and manage social media calendars and ad campaigns.", requirements: ["Social Media", "Content Writing", "Canva"], salary: 55000, experienceLevel: 2, jobType: "Full-time", position: 1 },
        ],
    },
    {
        company: "Skyline Finance Group", location: "Islamabad", website: "https://skylinefinance.example.com", recruiter: "Bilal Hussain", email: "bilal.hussain@skylinefinance.com",
        jobs: [
            { title: "Junior Financial Analyst", description: "Support financial modeling and reporting for clients.", requirements: ["Excel", "Finance", "SQL"], salary: 60000, experienceLevel: 1, jobType: "Full-time", position: 2 },
            { title: "Senior Accountant", description: "Manage client accounts and oversee monthly financial closing.", requirements: ["Accounting", "Excel", "Taxation"], salary: 95000, experienceLevel: 3, jobType: "Full-time", position: 1 },
            { title: "Investment Advisor", description: "Advise clients on investment portfolios and financial planning.", requirements: ["Finance", "Investment Analysis"], salary: 120000, experienceLevel: 4, jobType: "Full-time", position: 1 },
        ],
    },
    {
        company: "GreenLeaf Agritech", location: "Faisalabad", website: "https://greenleaf.example.com", recruiter: "Ayesha Malik", email: "ayesha.malik@greenleaf.com",
        jobs: [
            { title: "Agricultural Field Officer", description: "Work with local farmers to roll out new crop technologies.", requirements: ["Agronomy", "Field Work"], salary: 40000, experienceLevel: 1, jobType: "Full-time", position: 3 },
            { title: "Agri Data Analyst", description: "Analyze crop yield and sensor data to guide farming recommendations.", requirements: ["Python", "SQL", "Data Analysis"], salary: 65000, experienceLevel: 2, jobType: "Full-time", position: 1 },
            { title: "Backend Developer", description: "Build the APIs behind our farm IoT sensor platform.", requirements: ["Node.js", "MongoDB", "IoT"], salary: 100000, experienceLevel: 2, jobType: "Full-time", position: 1 },
        ],
    },
    {
        company: "Horizon Logistics", location: "Multan", website: "https://horizonlogistics.example.com", recruiter: "Usman Tariq", email: "usman.tariq@horizonlogistics.com",
        jobs: [
            { title: "Logistics Coordinator", description: "Coordinate daily shipments and driver schedules.", requirements: ["Logistics", "Excel"], salary: 42000, experienceLevel: 1, jobType: "Full-time", position: 2 },
            { title: "Fleet Operations Manager", description: "Oversee fleet maintenance, routing, and driver performance.", requirements: ["Fleet Management", "Operations"], salary: 85000, experienceLevel: 3, jobType: "Full-time", position: 1 },
            { title: "Supply Chain Analyst", description: "Analyze delivery data to improve route efficiency and costs.", requirements: ["Excel", "Data Analysis", "SQL"], salary: 60000, experienceLevel: 2, jobType: "Full-time", position: 1 },
        ],
    },
    {
        company: "Pixel Forge Studios", location: "Peshawar", website: "https://pixelforge.example.com", recruiter: "Zara Sheikh", email: "zara.sheikh@pixelforge.com",
        jobs: [
            { title: "Frontend Developer", description: "Build slick web UIs for our browser-based games.", requirements: ["React", "JavaScript", "CSS"], salary: 80000, experienceLevel: 2, jobType: "Full-time", position: 1 },
            { title: "Game Designer", description: "Design gameplay mechanics and levels for mobile games.", requirements: ["Game Design", "Figma"], salary: 70000, experienceLevel: 2, jobType: "Full-time", position: 2 },
            { title: "FullStack Developer", description: "Build both the game backend services and the companion web dashboard.", requirements: ["React", "Node.js"], salary: 95000, experienceLevel: 2, jobType: "Full-time", position: 1 },
        ],
    },
    {
        company: "MedCare Health Systems", location: "Quetta", website: "https://medcare.example.com", recruiter: "Hamza Iqbal", email: "hamza.iqbal@medcare.com",
        jobs: [
            { title: "Backend Developer", description: "Build secure APIs for our electronic health records platform.", requirements: ["Node.js", "MongoDB", "Security"], salary: 105000, experienceLevel: 3, jobType: "Full-time", position: 1 },
            { title: "Hospital Operations Coordinator", description: "Coordinate scheduling and admin across partner clinics.", requirements: ["Operations", "Excel"], salary: 50000, experienceLevel: 1, jobType: "Full-time", position: 2 },
            { title: "Clinical Data Analyst", description: "Analyze patient outcome data to support clinical decisions.", requirements: ["SQL", "Data Analysis", "Excel"], salary: 68000, experienceLevel: 2, jobType: "Full-time", position: 1 },
        ],
    },
    {
        company: "Quantum Data Labs", location: "Rawalpindi", website: "https://quantumdata.example.com", recruiter: "Nida Farooq", email: "nida.farooq@quantumdata.com",
        jobs: [
            { title: "FullStack Developer", description: "Build the dashboards and APIs powering our analytics platform.", requirements: ["React", "Node.js", "MongoDB"], salary: 140000, experienceLevel: 3, jobType: "Full-time", position: 1 },
            { title: "Data Scientist", description: "Build predictive models on large-scale client datasets.", requirements: ["Python", "Machine Learning", "SQL"], salary: 150000, experienceLevel: 3, jobType: "Full-time", position: 1 },
            { title: "Backend Developer", description: "Build and maintain our data-processing pipelines.", requirements: ["Python", "Node.js", "AWS"], salary: 130000, experienceLevel: 3, jobType: "Full-time", position: 1 },
        ],
    },
    {
        company: "Urban Builders Construction", location: "Sialkot", website: "https://urbanbuilders.example.com", recruiter: "Kashif Raza", email: "kashif.raza@urbanbuilders.com",
        jobs: [
            { title: "Civil Site Engineer", description: "Oversee construction sites and ensure work meets specifications.", requirements: ["Civil Engineering", "AutoCAD"], salary: 75000, experienceLevel: 2, jobType: "Full-time", position: 2 },
            { title: "Construction Project Manager", description: "Manage timelines, budgets, and contractors across active sites.", requirements: ["Project Management", "Construction"], salary: 130000, experienceLevel: 4, jobType: "Full-time", position: 1 },
            { title: "Frontend Developer", description: "Build internal tools for tracking site progress and budgets.", requirements: ["React", "JavaScript"], salary: 85000, experienceLevel: 2, jobType: "Full-time", position: 1 },
        ],
    },
    {
        company: "EduSpark Learning", location: "Gujranwala", website: "https://eduspark.example.com", recruiter: "Mahnoor Siddiqui", email: "mahnoor.siddiqui@eduspark.com",
        jobs: [
            { title: "FullStack Developer", description: "Build features across our learning management system.", requirements: ["React", "Node.js", "MongoDB"], salary: 100000, experienceLevel: 2, jobType: "Full-time", position: 1 },
            { title: "Curriculum Content Writer", description: "Write and review lesson content for our online courses.", requirements: ["Content Writing", "Curriculum Design"], salary: 35000, experienceLevel: 1, jobType: "Full-time", position: 2 },
            { title: "Frontend Developer", description: "Build the student-facing course player and progress dashboard.", requirements: ["React", "JavaScript", "CSS"], salary: 82000, experienceLevel: 2, jobType: "Full-time", position: 1 },
        ],
    },
];

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const allEmails = [ADMIN.email, ...JOB_SEEKERS.map((s) => s.email), ...COMPANIES.map((c) => c.email)];
    const companyNames = COMPANIES.map((c) => c.company);

    // --- clean up any previous run of this exact seed data (never touches other data) ---
    const oldCompanies = await Company.find({ name: { $in: companyNames } });
    await Job.deleteMany({ company: { $in: oldCompanies.map((c) => c._id) } });
    await Company.deleteMany({ name: { $in: companyNames } });
    await User.deleteMany({ email: { $in: allEmails } });
    console.log("Cleared previous seed data (if any).");

    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    // --- admin ---
    await User.create({
        fullname: ADMIN.fullname,
        email: ADMIN.email,
        phoneNumber: ADMIN.phoneNumber,
        password: hashedPassword,
        role: "admin",
    });
    console.log("Created admin:", ADMIN.email);

    // --- job seekers ---
    await User.create(
        JOB_SEEKERS.map((s) => ({
            fullname: s.fullname,
            email: s.email,
            phoneNumber: s.phoneNumber,
            password: hashedPassword,
            role: "student",
            profile: { bio: s.bio, skills: s.skills },
        }))
    );
    console.log(`Created ${JOB_SEEKERS.length} job seekers.`);

    // --- recruiters + their companies (one company per recruiter) + each company's jobs ---
    let jobCount = 0;
    for (const entry of COMPANIES) {
        const recruiter = await User.create({
            fullname: entry.recruiter,
            email: entry.email,
            phoneNumber: 3002000000 + COMPANIES.indexOf(entry),
            password: hashedPassword,
            role: "recruiter",
        });

        const company = await Company.create({
            name: entry.company,
            description: `${entry.company} is a growing company based in ${entry.location}.`,
            website: entry.website,
            location: entry.location,
            userId: recruiter._id,
        });

        recruiter.profile.company = company._id;
        await recruiter.save();

        await Job.create(
            entry.jobs.map((job) => ({
                ...job,
                location: entry.location,
                company: company._id,
                created_by: recruiter._id,
            }))
        );
        jobCount += entry.jobs.length;
    }
    console.log(`Created ${COMPANIES.length} companies with their recruiters.`);
    console.log(`Created ${jobCount} jobs.`);

    console.log("\nSeed complete. All accounts use password: " + PASSWORD);
    console.log(`
Admin:      ${ADMIN.email}
Job seekers: ${JOB_SEEKERS.map((s) => s.email).join(", ")}
Recruiters:  ${COMPANIES.map((c) => `${c.email} (${c.company})`).join(", ")}
`);

    await mongoose.disconnect();
    process.exit(0);
};

run().catch((err) => {
    console.log(err);
    process.exit(1);
});
