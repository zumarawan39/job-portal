# Job Portal Web Application — Full Project Documentation

This document explains the whole project from A to Z: what it is, how it's built, how to run it, what actually works, and what's described in the FYP report but isn't in the code. It's written for a beginner — no prior knowledge of this specific codebase assumed.

---

## 1. What This Project Is

A MERN-stack (MongoDB, Express, React, Node.js) job portal with three kinds of users:

- **Students (job seekers):** sign up, optionally turn on email-code two-factor login, build a profile with a resume, browse/search/filter jobs, get skill-based recommendations, save jobs for later, apply, and chat with recruiters about their applications.
- **Recruiters:** sign up, register a company, post job openings, review/accept/reject applicants, message applicants directly, and schedule interviews (with a pasted-in meeting link).
- **Admins:** a platform-owner account (created manually, not through signup) that can see stats and remove any user, job, or company.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 19 + Vite (not Next.js) |
| Styling | Tailwind CSS 3 + shadcn/ui (Radix primitives) |
| Animations | Framer Motion |
| Frontend state | Redux Toolkit + redux-persist (keeps login state after refresh) |
| Routing | React Router v7, with route-level code-splitting (`React.lazy`) |
| HTTP client | Axios |
| Real-time | Socket.io (recruiter ↔ student chat per application) |
| Backend framework | Express 4 on Node.js |
| Database | MongoDB via Mongoose 8 |
| Authentication | JWT in an httpOnly cookie + bcrypt password hashing + optional email-OTP two-factor login |
| Validation | Zod (register/login/post-job/register-company request bodies) |
| File uploads | Multer (in-memory) → Cloudinary (resumes, profile photos, company logos) |
| Email | Nodemailer (password reset, 2FA codes, application status + interview emails) |

**Note on the FYP report vs. the real code:** the submitted documentation (Chapter 1.9) describes the frontend as **Next.js + Material-UI**. The actual project is built with **Vite + React + Tailwind CSS + shadcn/ui**, not Next.js/MUI. If your report needs to match the code 1:1 for your defense, you may want to correct that section, or mention it was changed during development.

---

## 3. Project Structure

```
jobportal-yt/
├── backend/
│   ├── index.js                     Server entry point: express app + Socket.io on one http server
│   ├── controllers/
│   │   ├── user.controller.js           register, login, verifyLoginOtp, toggleTwoFactor, logout,
│   │   │                                 updateProfile, forgotPassword, resetPassword
│   │   ├── company.controller.js        registerCompany, getCompany(s), updateCompany
│   │   ├── job.controller.js            postJob, getAllJobs, getJobById, getAdminJobs,
│   │   │                                 getRecommendedJobs, toggleSaveJob, getSavedJobs
│   │   ├── application.controller.js    applyJob, getAppliedJobs, getApplicants, updateStatus
│   │   │                                 (creates a notification + email), scheduleInterview
│   │   ├── admin.controller.js          getStats, getAllUsers, deleteUser, getAllJobsAdmin,
│   │   │                                 deleteJobAdmin, getAllCompaniesAdmin, deleteCompanyAdmin
│   │   ├── notification.controller.js   getMyNotifications, markAsRead, markAllAsRead
│   │   └── message.controller.js        getMessages (chat history for one application)
│   ├── middlewares/
│   │   ├── isAuthenticated.js        Checks the JWT cookie before letting a request through
│   │   ├── isAdmin.js                Checks the logged-in user's role is 'admin'
│   │   ├── validate.js               Validates req.body against a Zod schema before the controller runs
│   │   └── mutler.js                 Multer config for file uploads (typo of "multer", left as-is)
│   ├── models/                       User, Company, Job, Application, Notification, Message
│   ├── validators/                   Zod schemas: authValidators, jobValidators, companyValidators
│   ├── sockets/
│   │   └── chatSocket.js             Socket.io "join_room" / "send_message" → "receive_message"
│   ├── routes/                       One router per resource, mounted under /api/v1/*
│   ├── scripts/
│   │   └── makeAdmin.js              One-off CLI script to promote a user to admin
│   ├── utils/
│   │   ├── db.js                     Connects to MongoDB
│   │   ├── cloudinary.js             Cloudinary config
│   │   ├── datauri.js                Converts an uploaded file into a data URI for Cloudinary
│   │   └── sendEmail.js              Nodemailer wrapper (skips gracefully if not configured)
│   ├── render.yaml                   Render.com deployment blueprint
│   ├── .env.example                  Every env var this app needs, with comments
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── main.jsx                  App entry point (Redux Provider, persistence, toasts)
    │   ├── App.jsx                   All page routes, each lazy-loaded + wrapped in Suspense
    │   ├── components/
    │   │   ├── admin/                    Recruiter-only pages (companies, jobs, applicants) —
    │   │   │                             despite the folder name, this is the RECRUITER panel
    │   │   ├── platformadmin/             The REAL admin dashboard (stats + manage everything)
    │   │   ├── auth/                      Login, Signup, ForgotPassword, ResetPassword, VerifyOtp
    │   │   ├── chat/ChatBox.jsx            Real-time chat UI for one application's conversation
    │   │   ├── shared/                    Navbar (notification bell, saved jobs), Footer
    │   │   ├── ui/                        shadcn/ui primitives (button, dialog, table, etc.)
    │   │   ├── SavedJobs.jsx               "Saved Jobs" page
    │   │   └── RecommendedJobs.jsx         "Recommended For You" section on the home page
    │   ├── hooks/                     useGetAllJobs, useGetRecommendedJobs, useGetSavedJobs,
    │   │                              useGetNotifications, and others
    │   ├── redux/                     Slices: auth, job, company, application, notification
    │   ├── utils/
    │   │   ├── constant.js             Backend API base URLs (configurable via VITE_API_BASE_URL)
    │   │   └── socket.js               Shared socket.io-client instance
    │   └── lib/utils.js               The `cn()` helper for merging Tailwind classes
    ├── vercel.json                    SPA rewrite rule for Vercel deployment
    ├── .env.example                   VITE_API_BASE_URL, with comments
    └── package.json
```

---

## 4. How to Run This Project Locally

### Requirements
- Node.js 18+ (tested with Node 22)
- A MongoDB database (local `mongod`, or a free MongoDB Atlas cluster)
- A free [Cloudinary](https://cloudinary.com/) account (for file uploads)
- Optional: an email account for sending real emails (e.g. a Gmail account with an "app password") — not required to run the app, see below.

### Step 1 — Backend

Copy `backend/.env.example` to `backend/.env` and fill in your own values:

```
MONGO_URI=your_mongodb_connection_string
PORT=8000
SECRET_KEY=any_random_long_string_for_signing_jwt_tokens
CLIENT_URL=http://localhost:5173
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret

# Optional - only needed for real emails (forgot-password, 2FA codes, application/interview updates)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=
```

**About the email settings:** if you leave `EMAIL_USER`/`EMAIL_PASS` blank, the app still works completely normally — it just logs a warning instead of sending a real email. For "forgot password" and the 2FA login code specifically, they're also printed to the backend's console, so you can test both flows locally without setting up an email account at all.

**About the port:** the backend defaults to port `8000` if `PORT` isn't set (matching what the frontend expects by default). If you do change the port, also set `VITE_API_BASE_URL` on the frontend to match (see Step 2).

Then:
```
cd backend
npm install
npm run dev
```

### Step 2 — Frontend

Optional: copy `frontend/.env.example` to `frontend/.env` if your backend runs somewhere other than `http://localhost:8000`.

```
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). CORS on the backend already allows both `http://localhost:5173` and `:5174` (Vite's two most common dev ports) — if Vite picks a different port, set `CLIENT_URL` in `backend/.env` to whatever URL it printed.

### Step 3 — Create an admin (optional)
There's no admin signup form on purpose — it keeps normal signup simple (student/recruiter only). To make an existing account an admin, sign up normally first, then run:
```
cd backend
node scripts/makeAdmin.js the-email-you-signed-up-with@example.com
```
Log out and back in, and you'll see an "Admin Dashboard" link in the navbar instead of the usual links.

### Step 4 — Try it out
1. Sign up once as a **student** and once as a **recruiter** (same email can't be used for both).
2. As the student: in your profile, try turning on "two-factor login" — log out and back in to see the email-code step (check the backend console if you haven't set up real email yet).
3. As the recruiter: go to Companies → register a company → go to Jobs → post a job.
4. As the student: add some skills to your profile, then check the home page for "Recommended For You" jobs. Browse Jobs, try the Location/Industry/Salary filters, save a job for later (bookmark icon), open a job, click Apply.
5. Back as the recruiter: open the job's Applicants page, message the applicant (a live chat window), schedule an interview (date/time + a pasted meeting link), or accept/reject the application — the student gets a notification (and email, if configured) either way.
6. As the student: check your Applied Jobs table for the interview details and reply in the chat.
7. (Optional) Promote yourself to admin as in Step 3, and check `/platform-admin` for the stats dashboard.

---

## 5. Features That Are Actually Built

**Everyone**
- Sign up / log in / log out (JWT stored in an httpOnly cookie, 1-day expiry)
- Optional two-factor login: a 6-digit code emailed at login time (opt-in, toggle in your profile)
- Three account roles: `student` and `recruiter` (chosen at signup) or `admin` (granted manually, see Section 4)
- "Forgot password" — request a reset link by email, then set a new password from a link valid for 15 minutes
- Toast notifications for success/error messages (via `sonner`)
- A notification bell in the navbar (in-app notifications, e.g. application status/interview updates)

**Students (job seekers)**
- Update profile: name, email, phone, bio, skills, resume upload, profile photo
- Browse all job postings, with a keyword search box and a real Location / Industry / Salary filter sidebar (all handled by the backend, not just text-matched in the browser)
- A "Recommended For You" section on the home page, based on how many of your listed skills match each job's title/description/requirements
- Save/bookmark jobs for later, with a dedicated "Saved Jobs" page
- View full details of a single job, and apply (once per job — the backend blocks a second application to the same job)
- View a list of jobs already applied to, with the current status (pending/accepted/rejected) and any scheduled interview's date/time + meeting link
- Chat directly with the recruiter about a specific application (real-time, via Socket.io)
- Get notified (in-app, and by email if configured) when a recruiter accepts/rejects an application or schedules an interview

**Recruiters**
- Register one or more companies; edit a company's name, description, website, location, and logo
- Post a new job (title, description, requirements, salary, experience level, location, job type, number of openings)
- View jobs they've posted and everyone who applied
- Message an applicant directly (real-time chat) and schedule an interview (date/time + a pasted-in meeting link + notes)
- Accept or reject each applicant

**Admins**
- A dashboard (`/platform-admin`) showing platform-wide stats: total students, recruiters, jobs, companies, applications
- View and delete any user, job posting, or company on the platform

**Route protection & validation**
- Recruiter pages (`/admin/*`) require `role === 'recruiter'`; the real admin dashboard (`/platform-admin`) requires `role === 'admin'` — both checked client-side via a route wrapper, and every underlying backend route re-checks the same thing server-side.
- All non-public backend routes require a valid JWT cookie (`isAuthenticated`); admin-only routes additionally require `isAdmin`.
- Register/login/post-job/register-company requests are validated against Zod schemas before reaching the controller (on top of the pre-existing manual checks).

---

## 6. Features Mentioned in the FYP Report That Are Still NOT Implemented

Nearly everything from the original gap list has now been closed. What's genuinely still missing, useful to know for your defense:

| Report says... | Reality in the code |
|---|---|
| **Real-time video interviews** | Now real, with a caveat: if a `DAILY_API_KEY` is configured, scheduling an interview auto-creates an embeddable Daily.co video room shown right inside the app; without one (or if the recruiter pastes their own Zoom/Meet link), it falls back to a plain clickable link. There's also a real-time TEXT chat per application either way. See Section 11/14 for the reasoning. |
| **Next.js + Material-UI frontend** | The actual frontend is Vite + React + Tailwind CSS + shadcn/ui, not Next.js/MUI. |
| **Deployment on Vercel + Heroku** | Deployment CONFIG exists and is ready (`backend/render.yaml` for Render, `frontend/vercel.json` for Vercel) — see Section 15 for an exact step-by-step checklist. Actually clicking through Render/Vercel/GitHub still needs to happen from your own accounts; I don't have login access to do that step for you. |

The "AI-driven job recommendations" goal is now partially addressed: recommendations exist, but they're a simple skill-keyword-overlap score, not machine learning — worth being precise about that distinction if asked in your defense. Two-factor authentication and "save jobs for later" — both previously missing — are now implemented too, and so is real request validation, rate-limiting, and a small automated test suite (27 tests).

---

## 7. API Reference

Base URL: `http://localhost:8000/api/v1`

### User routes — `/user`
| Method | Path | Auth required? | What it does |
|---|---|---|---|
| POST | `/register` | No | Create an account (student or recruiter) + upload profile photo |
| POST | `/login` | No | Log in. Returns a JWT cookie directly, OR (if the account has 2FA on) `{requiresTwoFactor:true, userId}` and emails a code instead |
| POST | `/verify-otp` | No | Body `{userId, otp}` — completes a 2FA login, returns the same shape as a normal successful login |
| POST | `/two-factor` | Yes | Body `{enabled}` — turns email-code 2FA on/off for the logged-in user |
| GET | `/logout` | No | Clears the login cookie |
| POST | `/profile/update` | Yes | Update name/email/phone/bio/skills/resume |
| POST | `/forgot-password` | No | Body `{email}` — emails a reset link (also logged to the server console) |
| POST | `/reset-password/:token` | No | Body `{password}` — sets a new password if the token is valid and unexpired |

### Company routes — `/company` (all require auth)
| Method | Path | What it does |
|---|---|---|
| POST | `/register` | Register a new company |
| GET | `/get` | Get all companies owned by the logged-in recruiter |
| GET | `/get/:id` | Get one company by id |
| PUT | `/update/:id` | Update a company's details + logo |

### Job routes — `/job` (all require auth)
| Method | Path | What it does |
|---|---|---|
| POST | `/post` | Create a new job posting |
| GET | `/get` | Get jobs, filtered by any of `?keyword=&location=&industry=&salaryMin=&salaryMax=` |
| GET | `/getadminjobs` | Get jobs posted by the logged-in recruiter |
| GET | `/recommended` | Get up to 6 jobs recommended for the logged-in student, based on skill overlap |
| POST | `/save/:id` | Toggle saving/unsaving a job for later |
| GET | `/saved` | Get the logged-in user's saved jobs |
| GET | `/get/:id` | Get one job's full details |

### Application routes — `/application` (all require auth)
| Method | Path | What it does |
|---|---|---|
| GET | `/apply/:id` | Apply to the job with this id |
| GET | `/get` | Get all jobs the logged-in student applied to |
| GET | `/:id/applicants` | Get everyone who applied to a job (recruiter view) |
| POST | `/status/:id/update` | Update an application's status — also creates a notification + best-effort email |
| POST | `/:id/schedule-interview` | Recruiter (job owner only) sets `{scheduledAt, meetingLink, notes}` — notifies the applicant |

### Message routes — `/message` (all require auth)
| Method | Path | What it does |
|---|---|---|
| GET | `/:applicationId` | Chat history for one application (only the applicant or that job's recruiter can view) |

Real-time delivery is via Socket.io (not a REST endpoint): connect, emit `join_room` with the applicationId, emit `send_message` with `{applicationId, senderId, text}`, listen for `receive_message`.

### Notification routes — `/notification` (all require auth)
| Method | Path | What it does |
|---|---|---|
| GET | `/get` | Get the logged-in user's notifications, newest first (max 50) |
| POST | `/:id/read` | Mark one notification as read |
| POST | `/read-all` | Mark all of the logged-in user's notifications as read |

### Admin routes — `/admin` (require auth + `role === 'admin'`)
| Method | Path | What it does |
|---|---|---|
| GET | `/stats` | Platform-wide counts: students, recruiters, jobs, companies, applications |
| GET | `/users` | List every user (passwords excluded) |
| DELETE | `/users/:id` | Delete a user |
| GET | `/jobs` | List every job on the platform |
| DELETE | `/jobs/:id` | Delete a job |
| GET | `/companies` | List every company |
| DELETE | `/companies/:id` | Delete a company |

---

## 8. Database Models (MongoDB Collections)

**User** — `fullname`, `email` (unique), `phoneNumber`, `password` (hashed), `role` (`student`/`recruiter`/`admin`), `resetPasswordToken`, `resetPasswordExpire`, `twoFactorEnabled`, `twoFactorOTP` (hashed), `twoFactorOTPExpire`, `savedJobs[]` (ref Job), `profile: { bio, skills[], resume, resumeOriginalName, profilePhoto, company (recruiters only) }`

**Company** — `name` (unique), `description`, `website`, `location`, `logo`, `userId` (owning recruiter)

**Job** — `title`, `description`, `requirements[]`, `salary`, `experienceLevel`, `location`, `jobType`, `position`, `company` (ref), `created_by` (ref User), `applications[]` (ref Application)

**Application** — `job` (ref), `applicant` (ref User), `status` (`pending`/`accepted`/`rejected`), `interview: { scheduledAt, meetingLink, notes }` (empty until a recruiter schedules one)

**Notification** — `user` (ref User, who it's for), `message`, `type` (`application_status`/`general`), `relatedJob` (ref Job, optional), `isRead` (default `false`)

**Message** — `application` (ref, which conversation this belongs to), `sender` (ref User), `text`

All models use `{timestamps: true}`, so every document automatically gets `createdAt`/`updatedAt`.

A note on `/user/login`, `/user/register`, `/user/forgot-password`, and `/user/verify-otp`: these now also sit behind a simple rate limiter (max 20 requests per IP per 15 minutes) to slow down brute-force/spam attempts — a real user will never notice it, but automated abuse will get a `429`-style `"Too many attempts"` response.

---

## 9. Dependency Upgrades (First Pass)

Every package was checked against its latest npm version and bumped where safe, without changing app behavior. Full before/after tables are in `backend-upgrade-summary.txt` and `frontend-upgrade-summary.txt`. In short: most packages went to their latest version (including majors like React 19, React Router 7, Framer Motion 12); Tailwind, ESLint, Vite, Express, and Mongoose were deliberately kept on their current major versions because jumping those would need config rewrites for no real benefit. A real bug was also fixed: a login cookie option was misspelled `httpsOnly` instead of `httpOnly`.

## 10. Feature Additions (Second Pass)

Six things were built: the admin role + dashboard, password reset via email, in-app + email notifications for application status changes, real backend-driven job filtering (this also fixed a real bug where selecting a Salary filter after a Location filter silently wiped out the Location selection, since the old code stored all three filter groups in one shared variable), skill-based job recommendations, and deployment config (`render.yaml`, `vercel.json`, `.env.example` files, configurable CORS via `CLIENT_URL`, configurable frontend API URL via `VITE_API_BASE_URL`).

## 11. Feature Additions (Third Pass)

Four more things were built:
- **Two-factor authentication** — opt-in per user (toggle in Profile). When on, logging in emails a 6-digit code (also printed to the server console for local testing) instead of logging in immediately; a new `/verify-otp` step completes the login.
- **Save job for later** — a bookmark button on every job card plus a "Saved Jobs" page.
- **Recruiter–student chat + interview scheduling**, in place of "real-time chat/video interviews": a genuinely working real-time text chat (Socket.io) per application, and a simple interview scheduler (date/time + a pasted meeting link + notes). **Design reasoning:** a real custom video-calling system needs STUN/TURN infrastructure to work reliably outside of two people on the same network — building that from scratch for a student project would likely be fragile and fail during a live demo. A working chat plus a "paste your Meet/Zoom link" scheduler achieves the same practical goal (recruiter and candidate can coordinate and talk) without that risk. If real embedded video is a hard requirement for your report, integrating a third-party service (e.g. Daily.co or Twilio Video) on top of this scheduling feature would be the next step.
- **Request validation (Zod)** — register/login/post-job/register-company request bodies are now validated by schema before reaching the controller.
- Also code-split the frontend bundle (`React.lazy` + `Suspense` per route), so the browser no longer has to download one single ~750kB JS file up front.

## 12. Feature Additions (Fourth Pass)

Five more things were built:
- **Real embedded video calling (Daily.co), with graceful fallback** — when a recruiter schedules an interview without pasting their own meeting link, the backend automatically creates a free Daily.co video room (if `DAILY_API_KEY` is set in `.env`) and uses that as the link. On the frontend, Daily.co links are embedded directly in the app via a "Join Video Call" button that opens the call in an iframe; any other link (Zoom/Meet/Teams, or if `DAILY_API_KEY` isn't set) still shows as a plain clickable link, since those services block iframe embedding. This is the "next step" mentioned in the Third Pass write-up, now done — get a free key at https://dashboard.daily.co/developers and paste it into `backend/.env` to turn it on; nothing breaks if you never do.
- **Extended Zod validation** — now also covers profile updates, toggling two-factor auth, forgot/reset password, updating an application's status, scheduling an interview, and updating a company.
- **Rate limiting** — login, register, forgot-password, and verify-otp are limited to 20 requests per IP per 15 minutes, to blunt brute-force/spam attempts.
- **Automated tests** — a real, passing test suite (27 tests) using Node's own built-in test runner (`node --test`, no extra framework needed), covering the Zod validators, the validation middleware, and the video-room fallback behavior. Run them with `npm test` inside `backend/`.
- **Deployment prep** — verified `render.yaml`/`vercel.json` are complete and added `DAILY_API_KEY` to them; see Section 15 for the exact steps to actually go live (this last part still needs your own GitHub/Render/Vercel accounts).

---

## 13. Known Limitations / Things to Be Aware Of

- Job recommendations use a simple keyword-overlap score — not machine learning. Accurate to call it "rule-based," not "AI," if asked directly.
- Video calls only work embedded in-app for Daily.co rooms (auto-created when configured); pasted Zoom/Meet/Teams links still just open in a new tab, since those platforms block iframe embedding for security reasons — that's a limitation of those services, not something fixable from this app's side.
- Admin accounts can only be created by running `backend/scripts/makeAdmin.js` on an existing account — no signup flow or in-app way to promote someone, by design.
- Most backend `catch` blocks just `console.log(error)` without sending an error response back to the frontend — predates this work, wasn't in scope to rewrite everywhere.
- Email sending (password reset, 2FA codes, notifications) and Daily.co room creation are both best-effort: if not configured, or the request to the external service fails, the app logs a warning and falls back gracefully rather than failing the request.
- The `mutler.js` filename (in `backend/middlewares/`) is a typo of "multer" carried over from the original code; left as-is to avoid unnecessary churn.
- Test coverage is intentionally modest (validators + middleware + the video fallback) — it does not include full end-to-end tests against a real database, which would need a test-database setup (e.g. `mongodb-memory-server`) as a bigger next step.
- The deployment configs (`render.yaml`, `vercel.json`) are ready to use but nothing has actually been deployed — see Section 15 for the exact steps; the last mile (creating accounts, connecting the repo, filling in secrets) has to happen from your own Render/Vercel/GitHub logins.

---

## 14. Design Note: Chat + Scheduling Instead of Building Custom Video From Scratch

Worth restating for your defense: a fully custom video-calling system (raw WebRTC) needs STUN/TURN infrastructure to work reliably for anyone not on the same local network — building that from scratch for a student project is genuinely fragile and risks failing during a live demo. Instead this project uses: a real working real-time text chat (Socket.io) for every application, an interview scheduler (date/time + notes), and now Daily.co integration for actual embedded video when you want it — Daily.co runs the WebRTC/TURN infrastructure for you behind a simple REST API, which is why it was chosen over building video calling by hand.

---

## 15. Deployment Checklist (Render + Vercel)

This project already has a GitHub remote connected (`origin` → `github.com/Surendrakumarpatel/jobportal-yt`), so if you have push access to it (or fork it to your own GitHub account first), here's exactly what to do. I can't complete these steps myself since they require your own logged-in GitHub/Render/Vercel accounts.

**1. Push your changes to GitHub** (all the work from this session is currently only on this machine):
```
git add .
git commit -m "Add comments, upgrade dependencies, and add admin/2FA/chat/recommendations/etc"
git push origin main
```

**2. Deploy the backend on Render:**
- Sign up / log in at https://render.com, connect your GitHub account.
- Click "New +" → "Blueprint", pick this repo — Render will read `backend/render.yaml` automatically and set up the service.
- In the Render dashboard, fill in the real values for every env var marked `sync: false` in `render.yaml` (MONGO_URI, SECRET_KEY, CLIENT_URL, CLOUD_NAME, API_KEY, API_SECRET, and optionally the EMAIL_* and DAILY_API_KEY ones).
- Once deployed, copy the backend's live URL (e.g. `https://jobportal-backend.onrender.com`).

**3. Deploy the frontend on Vercel:**
- Sign up / log in at https://vercel.com, connect your GitHub account.
- Import this repo, set the project's root directory to `frontend`.
- Add one environment variable: `VITE_API_BASE_URL` = the Render backend URL from step 2.
- Deploy. `vercel.json` is already set up so client-side routes (like `/jobs`, `/admin/companies`) work correctly on page refresh.

**4. Connect the two:**
- Back in Render, set `CLIENT_URL` to your live Vercel URL (e.g. `https://your-app.vercel.app`) so CORS allows it.
- Re-deploy the backend once after setting that.

**5. Test end-to-end:** sign up, log in, post a job, apply, chat, schedule an interview — on the live URLs, not localhost.

---

## 16. Suggested Future Work

1. Actually go through the deployment checklist in Section 15 and test the live app end-to-end.
2. Extend automated tests toward real integration tests (e.g. with `mongodb-memory-server`) that exercise full request/response flows against a real (test) database.
3. Add a signup confirmation email (verify the email address is real before allowing login).
4. Consider Twilio Video or a similar paid service if you outgrow Daily.co's free tier limits for the video feature.
5. Add pagination to the admin dashboard's user/job/company tables — right now they load everything at once, which is fine for a small demo dataset but wouldn't scale.
