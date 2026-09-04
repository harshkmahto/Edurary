import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, Star, 
  Video, Loader2 
} from 'lucide-react';
import courseService from '../../services/course.service';
import toast from 'react-hot-toast';

const SimilarCourses = ({ currentCourseId, category, subject }) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    if (currentCourseId) {
      fetchSimilarCourses();
    }
  }, [currentCourseId, category, subject]);

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      };
    }
  }, [courses]);

  const fetchSimilarCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getSimilarCourses({
        courseId: currentCourseId,
        category: category,
        subject: subject,
        limit: 20
      });
      
      if (response.success) {
        const filtered = response.courses
          ?.filter(course => course._id !== currentCourseId)
          .slice(0, 20) || [];
        setCourses(filtered);
      }
    } catch (error) {
      console.error('Error fetching similar courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      const targetScroll = direction === 'left' 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
      
      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  const handleCourseClick = (courseId, courseTitle) => {
    const titleSlug = courseTitle?.toLowerCase().replace(/\s+/g, '-') || 'course';
    navigate(`/course-preview/${titleSlug}/${courseId}`);
  };

  if (loading) {
    return (
      <div className="py-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-36 bg-[#c8963e]/20 rounded animate-pulse"></div>
        </div>
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-shrink-0 w-32 animate-pulse">
              <div className="aspect-[3/4] rounded-xl bg-[#c8963e]/10"></div>
              <div className="h-3 w-20 bg-[#c8963e]/10 rounded mt-2"></div>
              <div className="h-3 w-16 bg-[#c8963e]/10 rounded mt-1"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return null;
  }

  return (
    <div className="relative py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-[#c8963e]" />
          <h2 className="text-xl font-bold text-[#f5e6d3]">
            Similar Courses
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#c8963e]/10 text-[#d4b8a0] border border-[#c8963e]/10">
            {courses.length} courses
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`p-1.5 rounded-lg transition-all duration-300 ${
              canScrollLeft 
                ? 'bg-[#c8963e]/10 hover:bg-[#c8963e]/20 text-[#d4b8a0] hover:text-[#f5e6d3] cursor-pointer' 
                : 'bg-[#c8963e]/5 text-[#8b6b5a] cursor-not-allowed opacity-30'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`p-1.5 rounded-lg transition-all duration-300 ${
              canScrollRight 
                ? 'bg-[#c8963e]/10 hover:bg-[#c8963e]/20 text-[#d4b8a0] hover:text-[#f5e6d3] cursor-pointer' 
                : 'bg-[#c8963e]/5 text-[#8b6b5a] cursor-not-allowed opacity-30'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style>
          {`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>

        {courses.map((course) => (
          <div
            key={course._id}
            onClick={() => handleCourseClick(course._id, course.title)}
            className="flex-shrink-0 w-32 cursor-pointer group transition-all duration-300 hover:-translate-y-1"
          >
            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-[#2d1810]/40 to-[#1a0a0a]/60 border border-[#c8963e]/10 group-hover:border-[#c8963e]/30 transition-all duration-300 relative">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Video className="w-8 h-8 text-[#c8963e]/30" />
                </div>
              )}
              
              {course.type === 'premium' && (
                <div className="absolute top-1.5 right-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-[#c8963e]/80 text-[#0a0505]">
                    Premium
                  </span>
                </div>
              )}

              {course.type === 'free' && (
                <div className="absolute top-1.5 right-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-[#22c55e]/80 text-white">
                    Free
                  </span>
                </div>
              )}
            </div>

            <div className="mt-2">
              <p className="text-sm font-medium text-[#f5e6d3] truncate group-hover:text-[#c8963e] transition-colors">
                {course.title}
              </p>
              <p className="text-xs text-[#8b6b5a] truncate">
                {course.instructors?.[0]?.name || 'Unknown Instructor'}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 text-[#c8963e] fill-[#c8963e]" />
                <span className="text-xs text-[#d4b8a0]">
                  {course.rating?.average > 0 ? course.rating.average.toFixed(1) : '0.0'}
                </span>
                {course.rating?.count > 0 && (
                  <span className="text-[10px] text-[#8b6b5a]">
                    ({course.rating.count})
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gradient fade on edges for scroll hint */}
      <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none bg-gradient-to-l from-[#0a0505] to-transparent" />
      <div className="absolute left-0 top-0 bottom-0 w-8 pointer-events-none bg-gradient-to-r from-[#0a0505] to-transparent" />
    </div>
  );
};

export default SimilarCourses;