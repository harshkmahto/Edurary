import React from 'react'
import HeroSection from '../components/style/HeroSection'
import BookSection from '../components/style/BookSection'
import CourseSection from '../components/style/CourseSection'
import ComparisonSection from '../components/style/ComparisonSection'
import FAQSection from '../components/style/FAQSection'

const Home = () => {
  return (
    <div>
      <HeroSection />
      <BookSection/>
      <CourseSection/>
      <ComparisonSection/>
      <FAQSection/>
    </div>
  )
}

export default Home
