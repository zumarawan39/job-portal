// Sets up the app's page routing and defines the top-level page component
import React, { Suspense, lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import Navbar from './components/shared/Navbar'
import ProtectedRoute from './components/admin/ProtectedRoute'
import PlatformAdminRoute from './components/platformadmin/PlatformAdminRoute'

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
const PlatformAdminDashboard = lazy(() => import('./components/platformadmin/PlatformAdminDashboard'))
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('./components/auth/ResetPassword'))
const VerifyOtp = lazy(() => import('./components/auth/VerifyOtp'))
const SavedJobs = lazy(() => import('./components/SavedJobs'))

// Simple centered spinner shown while a lazy-loaded page chunk is being fetched
const PageLoader = () => (
  <div className='flex items-center justify-center h-[80vh]'>
    <Loader2 className='h-8 w-8 animate-spin text-[#6A38C2]' />
  </div>
)

// Small helper so every route element gets the same Suspense wrapping without repeating it
const withSuspense = (element) => <Suspense fallback={<PageLoader />}>{element}</Suspense>

// List of all pages (routes) in the app and which component renders for each URL
const appRouter = createBrowserRouter([
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
  {
    path: "/jobs",
    element: withSuspense(<Jobs />)
  },
  {
    path: "/description/:id",
    element: withSuspense(<JobDescription />)
  },
  {
    path: "/browse",
    element: withSuspense(<Browse />)
  },
  {
    path: "/profile",
    element: withSuspense(<Profile />)
  },
  {
    path: "/saved-jobs",
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
  // Real platform-admin dashboard (not to be confused with the recruiter "admin" routes below)
  {
    path: "/platform-admin",
    element: <PlatformAdminRoute>{withSuspense(<PlatformAdminDashboard />)}</PlatformAdminRoute>
  },
  // Admin-only routes start here (wrapped in ProtectedRoute so only admins can view them)
  {
    path:"/admin/companies",
    element: <ProtectedRoute>{withSuspense(<Companies/>)}</ProtectedRoute>
  },
  {
    path:"/admin/companies/create",
    element: <ProtectedRoute>{withSuspense(<CompanyCreate/>)}</ProtectedRoute>
  },
  {
    path:"/admin/companies/:id",
    element:<ProtectedRoute>{withSuspense(<CompanySetup/>)}</ProtectedRoute>
  },
  {
    path:"/admin/jobs",
    element:<ProtectedRoute>{withSuspense(<AdminJobs/>)}</ProtectedRoute>
  },
  {
    path:"/admin/jobs/create",
    element:<ProtectedRoute>{withSuspense(<PostJob/>)}</ProtectedRoute>
  },
  {
    path:"/admin/jobs/:id/applicants",
    element:<ProtectedRoute>{withSuspense(<Applicants/>)}</ProtectedRoute>
  },

])
// Root component: renders whichever page matches the current URL
function App() {

  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  )
}

export default App
