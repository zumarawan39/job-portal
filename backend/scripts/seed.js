// One-off script to fill the database with test data (recruiters, students, companies,
// jobs, applications, interviews, chat messages, notifications) so every feature can be
// clicked through manually. Safe to re-run - it only ever touches the test records it
// creates (matched by the fixed emails/names below), never any other data in the DB.
// Run with: node scripts/seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { Notification } from "../models/notification.model.js";
import { Message } from "../models/message.model.js";

dotenv.config({});

const PASSWORD = "1234";

const SEED_USER_EMAILS = [
    "admin@test.com",
    "recruiter1@test.com",
    "recruiter2@test.com",
    "recruiter3@test.com",
    "student1@test.com",
    "student2@test.com",
    "student3@test.com",
];
// Deliberately distinct from the company/job names in scripts/seedAccounts.js (a separate,
// unrelated seed script also present in this project) - company names are unique in the
// DB, so if two seed scripts picked the same name, whichever ran most recently would
// delete-and-recreate that company out from under the other script's jobs, orphaning them.
const SEED_COMPANY_NAMES = ["NimbusWorks Technologies", "Meridian Growth Marketing", "Apex Capital Advisors"];
const SEED_JOB_TITLES = [
    "Frontend React Developer",
    "Backend Node.js Developer",
    "Digital Marketing Strategist",
    "Marketing Data Analyst",
    "Associate Financial Analyst",
    "Cloud DevOps Engineer",
];

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    // --- clean up any previous run of this exact seed data (never touches other data) ---
    const oldUsers = await User.find({ email: { $in: SEED_USER_EMAILS } });
    const oldUserIds = oldUsers.map((u) => u._id);
    const oldJobs = await Job.find({ title: { $in: SEED_JOB_TITLES } });
    const oldJobIds = oldJobs.map((j) => j._id);

    await Application.deleteMany({ $or: [{ job: { $in: oldJobIds } }, { applicant: { $in: oldUserIds } }] });
    await Notification.deleteMany({ user: { $in: oldUserIds } });
    await Message.deleteMany({ sender: { $in: oldUserIds } });
    await Job.deleteMany({ title: { $in: SEED_JOB_TITLES } });
    await Company.deleteMany({ name: { $in: SEED_COMPANY_NAMES } });
    await User.deleteMany({ email: { $in: SEED_USER_EMAILS } });
    console.log("Cleared previous seed data (if any).");

    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    // --- users ---
    const admin = await User.create({
        fullname: "Admin User",
        email: "admin@test.com",
        phoneNumber: 3000000000,
        password: hashedPassword,
        role: "admin",
    });

    const [recruiter1, recruiter2, recruiter3] = await User.create([
        { fullname: "Ali Khan", email: "recruiter1@test.com", phoneNumber: 3001111111, password: hashedPassword, role: "recruiter" },
        { fullname: "Sara Ahmed", email: "recruiter2@test.com", phoneNumber: 3002222222, password: hashedPassword, role: "recruiter" },
        { fullname: "Bilal Hussain", email: "recruiter3@test.com", phoneNumber: 3003333333, password: hashedPassword, role: "recruiter" },
    ]);

    const [student1, student2, student3] = await User.create([
        {
            fullname: "Ahmed Raza", email: "student1@test.com", phoneNumber: 3004444444, password: hashedPassword, role: "student",
            profile: { bio: "Frontend-leaning full stack developer.", skills: ["React", "JavaScript", "Node.js", "MongoDB", "CSS"] },
        },
        {
            fullname: "Fatima Noor", email: "student2@test.com", phoneNumber: 3005555555, password: hashedPassword, role: "student",
            profile: { bio: "Data-focused analyst, loves spreadsheets and SQL.", skills: ["Python", "SQL", "Data Analysis", "Excel"] },
            twoFactorEnabled: true, // lets you test the email-OTP login flow with this account
        },
        {
            fullname: "Hassan Ali", email: "student3@test.com", phoneNumber: 3006666666, password: hashedPassword, role: "student",
            profile: { bio: "Backend/cloud engineer.", skills: ["Java", "Spring Boot", "AWS", "Docker"] },
        },
    ]);
    console.log("Created users:", [admin, recruiter1, recruiter2, recruiter3, student1, student2, student3].length);

    // --- companies (one per recruiter) + link back onto the recruiter's profile ---
    const [company1, company2, company3] = await Company.create([
        { name: "NimbusWorks Technologies", description: "A software house building web & cloud products.", website: "https://nimbusworks.example.com", location: "Karachi", userId: recruiter1._id },
        { name: "Meridian Growth Marketing", description: "Full-service digital marketing agency.", website: "https://meridiangrowth.example.com", location: "Lahore", userId: recruiter2._id },
        { name: "Apex Capital Advisors", description: "Financial services and fintech consulting.", website: "https://apexcapital.example.com", location: "Islamabad", userId: recruiter3._id },
    ]);
    recruiter1.profile.company = company1._id; await recruiter1.save();
    recruiter2.profile.company = company2._id; await recruiter2.save();
    recruiter3.profile.company = company3._id; await recruiter3.save();
    console.log("Created companies:", 3);

    // --- jobs (two per company, varied location/salary/type for filter testing) ---
    const [job1, job2, job3, job4, job5, job6] = await Job.create([
        { title: "Frontend React Developer", description: "Build and maintain our customer-facing React dashboards.", requirements: ["React", "JavaScript", "CSS", "Tailwind"], salary: 80000, experienceLevel: 2, location: "Karachi", jobType: "Full-time", position: 2, company: company1._id, created_by: recruiter1._id },
        { title: "Backend Node.js Developer", description: "Design and scale our Node.js/MongoDB backend services.", requirements: ["Node.js", "MongoDB", "Express", "JavaScript"], salary: 100000, experienceLevel: 3, location: "Karachi", jobType: "Full-time", position: 1, company: company1._id, created_by: recruiter1._id },
        { title: "Digital Marketing Strategist", description: "Run SEO and social media campaigns for our clients.", requirements: ["SEO", "Content Writing", "Social Media"], salary: 60000, experienceLevel: 1, location: "Lahore", jobType: "Full-time", position: 3, company: company2._id, created_by: recruiter2._id },
        { title: "Marketing Data Analyst", description: "Analyze campaign performance data and report insights.", requirements: ["Python", "SQL", "Data Analysis"], salary: 70000, experienceLevel: 2, location: "Lahore", jobType: "Part-time", position: 1, company: company2._id, created_by: recruiter2._id },
        { title: "Associate Financial Analyst", description: "Support financial modeling and reporting for clients.", requirements: ["Excel", "Finance", "SQL"], salary: 90000, experienceLevel: 1, location: "Islamabad", jobType: "Full-time", position: 2, company: company3._id, created_by: recruiter3._id },
        { title: "Cloud DevOps Engineer", description: "Own our AWS infrastructure and CI/CD pipelines.", requirements: ["AWS", "Docker", "Java", "Spring Boot"], salary: 150000, experienceLevel: 3, location: "Islamabad", jobType: "Full-time", position: 1, company: company3._id, created_by: recruiter3._id },
    ]);
    console.log("Created jobs:", 6);

    // --- applications: a spread of statuses, an interview + chat on the accepted ones ---
    const applyAndLink = async (job, applicant, status) => {
        const application = await Application.create({ job: job._id, applicant: applicant._id, status });
        job.applications.push(application._id);
        await job.save();
        return application;
    };

    const app1 = await applyAndLink(job1, student1, "pending");
    const app2 = await applyAndLink(job2, student1, "accepted");
    const app3 = await applyAndLink(job4, student2, "rejected");
    const app4 = await applyAndLink(job5, student2, "pending");
    const app5 = await applyAndLink(job6, student3, "accepted");
    const app6 = await applyAndLink(job1, student3, "pending");
    console.log("Created applications:", 6);

    // interviews scheduled on the two accepted applications
    app2.interview = { scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), meetingLink: "https://meet.google.com/test-interview-link-1", notes: "Bring a laptop for a short live-coding round." };
    await app2.save();
    app5.interview = { scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), meetingLink: "https://meet.google.com/test-interview-link-2", notes: "Panel interview with the infra team." };
    await app5.save();

    // notifications mirroring exactly what the real controllers create
    await Notification.create([
        { user: student1._id, message: `Your application for "${job2.title}" has been accepted.`, type: "application_status", relatedJob: job2._id },
        { user: student1._id, message: `An interview has been scheduled for your application to "${job2.title}".`, type: "application_status", relatedJob: job2._id },
        { user: student2._id, message: `Your application for "${job4.title}" has been rejected.`, type: "application_status", relatedJob: job4._id },
        { user: student3._id, message: `Your application for "${job6.title}" has been accepted.`, type: "application_status", relatedJob: job6._id },
        { user: student3._id, message: `An interview has been scheduled for your application to "${job6.title}".`, type: "application_status", relatedJob: job6._id },
    ]);
    console.log("Created notifications: 5");

    // chat messages on the two accepted applications, so ChatBox has history immediately
    await Message.create([
        { application: app2._id, sender: recruiter1._id, text: "Hi Ahmed, thanks for applying! We'd like to move forward." },
        { application: app2._id, sender: student1._id, text: "That's great to hear, thank you! Looking forward to it." },
        { application: app2._id, sender: recruiter1._id, text: "I've scheduled an interview - check the link and let me know if the time works." },
        { application: app5._id, sender: recruiter3._id, text: "Hi Hassan, your background is a great fit for the DevOps role." },
        { application: app5._id, sender: student3._id, text: "Thank you! Happy to answer any questions before the interview." },
    ]);
    console.log("Created chat messages: 5");

    // saved jobs (bookmarks), to populate the "Saved Jobs" page
    student1.savedJobs.push(job4._id, job6._id); await student1.save();
    student2.savedJobs.push(job2._id); await student2.save();
    student3.savedJobs.push(job3._id); await student3.save();
    console.log("Saved jobs set for students.");

    console.log("\nSeed complete. All test accounts use password: " + PASSWORD);
    console.log(`
Admin:      admin@test.com
Recruiters: recruiter1@test.com (NimbusWorks Technologies), recruiter2@test.com (Meridian Growth Marketing), recruiter3@test.com (Apex Capital Advisors)
Students:   student1@test.com (Ahmed - React/Node skills), student2@test.com (Fatima - has 2FA ON, Python/SQL skills), student3@test.com (Hassan - Java/AWS skills)
`);

    await mongoose.disconnect();
    process.exit(0);
};

run().catch((err) => {
    console.log(err);
    process.exit(1);
});
