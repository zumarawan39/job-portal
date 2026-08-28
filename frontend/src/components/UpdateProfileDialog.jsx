import React, { useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import axios from '@/utils/axiosInstance'
import { USER_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { toast } from 'sonner'

// Shows a popup dialog with a form to edit and save the user's profile details
const UpdateProfileDialog = ({ open, setOpen }) => {
    // Tracks whether the update request is in progress, to show a spinner on the button
    const [loading, setLoading] = useState(false);
    // Read the logged-in user from the auth slice of Redux state, used to pre-fill the form
    const { user } = useSelector(store => store.auth);

    // Holds the current values typed into the form fields
    const [input, setInput] = useState({
        fullname: user?.fullname || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
        bio: user?.profile?.bio || "",
        skills: user?.profile?.skills?.map(skill => skill) || "",
        file: user?.profile?.resume || ""
    });
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    // Phone number is shown with a fixed "+92" prefix (see the input below), so only the
    // digits after it are ever kept in state/submitted - matches the Signup form and what
    // the backend expects (updateProfileSchema requires a bare 10-digit "3xxxxxxxxx").
    const changePhoneHandler = (e) => {
        let digits = e.target.value.replace(/\D/g, "");
        if (digits.startsWith("0")) digits = digits.slice(1); // "03001234567" -> "3001234567"
        digits = digits.slice(0, 10);
        setInput({ ...input, phoneNumber: digits });
    }

    const fileChangeHandler = (e) => {
        const file = e.target.files?.[0];
        setInput({ ...input, file })
    }

    // Sends the updated profile form data to the backend when the form is submitted
    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("fullname", input.fullname);
        formData.append("email", input.email);
        formData.append("phoneNumber", input.phoneNumber);
        formData.append("bio", input.bio);
        formData.append("skills", input.skills);
        if (input.file) {
            formData.append("file", input.file);
        }
        try {
            setLoading(true);
            // Send the profile form data (including the resume file) to the backend to update the user's profile
            const res = await axios.post(`${USER_API_END_POINT}/profile/update`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });
            if (res.data.success) {
                // Store the updated user in Redux so the rest of the app reflects the changes
                dispatch(setUser(res.data.user));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Something went wrong.");
        } finally{
            setLoading(false);
        }
        setOpen(false);
    }



    return (
        <div>
            {/* onOpenChange wires up Radix's own close triggers (the built-in "X" button in
                DialogContent, and the Escape key) - without it, open stays controlled by the
                parent with no way for those to actually update it, so clicking the X did nothing. */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[440px]">
                    <DialogHeader>
                        <DialogTitle>Update Profile</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitHandler}>
                        <div className='flex flex-col gap-4 py-2'>
                            <div className='flex flex-col gap-1.5'>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="fullname"
                                    type="text"
                                    value={input.fullname}
                                    onChange={changeEventHandler}
                                />
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={input.email}
                                    onChange={changeEventHandler}
                                />
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <Label htmlFor="number">Number</Label>
                                <div className='relative'>
                                    <span className='pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground'>+92</span>
                                    <Input
                                        id="number"
                                        name="phoneNumber"
                                        type="tel"
                                        inputMode="numeric"
                                        value={input.phoneNumber}
                                        onChange={changePhoneHandler}
                                        placeholder="3001234567"
                                        className="pl-11"
                                    />
                                </div>
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <Label htmlFor="bio">Bio</Label>
                                <Input
                                    id="bio"
                                    name="bio"
                                    value={input.bio}
                                    onChange={changeEventHandler}
                                />
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <Label htmlFor="skills">Skills</Label>
                                <Input
                                    id="skills"
                                    name="skills"
                                    value={input.skills}
                                    onChange={changeEventHandler}
                                />
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <Label htmlFor="file">Resume</Label>
                                <Input
                                    id="file"
                                    name="file"
                                    type="file"
                                    accept="application/pdf"
                                    onChange={fileChangeHandler}
                                    className="cursor-pointer file:text-primary"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            {
                                // Show a spinner while saving, otherwise show the submit button
                                loading ? <Button className="w-full my-4"> <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait </Button> : <Button type="submit" className="w-full my-4">Update</Button>
                            }
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default UpdateProfileDialog