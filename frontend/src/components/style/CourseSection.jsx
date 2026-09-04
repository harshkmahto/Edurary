import React, { useRef, useState, useEffect } from 'react';
import { Clock, Award, Phone, GraduationCap, Users, Star, Eye } from 'lucide-react';
import SquareText from '../../components/style/SquareText';
import courseService from '../../services/course.service';
import { useNavigate } from 'react-router-dom';

const CourseSection = () => {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const cardRefs = useRef([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await courseService.getUserCourses({
          page: 1,
          limit: 3,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });
        
        if (response.success && response.courses) {
          setCourses(response.courses);
        } else {
          setCourses([]);
        }
      } catch (err) {
        setError('Failed to load courses');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const getCourseFeatures = (course) => {
    if (course.features && course.features.length > 0) {
      return course.features;
    }
    const defaultFeatures = ['Certificate'];
    if (course.type === 'premium') {
      defaultFeatures.push('24/7 Support', 'Lifetime Access');
    } else {
      defaultFeatures.push('Community Support');
    }
    return defaultFeatures;
  };

  const getDurationFromFeatures = (features) => {
    if (!features || features.length === 0) return 'Flexible';
    for (const feature of features) {
      if (feature.toLowerCase().includes('month') || 
          feature.toLowerCase().includes('week') || 
          feature.toLowerCase().includes('hour') ||
          feature.toLowerCase().includes('days')) {
        return feature;
      }
    }
    return 'Flexible';
  };

  const isCertified = (features) => {
    if (!features) return false;
    return features.some(f => 
      f.toLowerCase().includes('certificate') || 
      f.toLowerCase().includes('certified')
    );
  };

  const has247Support = (features) => {
    if (!features) return false;
    return features.some(f => 
      f.includes('24/7') || 
      f.toLowerCase().includes('support')
    );
  };

  const getCourseTypeDisplay = (course) => {
    if (course.type === 'free') {
      return { price: 'Free', originalPrice: null, isPremium: false };
    }
    if (course.type === 'premium') {
      return { 
        price: 'Subscribe', 
        originalPrice: null,
        isPremium: true 
      };
    }
    return { price: 'Free', originalPrice: null, isPremium: false };
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const totalHeight = rect.height;
      const scrolled = Math.max(0, -rect.top);
      const maxScroll = totalHeight - window.innerHeight;
      const progressValue = Math.min(1, scrolled / maxScroll);

      setProgress(progressValue);

      cardRefs.current.forEach((card, index) => {
        if (!card) return;

        const cardStart = index / courses.length;
        const cardEnd = (index + 1) / courses.length;
        
        let cardProgress = (progressValue - cardStart) / (cardEnd - cardStart);
        cardProgress = Math.max(0, Math.min(1, cardProgress));

        const easedProgress = 1 - Math.pow(1 - cardProgress, 2);
        
        const translateY = (1 - easedProgress) * 100;
        const scale = 0.85 + (easedProgress * 0.15);
        const opacity = easedProgress;

        card.style.transform = `translateY(${translateY}px) scale(${scale})`;
        card.style.opacity = opacity;
        card.style.pointerEvents = easedProgress > 0.8 ? 'auto' : 'none';
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [courses]);

  const handleCourseClick = (course) => {
    if (!course || !course.id) return;
    
    const courseTitle = course.title
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'course';
    
    navigate(`/course-preview/${courseTitle}/${course.id}`);
  };

  if (loading) {
    return (
      <div className="bg-[#0a0505] py-16 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c8963e] mx-auto"></div>
          <p className="text-[#f5e6d3] mt-4">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error || courses.length === 0) {
    return (
      <div className="bg-[#0a0505] py-16 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block mb-3">
            <SquareText text="Courses" size="default" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#f5e6d3]">
            Explore Latest Courses
          </h2>
          <p className="text-[#f5e6d3]/60 mt-4">
            {error || 'No courses available at the moment. Please check back later.'}
          </p>
        </div>
      </div>
    );
  }

  const uiCourses = courses.map((course, index) => {
    const features = getCourseFeatures(course);
    const typeDisplay = getCourseTypeDisplay(course);
    const duration = getDurationFromFeatures(features);
    const certified = isCertified(features);
    const support247 = has247Support(features);
    
    const styles = [
      {
        bgColor: 'bg-white',
        textColor: 'text-black',
        priceColor: 'text-[#c8963e]',
        badgeColor: 'bg-[#FDEFEA]',
        buttonBg: 'bg-black',
        buttonText: 'text-white',
        buttonHover: 'hover:bg-gray-900',
        zIndex: 10
      },
      {
        bgColor: 'bg-[#E35927]',
        textColor: 'text-white',
        priceColor: 'text-black',
        badgeColor: 'bg-[#FDEFEA]',
        buttonBg: 'bg-white',
        buttonText: 'text-black',
        buttonHover: 'hover:bg-gray-100',
        zIndex: 20
      },
      {
        bgColor: 'bg-black',
        textColor: 'text-white',
        priceColor: 'text-[#c8963e]',
        badgeColor: 'bg-[#180905]',
        buttonBg: 'bg-white',
        buttonText: 'text-black',
        buttonHover: 'hover:bg-gray-100',
        zIndex: 30
      }
    ];

    const style = styles[index % styles.length];

    const thumbnailUrl = course.thumbnail || 
      `https://via.placeholder.com/400x300/1a1a2e/ffffff?text=${encodeURIComponent(course.title?.substring(0, 20) || 'Course')}`;

    return {
      id: course._id,
      title: course.title || 'Untitled Course',
      subtitle: course.subject || course.category || 'Comprehensive Course',
      description: course.description || 'Learn from industry experts with hands-on projects and real-world applications.',
      features: features,
      duration: duration,
      certified: certified,
      support247: support247,
      price: typeDisplay.price,
      originalPrice: typeDisplay.originalPrice,
      isPremium: typeDisplay.isPremium || false,
      thumbnail: thumbnailUrl,
      bgColor: style.bgColor,
      textColor: style.textColor,
      priceColor: style.priceColor,
      badgeColor: style.badgeColor,
      buttonBg: style.buttonBg,
      buttonText: style.buttonText,
      buttonHover: style.buttonHover,
      zIndex: style.zIndex,
      type: course.type,
      views: course.views || 0,
      rating: course.rating?.average || 0,
      enrollmentCount: course.enrollmentCount || 0
    };
  });

  return (
    <div
      ref={sectionRef}
      className="bg-[#0a0505] py-16 px-4 sm:px-6 lg:px-8 relative"
      style={{ minHeight: `${Math.max(350, uiCourses.length * 120)}vh` }}
    >
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

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block mb-3">
            <SquareText text="Courses" size="default" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#f5e6d3]">
            Explore Latest Courses
          </h2>
          <p className="text-[#f5e6d3]/60 mt-2">
            Discover our newest programs designed to accelerate your career
          </p>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#c8963e]/30" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#c8963e]/30" />
          </div>
        </div>

        <div ref={containerRef} className="relative" style={{ height: `${uiCourses.length * 120}vh` }}>
          {uiCourses.map((course, index) => (
            <div
              key={course.id}
              ref={el => cardRefs.current[index] = el}
              className={`${course.bgColor} ${course.textColor} lg:py-14 p-6 lg:px-12 sticky rounded-4xl overflow-hidden mx-auto transition-all duration-75`}
              style={{
                position: 'sticky',
                top: '80px',
                zIndex: course.zIndex,
                width: '90%',
                maxWidth: '1100px',
                left: '50%',
                transform: 'translateX(-50%) translateY(100px) scale(0.85)',
                opacity: 0,
                pointerEvents: 'none',
                boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                transformOrigin: 'center center',
              }}
            >
              <div className="h-max lg:gap-12 relative flex lg:flex-row-reverse md:gap-7 flex-col-reverse justify-between overflow-hidden">
                <div className="z-10 relative flex flex-col justify-center flex-1 pt-6 lg:w-1/2">
                  <div className="mt-1">
                    <div className="inline-block mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold 
                                      ${course.bgColor === 'bg-black' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}>
                        {course.type === 'free' ? 'Free Course' : 'Premium Course'} • {index + 1} of {uiCourses.length}
                      </span>
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl lg:text-[2.5rem] font-bold leading-tight md:mb-4 lg:mb-2">
                      {course.title}
                    </h2>
                    
                    <p className="text-base md:text-xl lg:text-xl font-light opacity-80 lg:max-w-2xl">
                      {course.subtitle}
                    </p>
                    
                    <p className="text-sm md:text-base opacity-60 mt-2 lg:max-w-2xl line-clamp-2">
                      {course.description}
                    </p>

                    {course.features && course.features.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {course.features.map((feature, idx) => (
                          <span 
                            key={idx}
                            className={`text-xs px-3 py-1.5 rounded-full border font-medium
                              ${course.bgColor === 'bg-white' 
                                ? 'border-gray-300 text-gray-700 bg-gray-50' 
                                : 'border-white/20 text-white/90 bg-white/5'}`}
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap mt-4 md:mt-6 lg:mt-6 lg:justify-start md:gap-8 gap-4 w-full lg:w-[80%]">
                      <div className="flex items-center gap-2">
                        <div className={`${course.badgeColor} p-3 rounded-xl`}>
                          <Clock className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                          <h1 className="font-semibold text-lg md:text-xl">{course.duration}</h1>
                          <p className="text-sm opacity-70">Duration</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className={`${course.badgeColor} p-3 rounded-xl`}>
                          <Eye className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                          <h1 className="font-semibold text-lg md:text-xl">{course.views}</h1>
                          <p className="text-sm opacity-70">Views</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className={`${course.badgeColor} p-3 rounded-xl`}>
                          <Star className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                          <h1 className="font-semibold text-lg md:text-xl">{course.rating.toFixed(1)}</h1>
                          <p className="text-sm opacity-70">Rating</p>
                        </div>
                      </div>
                      
                      {course.certified && (
                        <div className="flex items-center gap-2">
                          <div className={`${course.badgeColor} p-3 rounded-xl`}>
                            <Award className="w-5 h-5 md:w-6 md:h-6" />
                          </div>
                          <div>
                            <h1 className="font-semibold text-lg md:text-xl">Yes</h1>
                            <p className="text-sm opacity-70">Certified</p>
                          </div>
                        </div>
                      )}
                      
                      {course.support247 && (
                        <div className="flex items-center gap-2">
                          <div className={`${course.badgeColor} p-3 rounded-xl`}>
                            <Phone className="w-5 h-5 md:w-6 md:h-6" />
                          </div>
                          <div>
                            <h1 className="font-semibold text-lg md:text-xl">24/7</h1>
                            <p className="text-sm opacity-70">Support</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 md:mt-8 lg:mt-6">
                    <div className="flex items-center gap-3 text-2xl md:text-4xl">
                      <span className="font-medium">Price</span>
                      <span className={`${course.priceColor} font-bold`}>
                        {course.price}
                      </span>
                      {course.originalPrice && (
                        <span className={`text-xl line-through opacity-50`}>
                          {course.originalPrice}
                        </span>
                      )}
                      {course.type === 'premium' && (
                        <span className={`text-sm opacity-60`}>
                          (Subscribe to Access)
                        </span>
                      )}
                    </div>
                    <div 
                      onClick={() => handleCourseClick(course)}
                      className={`${course.buttonBg} ${course.buttonText} flex group cursor-pointer px-6 md:px-8 rounded-2xl py-3 font-medium text-lg md:text-xl w-fit ${course.buttonHover} transition-colors mt-4`}
                    >
                      <div className="relative overflow-hidden w-max cursor-pointer flex gap-1 font-medium">
                        <div className="transition-transform duration-300 ease-out group-hover:-translate-y-full">
                          {course.type === 'premium' ? 'Subscribe to Access →' : 'Check Course →'}
                        </div>
                        <div className="absolute inset-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0">
                          {course.type === 'premium' ? 'Subscribe to Access →' : 'Check Course →'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative shrink-0 lg:w-[40%] h-[25vh] md:h-[35vh] lg:h-[55vh]">
                  <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-[#c8963e]/20 relative">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/400x300/1a1a2e/ffffff?text=${encodeURIComponent(course.title?.substring(0, 20) || 'Course')}`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${course.type === 'free' 
                          ? 'bg-green-500/80 text-white' 
                          : 'bg-[#c8963e]/80 text-white'}`}>
                        {course.type === 'free' ? 'FREE' : 'PREMIUM'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseSection;