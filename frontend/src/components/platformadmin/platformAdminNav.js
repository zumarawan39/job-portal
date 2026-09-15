import { LayoutDashboard, Users, Briefcase, Building2 } from 'lucide-react'

// Shared by every platform-admin page so the sidebar lists the same four sections, in the
// same order, everywhere. `end: true` on Overview stops it from also lighting up while on
// /admin/users etc. - see the `end` handling in DashboardLayout's active-link check.
export const platformAdminNav = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/jobs', label: 'Jobs', icon: Briefcase },
    { to: '/admin/companies', label: 'Companies', icon: Building2 },
]
