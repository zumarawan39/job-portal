// Sets up the app's page routing and defines the top-level page component
import React, { Suspense, lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import Navbar from './components/shared/Navbar'
import ProtectedRoute from './components/admin/ProtectedRoute'
import PlatformAdminRoute from './components/platformadmin/PlatformAdminRoute'
import NotFound from './components/shared/NotFound'

// Route-level pages are lazy-loaded so the initial bundle only ships the code needed
// for whichever page the user actually lands on (smaller first load, code-split per route)
const Login = lazy(() => import('./components/auth/Login'))
const Signup = lazy(() => import('./components/auth/Signup'))
const Home = lazy(() => import('./components/Home'))
const Jobs = lazy(() => import('./components/Jobs'))
const Browse = lazy(() => import('./components/Browse'))
const Profile = lazy(() => import('./components/Profile'))
const JobDescription = lazy(() => import('./components/JobDescription'))
const Companies = lazy(() => import('./components/admin/Companies'))
const CompanyCreate = lazy(() => import('./components/admin/CompanyCreate'))
const CompanySetup = lazy(() => import('./components/admin/CompanySetup'))
const AdminJobs = lazy(() => import('./components/admin/AdminJobs'))
const PostJob = lazy(() => import('./components/admin/PostJob'))
const Applicants = lazy(() => import('./components/admin/Applicants'))
const PlatformAdminOverview = lazy(() => import('./components/platformadmin/PlatformAdminOverview'))
const PlatformAdminUsers = lazy(() => import('./components/platformadmin/PlatformAdminUsers'))
const PlatformAdminJobs = lazy(() => import('./components/platformadmin/PlatformAdminJobs'))
const PlatformAdminCompanies = lazy(() => import('./components/platformadmin/PlatformAdminCompanies'))
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('./components/auth/ResetPassword'))
const VerifyOtp = lazy(() => import('./components/auth/VerifyOtp'))
const SavedJobs = lazy(() => import('./components/SavedJobs'))

// Simple centered spinner shown while a lazy-loaded page chunk is being fetched
const PageLoader = () => (
  <div className='flex items-center justify-center h-[80vh]'>
    <Loader2 className='h-8 w-8 animate-spin text-primary' />
  </div>
)

// Small helper so every route element gets the same Suspense wrapping without repeating it
const withSuspense = (element) => <Suspense fallback={<PageLoader />}>{element}</Suspense>

// List of all pages (routes) in the app and which component renders for each URL
const routeList = [
  {
    path: '/',
    element: withSuspense(<Home />)
  },
  {
    path: '/login',
    element: withSuspense(<Login />)
  },
  {
    path: '/signup',
    element: withSuspense(<Signup />)
  },
  // Job-seeker routes live under /jobseeker/* (public visitors browsing jobs land here too)
  {
    path: "/jobseeker/jobs",
    element: withSuspense(<Jobs />)
  },
  {
    path: "/jobseeker/description/:id",
    element: withSuspense(<JobDescription />)
  },
  {
    path: "/jobseeker/browse",
    element: withSuspense(<Browse />)
  },
  {
    path: "/jobseeker/profile",
    element: withSuspense(<Profile />)
  },
  {
    path: "/jobseeker/saved-jobs",
    element: withSuspense(<SavedJobs />)
  },
  {
    path: "/forgot-password",
    element: withSuspense(<ForgotPassword />)
  },
  {
    path: "/reset-password/:token",
    element: withSuspense(<ResetPassword />)
  },
  {
    path: "/verify-otp",
    element: withSuspense(<VerifyOtp />)
  },
  // Real platform-admin dashboard, served at /admin/* (not to be confused with the
  // recruiter routes below, which live at /recruiter/*).
  // Each sidebar section is its own route/page rather than an anchor on one long page.
  {
    path: "/admin",
    element: <PlatformAdminRoute>{withSuspense(<PlatformAdminOverview />)}</PlatformAdminRoute>
  },
  {
    path: "/admin/users",
    element: <PlatformAdminRoute>{withSuspense(<PlatformAdminUsers />)}</PlatformAdminRoute>
  },
  {
    path: "/admin/jobs",
    element: <PlatformAdminRoute>{withSuspense(<PlatformAdminJobs />)}</PlatformAdminRoute>
  },
  {
    path: "/admin/companies",
    element: <PlatformAdminRoute>{withSuspense(<PlatformAdminCompanies />)}</PlatformAdminRoute>
  },
  // Recruiter-only routes start here (wrapped in ProtectedRoute so only recruiters can view them), served at /recruiter/*
  {
    path:"/recruiter/companies",
    element: <ProtectedRoute>{withSuspense(<Companies/>)}</ProtectedRoute>
  },
  {
    path:"/recruiter/companies/create",
    element: <ProtectedRoute>{withSuspense(<CompanyCreate/>)}</ProtectedRoute>
  },
  {
    path:"/recruiter/companies/:id",
    element:<ProtectedRoute>{withSuspense(<CompanySetup/>)}</ProtectedRoute>
  },
  {
    path:"/recruiter/jobs",
    element:<ProtectedRoute>{withSuspense(<AdminJobs/>)}</ProtectedRoute>
  },
  {
    path:"/recruiter/jobs/create",
    element:<ProtectedRoute>{withSuspense(<PostJob/>)}</ProtectedRoute>
  },
  {
    path:"/recruiter/jobs/:id/applicants",
    element:<ProtectedRoute>{withSuspense(<Applicants/>)}</ProtectedRoute>
  },
  // Catches any URL that doesn't match a route above
  {
    path: "*",
    element: <NotFound />
  },
]

// Give every route the same fallback for a route-render error (e.g. a component
// throwing during render), so it shows NotFound instead of React Router's
// default blank/unstyled error screen
const appRouter = createBrowserRouter(
  routeList.map((route) => ({ errorElement: <NotFound />, ...route }))
)
// Root component: renders whichever page matches the current URL
function App() {

  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  )
}

export default App
