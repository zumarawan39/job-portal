import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import jobSlice from "./jobSlice";
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import companySlice from "./companySlice";
import applicationSlice from "./applicationSlice";
import notificationSlice from "./notificationSlice";

// Tells redux-persist to save the whole store in the browser's storage under the key "root".
// Uses autoMergeLevel2 (instead of the default autoMergeLevel1) so that when a new field is
// added to a slice's initial state later on, a browser with an older persisted slice still
// gets that new field's default instead of the whole slice - including that field - coming
// back as undefined and crashing components that read it (e.g. job.filters, job.savedJobIds).
const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    stateReconciler: autoMergeLevel2,
}

// Combines all the separate slices into one big Redux state object
const rootReducer = combineReducers({
    auth:authSlice,
    job:jobSlice,
    company:companySlice,
    application:applicationSlice,
    notification:notificationSlice
})

// Wraps the root reducer so its state gets saved/restored automatically
const persistedReducer = persistReducer(persistConfig, rootReducer)


// Creates the main Redux store used across the whole app
const store = configureStore({
    reducer: persistedReducer,
    // redux-persist actions aren't plain serializable objects, so tell Redux to ignore them during its serializable check
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});
export default store;