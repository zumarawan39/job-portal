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

// The job slice mixes state that should survive a reload (savedJobIds, a user's bookmarks)
// with state that shouldn't (searchedQuery/filters, and the cached job lists). Persisting
// all of it meant a filter click or search from a previous visit silently kept narrowing
// results forever - the sidebar's own selection is separate component state that resets on
// remount, so it looked unfiltered while Redux kept sending the old filters to the backend,
// which could easily $and its way down to zero jobs. Only savedJobIds is worth keeping.
const jobPersistConfig = {
    key: 'job',
    version: 1,
    storage,
    whitelist: ['savedJobIds'],
}

// Tells redux-persist to save the store in the browser's storage under the key "root".
// Uses autoMergeLevel2 (instead of the default autoMergeLevel1) so that when a new field is
// added to a slice's initial state later on, a browser with an older persisted slice still
// gets that new field's default instead of the whole slice - including that field - coming
// back as undefined and crashing components that read it (e.g. job.savedJobIds).
const persistConfig = {
    key: 'root',
    version: 2, // bumped from 1 to drop any already-poisoned persisted job.filters/searchedQuery
    storage,
    stateReconciler: autoMergeLevel2,
    blacklist: ['job'], // the job slice manages its own (narrower) persistence above
}

// Combines all the separate slices into one big Redux state object
const rootReducer = combineReducers({
    auth:authSlice,
    job:persistReducer(jobPersistConfig, jobSlice),
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