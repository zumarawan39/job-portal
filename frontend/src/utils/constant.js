// Base URLs for the backend API, grouped by feature. Used everywhere axios calls are made.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const USER_API_END_POINT=`${API_BASE_URL}/api/v1/user`;
export const JOB_API_END_POINT=`${API_BASE_URL}/api/v1/job`;
export const APPLICATION_API_END_POINT=`${API_BASE_URL}/api/v1/application`;
export const COMPANY_API_END_POINT=`${API_BASE_URL}/api/v1/company`;
