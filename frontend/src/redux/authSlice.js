import { createSlice } from "@reduxjs/toolkit";

// Holds login state: whether a request is loading and the currently logged-in user
const authSlice = createSlice({
    name:"auth",
    initialState:{
        loading:false,
        user:null
    },
    reducers:{
        // actions
        // Turns the loading spinner on/off during login/signup requests
        setLoading:(state, action) => {
            state.loading = action.payload;
        },
        // Stores the logged-in user's info (or null when logged out)
        setUser:(state, action) => {
            state.user = action.payload;
        }
    }
});
export const {setLoading, setUser} = authSlice.actions;
export default authSlice.reducer;