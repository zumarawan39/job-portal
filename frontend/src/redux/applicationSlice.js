import { createSlice } from "@reduxjs/toolkit";

// Holds the list of applicants for a job (used on the admin Applicants page)
const applicationSlice = createSlice({
    name:'application',
    initialState:{
        applicants:null,
    },
    reducers:{
        // Stores all applicants (and their applications) for a specific job
        setAllApplicants:(state,action) => {
            state.applicants = action.payload;
        }
    }
});
export const {setAllApplicants} = applicationSlice.actions;
export default applicationSlice.reducer;