import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import DashboardLayout from '../shared/DashboardLayout'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { COMPANY_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { setSingleCompany } from '@/redux/companySlice'
import { Building2, Briefcase } from 'lucide-react'

const nav = [
    { to: '/admin/companies', label: 'Companies', icon: Building2 },
    { to: '/admin/jobs', label: 'Jobs', icon: Briefcase },
]

// First step of creating a new company: just asking for a name (admin only)
const CompanyCreate = () => {
    // Lets us send the user to the full company setup page after creating it
    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState();
    const dispatch = useDispatch();
    // Sends the new company name to the backend to create the company
    const registerNewCompany = async () => {
        try {
            // Create a new company with just a name
            const res = await axios.post(`${COMPANY_API_END_POINT}/register`, {companyName}, {
                headers:{
                    'Content-Type':'application/json'
                },
                withCredentials:true
            });
            if(res?.data?.success){
                // Save the newly created company in Redux so other pages can use it
                dispatch(setSingleCompany(res.data.company));
                toast.success(res.data.message);
                const companyId = res?.data?.company?._id;
                // Go to the full setup page for this new company
                navigate(`/admin/companies/${companyId}`);
            }
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <div>
            <Navbar />
            <DashboardLayout nav={nav} title="New Company" description="Give your company a name to get started">
                <div className='flex justify-center'>
                    <Card className="w-full max-w-xl">
                        <CardHeader>
                            <CardTitle>Your Company Name</CardTitle>
                            <CardDescription>What would you like to give your company name? you can change this later.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Label>Company Name</Label>
                            <Input
                                type="text"
                                className="my-2"
                                placeholder="JobHunt, Microsoft etc."
                                onChange={(e) => setCompanyName(e.target.value)}
                            />
                            <div className='flex items-center gap-2 mt-6'>
                                <Button variant="outline" onClick={() => navigate("/admin/companies")}>Cancel</Button>
                                <Button onClick={registerNewCompany}>Continue</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        </div>
    )
}

export default CompanyCreate
