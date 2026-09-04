import React from 'react';
import { Star, ThumbsUp, MessageCircle, Share } from 'lucide-react';

const CourseRatings = ({ courseId }) => {
  return (
    <div className="text-center py-16 animate-fadeIn">
      <div className="relative inline-block">
        <Star className="w-20 h-20 text-yellow-500/30 mx-auto mb-4" />
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#c8963e] rounded-full flex items-center justify-center animate-pulse">
          <span className="text-[#0a0505] text-xs font-bold">NEW</span>
        </div>
      </div>
      <h3 className="text-2xl font-semibold text-[#d4b8a0]">Coming Soon</h3>
      <p className="text-[#d4b8a0]/50 mt-2 max-w-md mx-auto">
        We're building a comprehensive rating and review system for this course.
        Check back later to see what students are saying!
      </p>
      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[#d4b8a0]/50">
        <span className="flex items-center gap-1">
          <ThumbsUp className="w-4 h-4" />
          Rate
        </span>
        <span className="w-1 h-1 rounded-full bg-[#d4b8a0]/30" />
        <span className="flex items-center gap-1">
          <MessageCircle className="w-4 h-4" />
          Review
        </span>
        <span className="w-1 h-1 rounded-full bg-[#d4b8a0]/30" />
        <span className="flex items-center gap-1">
          <Share className="w-4 h-4" />
          Share
        </span>
      </div>
    </div>
  );
};

export default CourseRatings;