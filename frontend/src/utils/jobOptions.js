// Shared option lists for anything job-related (search filters and the post-job form).
// These live in one place on purpose: the filter sidebar and the post-job form used to
// hardcode their own lists, so a recruiter could type a location like "Lahore, PK" that
// no filter option would ever match, making the job unreachable by search.

// Cities a job can be posted in / filtered by. Covers the locations used by the seed
// scripts plus "Remote" for jobs with no fixed office.
export const PK_CITIES = [
    "Karachi",
    "Lahore",
    "Islamabad",
    "Rawalpindi",
    "Faisalabad",
    "Multan",
    "Peshawar",
    "Quetta",
    "Sialkot",
    "Gujranwala",
    "Hyderabad",
    "Remote",
];

// Broad role families. The backend matches these as a case-insensitive substring against
// a job's title, description and requirements, so they're deliberately broad words rather
// than exact job titles.
export const INDUSTRY_OPTIONS = [
    "Developer",
    "Engineer",
    "Analyst",
    "Marketing",
    "Finance",
    "Design",
    "Sales",
    "Support",
    "Data Science",
    "Human Resources",
];

// Salary brackets shown in the filter sidebar, each mapped to the numeric min/max the
// backend actually filters on. The ranges are contiguous - an earlier version jumped from
// 40,000 straight to 42,000, so a job paying 41,000 matched no bracket at all.
export const SALARY_RANGES = [
    { label: "PKR 0 - 40,000", salaryMin: 0, salaryMax: 40000 },
    { label: "PKR 40,000 - 100,000", salaryMin: 40000, salaryMax: 100000 },
    { label: "PKR 100,000 - 500,000", salaryMin: 100000, salaryMax: 500000 },
];

// Employment types offered in the post-job form
export const JOB_TYPES = [
    "Full-time",
    "Part-time",
    "Contract",
    "Internship",
    "Temporary",
];

// Experience levels. The Job model stores experienceLevel as a number of years, so each
// human-readable label maps to the number that actually gets saved.
export const EXPERIENCE_LEVELS = [
    { label: "Entry Level (0 years)", value: 0 },
    { label: "Junior (1+ years)", value: 1 },
    { label: "Mid Level (3+ years)", value: 3 },
    { label: "Senior (5+ years)", value: 5 },
    { label: "Lead (8+ years)", value: 8 },
];
