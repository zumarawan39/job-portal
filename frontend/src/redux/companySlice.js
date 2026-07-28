import { createSlice } from "@reduxjs/toolkit";

// Holds company-related data: the company being edited, the full list, and the search text
const companySlice = createSlice({
    name:"company",
    initialState:{
        singleCompany:null,
        companies:[],
        searchCompanyByText:"",
    },
    reducers:{
        // actions
        // Stores the company currently being viewed/edited (e.g. on CompanySetup page)
        setSingleCompany:(state,action) => {
            state.singleCompany = action.payload;
        },
        // Stores the full list of companies created by the admin
        setCompanies:(state,action) => {
            state.companies = action.payload;
        },
        // Stores the text typed into the company search box
        setSearchCompanyByText:(state,action) => {
            state.searchCompanyByText = action.payload;
        }
    }
});
export const {setSingleCompany, setCompanies,setSearchCompanyByText} = companySlice.actions;
export default companySlice.reducer;