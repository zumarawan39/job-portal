import React, { useEffect } from 'react'
import Navbar from './shared/Navbar'
import HeroSection from './HeroSection'
import CategoryCarousel from './CategoryCarousel'
import RecommendedJobs from './RecommendedJobs'
import LatestJobs from './LatestJobs'
import Footer from './shared/Footer'
import useGetAllJobs from '@/hooks/useGetAllJobs'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

// The main landing page: hero banner, categories, and latest job listings
const Home = () => {
  // Custom hook that fetches all jobs from the backend and stores them in Redux
  useGetAllJobs();
  // Read the logged-in user from the auth slice of Redux state
  const { user } = useSelector(store => store.auth);
  // Used to redirect recruiters away from the normal user home page
  const navigate = useNavigate();
  // Runs once on mount; sends recruiters to their admin page instead of the normal home page
  useEffect(() => {
    if (user?.role === 'recruiter') {
      navigate("/admin/companies");
    }
  }, []);
  return (
    <div>
      <Navbar />
      <HeroSection />
      <CategoryCarousel />
      <RecommendedJobs />
      <LatestJobs />
      <Footer />
    </div>
  )
}

export default Home