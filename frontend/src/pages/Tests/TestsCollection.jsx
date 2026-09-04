import React from 'react';
import { BookOpen, Clock, Sparkles, GraduationCap, Library, Award, Calendar, Bell, Compass, TestTube } from 'lucide-react';

const TestsCollection = () => {
  return (
    <div className="min-h-screen bg-[#0a0505] relative overflow-hidden flex items-center justify-center">
      {/* Background Gradient Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main dark red gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                      w-[800px] h-[800px] rounded-full 
                      bg-gradient-to-r from-[#8b0000]/20 via-[#4a0000]/10 to-transparent
                      blur-3xl animate-pulse" />
        
        {/* Red accent blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] 
                      bg-gradient-to-bl from-[#8b0000]/30 to-transparent 
                      rounded-full blur-3xl" />
        
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] 
                      bg-gradient-to-tr from-[#6b0000]/20 to-transparent 
                      rounded-full blur-3xl" />
        
        {/* Subtle golden accents */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 
                      bg-[#c8963e]/5 rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 
                      bg-[#d4a85a]/5 rounded-full blur-2xl" />
        
        {/* Additional glowing orbs */}
        <div className="absolute top-1/3 left-1/3 w-40 h-40 
                      bg-[#d4a85a]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-40 h-40 
                      bg-[#c8963e]/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 w-full">
        {/* Glass Card */}
        <div className="relative rounded-3xl p-8 sm:p-12 lg:p-16
                      backdrop-blur-xl bg-[#1a0a0a]/40
                      border border-[#c8963e]/20
                      shadow-[0_0_60px_rgba(200,150,62,0.05)]
                      transition-all duration-500
                      hover:shadow-[0_0_80px_rgba(200,150,62,0.1)]
                      hover:border-[#c8963e]/30">
          
          {/* Glass reflection effect */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8963e]/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8963e]/20 to-transparent" />
            <div className="absolute top-0 left-0 w-px h-1/2 bg-gradient-to-b from-[#c8963e]/20 to-transparent" />
            <div className="absolute top-0 right-0 w-px h-1/2 bg-gradient-to-b from-[#c8963e]/20 to-transparent" />
          </div>

          {/* Header Section - Fixed */}
          <div className="text-center relative mb-12">
            {/* EDURARY Badge */}
            <div className="inline-block mb-4">
              <span className="px-4 py-1.5 rounded-full bg-[#c8963e]/10 border border-[#c8963e]/20 
                             text-[#d4a85a] text-xs sm:text-sm font-semibold tracking-wider uppercase
                             backdrop-blur-sm inline-flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5" />
                EDURARY
              </span>
            </div>

            {/* Main Heading - Tests */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-2">
              <span className="bg-gradient-to-r from-[#d4a85a] via-[#e8c87a] to-[#d4a85a] 
                             bg-clip-text text-transparent">
                Tests
              </span>
            </h1>

            {/* Decorative Line */}
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c8963e]/40" />
              <Compass className="w-5 h-5 text-[#c8963e]/60" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c8963e]/40" />
            </div>

            {/* Subheading - Explore all Tests */}
            <p className="text-[#d4b8a0] text-lg sm:text-xl font-medium tracking-wide">
              Explore All Tests
            </p>
          </div>

          {/* Decorative Divider */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#c8963e]/20" />
            <Sparkles className="w-3 h-3 text-[#c8963e]/30" />
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#c8963e]/20" />
          </div>

          {/* Content Section - Flexible (Can be changed in future) */}
          <div className="text-center relative">
            {/* Icon with glow */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-[#c8963e]/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full
                            bg-gradient-to-br from-[#c8963e]/20 to-[#d4a85a]/10
                            border border-[#c8963e]/30
                            flex items-center justify-center
                            shadow-[0_0_40px_rgba(200,150,62,0.1)]">
                <TestTube className="w-12 h-12 sm:w-14 sm:h-14 text-[#d4a85a]" />
              </div>
            </div>

            {/* Coming Soon Badge */}
            <div className="inline-block mb-6">
              <span className="px-6 py-2 rounded-full 
                             bg-gradient-to-r from-[#c8963e]/20 to-[#d4a85a]/20
                             border border-[#c8963e]/30
                             text-[#d4a85a] text-sm sm:text-base font-bold tracking-wider uppercase
                             shadow-[0_0_30px_rgba(200,150,62,0.1)]
                             inline-flex items-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                Coming Soon
              </span>
            </div>

            {/* Message */}
            <div className="max-w-2xl mx-auto mb-8">
              <p className="text-[#d4b8a0] text-base sm:text-lg leading-relaxed">
                We're currently preparing an extensive collection of tests 
                <br className="hidden sm:block" />
                <span className="text-[#c8963e] font-medium">to help you excel in your learning!</span>
              </p>
            </div>

            {/* Decorative Divider */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#c8963e]/30" />
              <Sparkles className="w-4 h-4 text-[#c8963e]/50" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#c8963e]/30" />
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-[#c8963e]/5 border border-[#c8963e]/10 rounded-xl p-4
                            backdrop-blur-sm transition-all duration-300
                            hover:bg-[#c8963e]/10 hover:border-[#c8963e]/20">
                <div className="flex items-center justify-center gap-2 text-[#d4b8a0] text-sm">
                  <BookOpen className="w-4 h-4 text-[#c8963e]" />
                  <span>100+ Tests</span>
                </div>
              </div>
              <div className="bg-[#c8963e]/5 border border-[#c8963e]/10 rounded-xl p-4
                            backdrop-blur-sm transition-all duration-300
                            hover:bg-[#c8963e]/10 hover:border-[#c8963e]/20">
                <div className="flex items-center justify-center gap-2 text-[#d4b8a0] text-sm">
                  <Award className="w-4 h-4 text-[#c8963e]" />
                  <span>Certified Assessments</span>
                </div>
              </div>
              <div className="bg-[#c8963e]/5 border border-[#c8963e]/10 rounded-xl p-4
                            backdrop-blur-sm transition-all duration-300
                            hover:bg-[#c8963e]/10 hover:border-[#c8963e]/20">
                <div className="flex items-center justify-center gap-2 text-[#d4b8a0] text-sm">
                  <Calendar className="w-4 h-4 text-[#c8963e]" />
                  <span>Start February 2026</span>
                </div>
              </div>
            </div>

            {/* Notify Button */}
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl
                          bg-gradient-to-r from-[#c8963e]/20 to-[#d4a85a]/10
                          border border-[#c8963e]/30
                          text-[#d4a85a] text-sm font-semibold
                          shadow-[0_0_30px_rgba(200,150,62,0.05)]
                          transition-all duration-300
                          hover:shadow-[0_0_40px_rgba(200,150,62,0.15)]
                          hover:scale-105 cursor-pointer
                          backdrop-blur-sm">
              <Bell className="w-4 h-4" />
              <span>Notify Me When Available</span>
            </div>

            {/* Subtle Footer Text */}
            <p className="text-[#8b6b5a] text-xs mt-6">
              We're working hard to bring you the best testing experience
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestsCollection;