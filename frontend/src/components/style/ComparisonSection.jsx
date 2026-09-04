import React from 'react';
import { Check, X, BookOpen, Users, Sparkles, Crown, GraduationCap, Zap, Layers } from 'lucide-react';
import SquareText from '../../components/style/SquareText';

const ComparisonSection = () => {
  const eduraryFeatures = [
    'Highly Affordable, No Quality Cuts',
    'Free Books & Study Materials',
    'Project-Based, Skill-First Learning',
    'Continuously Updated With Industry Trends',
    'Internal Hackathons, Challenges & Face-Offs',
    'Industry-Relevant, Job-Oriented Curriculum',
    'Premium Courses at Affordable Prices',
    'Expert Instructors & Mentors',
    'Community Support & Forums',
    'Practice Tests & Assessments',
    'Live Interactive Sessions',
    'Doubt Resolution 24/7'
  ];

  const otherFeatures = [
    'High Fees With Compromised Quality',
    'No Free Access to Books',
    'Theory-Centric Learning',
    'Outdated, Static Curriculum',
    'No Competitive Learning Environment',
    'Limited Practical Exposure'
  ];

  return (
    <div className="bg-black py-10 md:py-16 px-4 relative overflow-hidden">
      {/* Background Gradient Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                      w-[800px] h-[800px] rounded-full 
                      bg-gradient-to-r from-[#8b0000]/20 via-[#4a0000]/10 to-transparent
                      blur-3xl animate-pulse" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] 
                      bg-gradient-to-bl from-[#8b0000]/30 to-transparent 
                      rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] 
                      bg-gradient-to-tr from-[#6b0000]/20 to-transparent 
                      rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center text-center mb-8 md:mb-12">
          <div className="inline-block mb-3">
            <SquareText text="Comparison" size="sm" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl md:text-[2.8rem] lg:text-[3.5rem] font-medium capitalize leading-[1.3] text-white">
              What Sets EDURARY Apart
            </h2>
            <p className="text-[#9B9999] text-base md:text-lg mt-2">
              From Other Learning Platforms
            </p>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="flex flex-col lg:flex-row border border-[#302C2A] p-4 md:p-5 rounded-3xl gap-6 md:gap-8 lg:gap-12 justify-center">
          
          {/* EDURARY Card */}
          <div className="flex-1">
            <div className="bg-[#69E82E73]/70 shadow-lg shadow-[#69E82E73]/70 p-0.5 w-full rounded-3xl">
              <div className="p-4 md:p-6 bg-black rounded-3xl">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-8 h-8 text-[#d4a85a]" />
                  <span className="text-2xl md:text-3xl font-bold text-white">EDURARY</span>
                </div>
                <div className="space-y-3">
                  {eduraryFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <p className="text-white text-sm md:text-base">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Other Card */}
          <div className="flex-1">
            <div className="p-0.5 w-full rounded-3xl">
              <div className="p-4 md:p-6 rounded-3xl">
                <div className="flex items-center gap-3 mb-4">
                  <Layers className="w-8 h-8 text-[#9B9999]" />
                  <span className="text-2xl md:text-3xl font-bold text-[#9B9999]">Others</span>
                </div>
                <div className="space-y-3">
                  {otherFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <X className="w-5 h-5 text-[#E8602F] shrink-0 mt-0.5" />
                      <p className="text-[#9B9999] text-sm md:text-base">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Bottom Text */}
        <div className="text-center mt-8">
          <p className="text-[#9B9999] text-sm md:text-base">
            <span className="text-[#d4a85a] font-semibold">EDURARY</span> — The Smart Choice for Quality Education
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComparisonSection;