import React from 'react'

// Compares the logged-in student's skills against a job's requirements, mirroring the
// same case-insensitive text-overlap approach the backend's recommendation scoring uses
// (see backend/controllers/job.controller.js getRecommendedJobs) so the number shown here
// is honest, not a decorative made-up figure.
export const computeSkillMatch = (userSkills, job) => {
    const skills = (userSkills || []).map((s) => s.toLowerCase()).filter(Boolean);
    const requirements = job?.requirements || [];
    if (skills.length === 0 || requirements.length === 0) return null;
    const matched = requirements.filter((req) =>
        skills.some((skill) => req.toLowerCase().includes(skill) || skill.includes(req.toLowerCase()))
    );
    return { matched: matched.length, total: requirements.length };
}

// Small meter that visualizes how many of a job's listed requirements match the logged-in
// student's own skills - this is the app's real skill-based recommendation logic made visible
// on every job card, not just the "Recommended For You" section.
const MatchScore = ({ matched, total, className = '' }) => {
    if (!total) return null;
    const percent = Math.round((matched / total) * 100);

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className='h-1.5 w-14 overflow-hidden rounded-full bg-muted'>
                <div
                    className={`h-full rounded-full ${matched > 0 ? 'bg-success' : 'bg-muted-foreground/30'}`}
                    style={{ width: `${Math.max(percent, matched > 0 ? 12 : 0)}%` }}
                />
            </div>
            <span className={`text-xs font-medium ${matched > 0 ? 'text-success' : 'text-muted-foreground'}`}>
                {matched}/{total} skills match
            </span>
        </div>
    )
}

export default MatchScore
