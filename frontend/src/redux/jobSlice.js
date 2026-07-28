import { createSlice } from "@reduxjs/toolkit";

// Holds all job-related data: job lists, the job being viewed, search text, and applied jobs
const jobSlice = createSlice({
    name:"job",
    initialState:{
        allJobs:[],
        allAdminJobs:[],
        singleJob:null,
        searchJobByText:"",
        allAppliedJobs:[],
        searchedQuery:"",
        filters:{
            location:"",
            industry:"",
            salaryMin:"",
            salaryMax:"",
        },
        recommendedJobs:[],
        savedJobIds:[],
    },
    reducers:{
        // actions
        // Stores the full list of jobs shown to normal users
        setAllJobs:(state,action) => {
            state.allJobs = action.payload;
        },
        // Stores the job currently open on the job description page
        setSingleJob:(state,action) => {
            state.singleJob = action.payload;
        },
        // Stores the jobs posted by the logged-in admin/recruiter
        setAllAdminJobs:(state,action) => {
            state.allAdminJobs = action.payload;
        },
        // Stores whatever text the user typed to filter jobs by keyword
        setSearchJobByText:(state,action) => {
            state.searchJobByText = action.payload;
        },
        // Stores the list of jobs the current user has already applied to
        setAllAppliedJobs:(state,action) => {
            state.allAppliedJobs = action.payload;
        },
        // Stores the search query used on the Browse page
        setSearchedQuery:(state,action) => {
            state.searchedQuery = action.payload;
        },
        // Merges the given keys into the current job filters (location/industry/salaryMin/salaryMax)
        setFilters:(state,action) => {
            state.filters = {...state.filters, ...action.payload};
        },
        // Resets all job filters back to empty
        clearFilters:(state) => {
            state.filters = {
                location:"",
                industry:"",
                salaryMin:"",
                salaryMax:"",
            };
        },
        // Stores the skill-based recommended jobs for the logged-in student
        setRecommendedJobs:(state,action) => {
            state.recommendedJobs = action.payload;
        },
        // Replaces the whole list of saved job ids (e.g. after fetching from the backend)
        setSavedJobIds:(state,action) => {
            state.savedJobIds = action.payload;
        },
        // Toggles a single job id in/out of the saved list (used after the save/unsave API call succeeds)
        toggleSavedJobIdLocally:(state,action) => {
            const jobId = action.payload;
            if (state.savedJobIds.includes(jobId)) {
                state.savedJobIds = state.savedJobIds.filter(id => id !== jobId);
            } else {
                state.savedJobIds = [...state.savedJobIds, jobId];
            }
        }
    }
});
export const {
    setAllJobs,
    setSingleJob,
    setAllAdminJobs,
    setSearchJobByText,
    setAllAppliedJobs,
    setSearchedQuery,
    setFilters,
    clearFilters,
    setRecommendedJobs,
    setSavedJobIds,
    toggleSavedJobIdLocally
} = jobSlice.actions;
export default jobSlice.reducer;
