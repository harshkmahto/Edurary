import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Clock, Sparkles, GraduationCap, Library, Award, 
  Calendar, Bell, Compass, ChevronLeft, ChevronRight, 
  Eye, Star, Users, Globe, Tag, Crown, Lock, Unlock,
  TrendingUp, ThumbsUp, Filter, Search, X, Layers, 
  ChevronDown, ChevronUp, SlidersHorizontal, Menu
} from 'lucide-react';
import courseService from '../../services/course.service';
import { useAuth } from '../../context/authContext';
import MainButton from '../../components/style/MainButton';

// Course Card Component
const CourseCard = ({ course, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const courseTitle = course.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    navigate(`/course-preview/${courseTitle}/${course._id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="group bg-[#1a0a0a]/60 backdrop-blur-sm rounded-2xl overflow-hidden 
                 border border-[#c8963e]/20 hover:border-[#c8963e]/40 
                 transition-all duration-500 cursor-pointer
                 hover:shadow-[0_0_40px_rgba(200,150,62,0.1)] 
                 hover:scale-[1.02] hover:-translate-y-1"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-[#0a0505]">
        <img 
          src={course.thumbnail || '/placeholder-course.jpg'} 
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0505]/80 via-transparent to-transparent" />
        
        {/* Premium Badge */}
        {course.type === 'premium' && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 px-3 py-1.5 rounded-full 
                           bg-gradient-to-r from-[#c8963e] to-[#d4a85a] 
                           text-[#0a0505] text-xs font-bold shadow-lg">
              <Crown className="w-3.5 h-3.5" />
              PREMIUM
            </span>
          </div>
        )}

        {/* Duration Badge */}
        {course.totalDuration && (
          <div className="absolute bottom-3 left-3">
            <span className="flex items-center gap-1 px-3 py-1 rounded-full 
                           bg-black/70 backdrop-blur-sm text-white/80 text-xs">
              <Clock className="w-3.5 h-3.5" />
              {course.totalDuration} min
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-base line-clamp-1 group-hover:text-[#d4a85a] transition-colors">
          {course.title}
        </h3>
        
        <div className="flex items-center gap-2 mt-1.5 text-xs text-[#d4b8a0]/70">
          <Tag className="w-3.5 h-3.5 text-[#c8963e]" />
          <span>{course.category}</span>
          <span className="w-1 h-1 rounded-full bg-[#d4b8a0]/30" />
          <Globe className="w-3.5 h-3.5 text-[#c8963e]" />
          <span>{course.languages?.[0] || 'English'}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#c8963e]/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-[#d4b8a0]/60">
              <Eye className="w-3.5 h-3.5 text-[#c8963e]/60" />
              <span>{course.views || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#d4b8a0]/60">
              <Star className="w-3.5 h-3.5 text-yellow-500/60" />
              <span>{course.rating?.average?.toFixed(1) || 0}</span>
              <span className="text-[10px]">({course.rating?.count || 0})</span>
            </div>
          </div>
         
        </div>
      </div>
    </div>
  );
};

// Category Item Component
const CategoryItem = ({ category, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl 
                  transition-all duration-300 min-w-[100px]
                  ${isActive 
                    ? 'bg-[#c8963e]/20 border border-[#c8963e]/40 shadow-[0_0_30px_rgba(200,150,62,0.1)]' 
                    : 'bg-[#1a0a0a]/40 border border-[#c8963e]/10 hover:border-[#c8963e]/30 hover:bg-[#1a0a0a]/60'
                  }`}
    >
      <div className={`w-16 h-16 rounded-full overflow-hidden 
                      ${isActive ? 'ring-2 ring-[#c8963e]' : ''}`}>
        <img 
          src={category.thumbnail || '/placeholder-category.jpg'} 
          alt={category.name}
          className="w-full h-full object-cover"
        />
      </div>
      <span className={`text-xs font-medium ${isActive ? 'text-[#d4a85a]' : 'text-[#d4b8a0]/70'}`}>
        {category.name}
      </span>
    </button>
  );
};

// Toggle Switch Component
const ToggleSwitch = ({ label, isOn, onToggle, icon: Icon }) => {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-[#c8963e]" />}
        <span className="text-[#d4b8a0] text-sm font-medium">{label}</span>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0
                  ${isOn ? 'bg-[#c8963e]' : 'bg-[#2a1a1a]'}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-md
                      ${isOn ? 'right-0.5' : 'left-0.5'}`} />
      </button>
    </div>
  );
};

// Main Component
const CoursesCollection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [isPremium, setIsPremium] = useState(false);
  const [isMostViewed, setIsMostViewed] = useState(true);
  const [isTopRated, setIsTopRated] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  const categoryScrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Get real categories from courses
  const [categories, setCategories] = useState([
    { id: 'All', name: 'All', thumbnail: '' }
  ]);

  // Get real subjects from courses
  const [subjects, setSubjects] = useState(['All']);

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, selectedSubject, isPremium, isMostViewed, isTopRated]);

  // Update categories and subjects when courses change
  useEffect(() => {
    if (courses && Array.isArray(courses) && courses.length > 0) {
      // Extract unique categories and get thumbnail from first course in each category
      const categoryMap = new Map();
      courses.forEach(course => {
        if (course.category && !categoryMap.has(course.category)) {
          categoryMap.set(course.category, course.thumbnail);
        }
      });
      
      // Get top course thumbnail for "All" category
      const topCourseThumbnail = courses.length > 0 ? courses[0]?.thumbnail : '';
      
      const categoryItems = [
        { id: 'All', name: 'All', thumbnail: topCourseThumbnail || '/categories/all.jpg' },
        ...Array.from(categoryMap.entries()).map(([cat, thumbnail]) => ({
          id: cat.toLowerCase().replace(/\s+/g, '-'),
          name: cat,
          thumbnail: thumbnail || `/categories/${cat.toLowerCase().replace(/\s+/g, '-')}.jpg`
        }))
      ];
      setCategories(categoryItems);

      // Extract unique subjects
      const uniqueSubjects = ['All', ...new Set(courses.map(c => c.subject).filter(Boolean))];
      setSubjects(uniqueSubjects);
    }
  }, [courses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      // Determine sort field
      let sortField = 'createdAt';
      if (isMostViewed) sortField = 'views';
      else if (isTopRated) sortField = 'rating.average';
      
      const params = {
        page: 1,
        limit: 20,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        subject: selectedSubject !== 'All' ? selectedSubject : undefined,
        type: isPremium ? 'premium' : undefined,
        sortBy: sortField,
        sortOrder: 'desc'
      };
      
      const response = await courseService.getUserCourses(params);
      if (response?.success) {
        const coursesData = Array.isArray(response.courses) ? response.courses : [];
        setCourses(coursesData);
      } else {
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle category scroll
  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = 300;
      const currentScroll = categoryScrollRef.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      categoryScrollRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (categoryScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Filter courses based on search
  const filteredCourses = Array.isArray(courses) ? courses : [];

  // Filter Panel Content
  const FilterPanelContent = () => (
    <div className="space-y-4">
      {/* Subjects */}
      <div>
        <h4 className="text-[#d4b8a0]/70 text-xs font-medium uppercase tracking-wider mb-2">
          Subjects
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all
                        ${selectedSubject === subject
                          ? 'bg-[#c8963e] text-[#0a0505]'
                          : 'bg-[#0a0505]/50 text-[#d4b8a0]/70 hover:text-[#d4b8a0] border border-[#c8963e]/10 hover:border-[#c8963e]/30'
                        }`}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#c8963e]/10" />

      {/* Free/Premium Toggle */}
      <ToggleSwitch
        label="Premium Content"
        isOn={isPremium}
        onToggle={() => setIsPremium(!isPremium)}
        icon={Crown}
      />

      {/* Divider */}
      <div className="h-px bg-[#c8963e]/10" />

      {/* Most Views Toggle */}
      <ToggleSwitch
        label="Most Viewed"
        isOn={isMostViewed}
        onToggle={() => {
          setIsMostViewed(!isMostViewed);
          if (!isMostViewed) {
            setIsTopRated(false);
          }
        }}
        icon={Eye}
      />

      {/* Top Rated Toggle */}
      <ToggleSwitch
        label="Top Rated"
        isOn={isTopRated}
        onToggle={() => {
          setIsTopRated(!isTopRated);
          if (!isTopRated) {
            setIsMostViewed(false);
          }
        }}
        icon={Star}
      />

      {/* Reset Filters */}
      <button
        onClick={() => {
          setSelectedCategory('All');
          setSelectedSubject('All');
          setIsPremium(false);
          setIsMostViewed(true);
          setIsTopRated(false);
        }}
        className="w-full py-2 rounded-xl bg-[#c8963e]/10 border border-[#c8963e]/20
                 text-[#d4b8a0] text-sm font-medium hover:bg-[#c8963e]/20
                 transition-all"
      >
        Reset Filters
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0505] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#c8963e] border-t-transparent mx-auto"></div>
          <p className="mt-6 text-[#d4b8a0]">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0505] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
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
        <div className="absolute top-1/4 right-1/4 w-64 h-64 
                      bg-[#c8963e]/5 rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 
                      bg-[#d4a85a]/5 rounded-full blur-2xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header Section */}
        <div className="text-center relative mb-10">
          {/* EDURARY Badge */}
          <div className="inline-block mb-4">
            <span className="px-4 py-1.5 rounded-full bg-[#c8963e]/10 border border-[#c8963e]/20 
                           text-[#d4a85a] text-xs sm:text-sm font-semibold tracking-wider uppercase
                           backdrop-blur-sm inline-flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5" />
              EDURARY
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-2">
            <span className="bg-gradient-to-r from-[#d4a85a] via-[#e8c87a] to-[#d4a85a] 
                           bg-clip-text text-transparent">
              Courses
            </span>
          </h1>

          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c8963e]/40" />
            <Compass className="w-5 h-5 text-[#c8963e]/60" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c8963e]/40" />
          </div>

          {/* Subheading */}
          <p className="text-[#d4b8a0] text-lg sm:text-xl font-medium tracking-wide">
            Explore All Courses
          </p>
        </div>

        {/* Categories - Horizontal Scroll */}
        <div className="relative mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-[#d4b8a0] font-semibold text-sm tracking-wider uppercase">
              Categories
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-[#c8963e]/20 to-transparent" />
          </div>

          <div className="relative">
            {/* Left Arrow */}
            {showLeftArrow && (
              <button
                onClick={() => scrollCategories('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10
                         bg-[#1a0a0a]/80 backdrop-blur-sm text-[#d4a85a] 
                         p-2 rounded-full border border-[#c8963e]/30 
                         hover:bg-[#c8963e]/20 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Categories Scroll Container */}
            <div
              ref={categoryScrollRef}
              onScroll={handleScroll}
              className="flex gap-3 overflow-x-auto hide-scrollbar pb-4 px-8"
              style={{ scrollBehavior: 'smooth' }}
            >
              {categories.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  isActive={selectedCategory === category.id}
                  onClick={() => setSelectedCategory(category.id)}
                />
              ))}
            </div>

            {/* Right Arrow */}
            {showRightArrow && (
              <button
                onClick={() => scrollCategories('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10
                         bg-[#1a0a0a]/80 backdrop-blur-sm text-[#d4a85a] 
                         p-2 rounded-full border border-[#c8963e]/30 
                         hover:bg-[#c8963e]/20 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Main Content - Filter Panel + Courses */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Filter Panel - Desktop */}
          {!isMobile && (
            <div className="lg:w-72 flex-shrink-0">
              <div className="bg-[#1a0a0a]/40 backdrop-blur-sm rounded-2xl 
                            border border-[#c8963e]/20 overflow-hidden sticky top-4">
                {/* Filter Header */}
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="w-full px-4 py-4 flex items-center justify-between 
                           hover:bg-[#c8963e]/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-[#c8963e]" />
                    <span className="text-[#d4b8a0] font-semibold">Filters</span>
                  </div>
                  {isFilterOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#d4b8a0]/50" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#d4b8a0]/50" />
                  )}
                </button>

                {isFilterOpen && (
                  <div className="px-4 pb-4">
                    <FilterPanelContent />
                  </div>
                )}
              </div>

              {/* Course Stats */}
              <div className="mt-4 bg-[#1a0a0a]/40 backdrop-blur-sm rounded-2xl 
                            border border-[#c8963e]/20 p-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-[#0a0505]/50 rounded-xl">
                    <p className="text-2xl font-bold text-[#d4a85a]">{filteredCourses.length}</p>
                    <p className="text-xs text-[#d4b8a0]/50">Courses</p>
                  </div>
                  <div className="text-center p-2 bg-[#0a0505]/50 rounded-xl">
                    <p className="text-2xl font-bold text-[#d4a85a]">
                      {filteredCourses.reduce((sum, c) => sum + (c.views || 0), 0)}
                    </p>
                    <p className="text-xs text-[#d4b8a0]/50">Total Views</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Filter Button */}
          {isMobile && (
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl 
                         bg-[#c8963e]/10 border border-[#c8963e]/20 
                         text-[#d4a85a] hover:bg-[#c8963e]/20 transition-all"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
                <span className="text-xs text-[#d4b8a0]/50">
                  ({filteredCourses.length} courses)
                </span>
              </button>
              <div className="flex-1" />
            </div>
          )}

          {/* Mobile Filter Overlay */}
          {isMobile && isMobileFilterOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md animate-fadeIn">
              <div className="h-full w-full max-w-sm ml-auto bg-[#1a0a0a] 
                            border-l border-[#c8963e]/20 p-4 overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-[#c8963e]" />
                    <span className="text-[#d4b8a0] font-semibold text-lg">Filters</span>
                  </div>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-2 rounded-xl hover:bg-[#c8963e]/10 text-[#d4b8a0] transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Filter Content */}
                <FilterPanelContent />

                {/* Apply Button */}
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full mt-6 py-3 rounded-xl bg-[#c8963e] text-[#0a0505] 
                           font-semibold hover:bg-[#d4a85a] transition-all"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Courses Grid */}
          <div className="flex-1">
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-[#1a0a0a]/40 backdrop-blur-sm rounded-2xl 
                            border border-[#c8963e]/20">
                <div className="inline-block p-6 rounded-full bg-[#c8963e]/10 border border-[#c8963e]/20 mb-4">
                  <BookOpen className="w-12 h-12 text-[#c8963e]/50" />
                </div>
                <h3 className="text-xl font-semibold text-[#d4b8a0]">No Courses Found</h3>
                <p className="text-[#d4b8a0]/50 mt-2">Try adjusting your filters</p>
              </div>
            )}

            {/* Load More */}
            {filteredCourses.length > 0 && filteredCourses.length >= 20 && (
              <div className="text-center mt-10">
                <MainButton text='Load More'/>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS for hide scrollbar and animations */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CoursesCollection;