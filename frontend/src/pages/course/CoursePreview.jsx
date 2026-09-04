import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ArrowLeft,
  Users,
  Eye,
  Star,
  Clock,
  Play,
  Crown,
  Unlock,
  Calendar,
  Globe,
  Bookmark,
  Share2,
  Tag,
  Layers,
  Award,
  User,
  Mail,
  FileText,
  CheckCircle,
  XCircle,
  ThumbsUp,
  MessageCircle,
  Share,
  Info,
  GraduationCap,
  Copy,
  Check
} from 'lucide-react';
import courseService from '../../services/course.service';
import toast from 'react-hot-toast';
import LessonsPreview from '../../components/course/LessonsPreview';
import CourseRatings from '../../components/course/CourseRatings';
import SimilarCourses from '../../components/Books/SimmilerBooks';

// Main CoursePreview Component
const CoursePreview = () => {
  const { courseName, id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);

  // Tabs configuration
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'instructors', label: 'Instructors' },
    { id: 'lessons', label: 'Lessons' },
    { id: 'ratings', label: 'Ratings' }
  ];

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await courseService.getUserCourseById(id);
      if (response?.success) {
        setCourse(response.course);
      } else {
        toast.error(response?.message || 'Failed to fetch course details');
        navigate('/courses');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error(error.message || 'Failed to fetch course details');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(course._id);
    setCopied(true);
    toast.success('Course ID copied to clipboard');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: course.title,
        text: `Check out this course: ${course.title}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Course link copied to clipboard!');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400';
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400';
      case 'draft': return 'bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400';
      case 'archived': return 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400';
      default: return 'bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400';
    }
  };

  const getTypeBadge = (type) => {
    if (type === 'premium') {
      return (
        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#c8963e]/20 text-[#d4a85a] text-sm font-medium">
          <Crown className="w-4 h-4" />
          Premium
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium">
        <Unlock className="w-4 h-4" />
        Free
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0505] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#c8963e] border-t-transparent mx-auto"></div>
          <p className="mt-6 text-[#d4b8a0]">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#0a0505] flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-20 h-20 text-[#c8963e]/30 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-[#d4b8a0]">Course not found</h3>
          <p className="text-[#d4b8a0]/50 mt-2">The course you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/courses')}
            className="mt-6 px-8 py-3 bg-[#c8963e] hover:bg-[#d4a85a] text-[#0a0505] rounded-xl transition-all shadow-lg hover:shadow-[#c8963e]/25"
          >
            Back to Courses
          </button>
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
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/courses')}
              className="p-2.5 rounded-xl hover:bg-[#c8963e]/10 text-[#d4a85a] transition-all group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#d4b8a0]">Course Preview</h1>
              <p className="text-sm text-[#d4b8a0]/50">Complete information about the course</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleShare}
              className="p-2.5 rounded-xl hover:bg-[#c8963e]/10 text-[#d4a85a] transition-all"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Course Header - Thumbnail Left, Info Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Thumbnail */}
          <div className="lg:col-span-1">
            <div className="relative rounded-2xl overflow-hidden bg-[#1a0a0a] aspect-video shadow-xl border border-[#c8963e]/20 group">
              <img
                src={course.thumbnail || '/placeholder-course.jpg'}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0505]/80 via-transparent to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                {getTypeBadge(course.type)}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#d4b8a0] leading-tight">
                {course.title}
              </h1>
              <p className="text-[#d4b8a0]/60 mt-1 line-clamp-2">
                {course.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-[#1a0a0a]/50 px-3 py-1.5 rounded-full border border-[#c8963e]/10">
                <Tag className="w-4 h-4 text-[#c8963e]" />
                <span className="text-sm text-[#d4b8a0]">{course.category}</span>
              </div>
              <div className="flex items-center gap-2 bg-[#1a0a0a]/50 px-3 py-1.5 rounded-full border border-[#c8963e]/10">
                <Layers className="w-4 h-4 text-[#c8963e]" />
                <span className="text-sm text-[#d4b8a0]">{course.subject}</span>
              </div>
              <div className="flex items-center gap-2 bg-[#1a0a0a]/50 px-3 py-1.5 rounded-full border border-[#c8963e]/10">
                <Globe className="w-4 h-4 text-[#c8963e]" />
                <span className="text-sm text-[#d4b8a0]">
                  {course.languages?.join(', ') || 'English'}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-[#1a0a0a]/50 px-3 py-1.5 rounded-full border border-[#c8963e]/10">
                <Clock className="w-4 h-4 text-[#c8963e]" />
                <span className="text-sm text-[#d4b8a0]">
                  {course.lessons?.reduce((acc, l) => acc + (l.duration || 0), 0)} min total
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-[#c8963e]/10">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#c8963e]" />
                <span className="text-sm font-medium text-[#d4b8a0]">{course.views || 0}</span>
                <span className="text-xs text-[#d4b8a0]/50">views</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-[#d4b8a0]">{course.rating?.average?.toFixed(1) || 0}</span>
                <span className="text-xs text-[#d4b8a0]/50">({course.rating?.count || 0} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs with Sliding Animation */}
        <div className="bg-[#1a0a0a]/40 backdrop-blur-sm rounded-2xl border border-[#c8963e]/20 shadow-xl overflow-hidden">
          <div className="border-b border-[#c8963e]/10 relative">
            <div className="flex overflow-x-auto hide-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium transition-all duration-300 whitespace-nowrap relative ${
                    activeTab === tab.id
                      ? 'text-[#d4a85a]'
                      : 'text-[#d4b8a0]/50 hover:text-[#d4b8a0]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {/* Sliding indicator - positioned at bottom and slides with tabs */}
            <div 
              className="absolute bottom-0 h-0.5 bg-gradient-to-r from-[#c8963e] to-[#d4a85a] rounded-full transition-all duration-500 ease-in-out"
              style={{
                width: `${100 / tabs.length}%`,
                transform: `translateX(${tabs.findIndex(t => t.id === activeTab) * 100}%)`
              }}
            />
          </div>

          <div className="p-6">
            {/* Tab Content with Fade Animation */}
            <div className="transition-all duration-300 ease-in-out">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h3 className="text-lg font-semibold text-[#d4b8a0] mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#c8963e]" />
                      Description
                    </h3>
                    <p className="text-[#d4b8a0]/80 leading-relaxed bg-[#1a0a0a]/50 rounded-xl p-4 border border-[#c8963e]/10">
                      {course.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#1a0a0a]/50 rounded-xl p-4 border border-[#c8963e]/10">
                      <h4 className="text-sm font-medium text-[#d4b8a0]/50 mb-2 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#c8963e]" />
                        Category
                      </h4>
                      <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-[#c8963e]/10 text-[#d4a85a] text-sm font-medium">
                        {course.category}
                      </span>
                    </div>
                    <div className="bg-[#1a0a0a]/50 rounded-xl p-4 border border-[#c8963e]/10">
                      <h4 className="text-sm font-medium text-[#d4b8a0]/50 mb-2 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#c8963e]" />
                        Subject
                      </h4>
                      <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-[#c8963e]/10 text-[#d4a85a] text-sm font-medium">
                        {course.subject}
                      </span>
                    </div>
                  </div>

                  {course.features && course.features.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#d4b8a0] mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#c8963e]" />
                        Features
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {course.features.map((feature, index) => (
                          <span key={index} className="px-4 py-2 rounded-full bg-[#c8963e]/10 text-[#d4a85a] text-sm font-medium border border-[#c8963e]/20">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {course.about && Object.keys(course.about).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#d4b8a0] mb-3 flex items-center gap-2">
                        <Info className="w-5 h-5 text-[#c8963e]" />
                        About
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(course.about).map(([key, value]) => (
                          <div key={key} className="bg-[#1a0a0a]/50 rounded-xl p-4 border border-[#c8963e]/10">
                            <p className="text-xs font-medium text-[#d4b8a0]/50 uppercase tracking-wider">{key}</p>
                            <p className="text-sm text-[#d4b8a0] mt-1">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Instructors Tab */}
              {activeTab === 'instructors' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                  {course.instructors?.map((instructor, index) => (
                    <div key={index} className="bg-gradient-to-br from-[#1a0a0a]/50 to-[#0a0505]/50 rounded-xl p-6 border border-[#c8963e]/10 hover:border-[#c8963e]/30 transition-all">
                      <div className="flex items-start gap-4">
                        {instructor.profile ? (
                          <img
                            src={instructor.profile}
                            alt={instructor.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-[#c8963e]/30"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-[#c8963e]/20 flex items-center justify-center">
                            <User className="w-8 h-8 text-[#d4a85a]" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-semibold text-[#d4b8a0]">{instructor.name}</h4>
                          {instructor.bio && (
                            <p className="text-sm text-[#d4b8a0]/70 mt-2">{instructor.bio}</p>
                          )}
                          <div className="flex items-center gap-3 mt-3">
                            <span className="text-xs px-3 py-1 rounded-full bg-[#c8963e]/10 text-[#d4a85a]">
                              Instructor
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Lessons Tab - Using LessonsPreview Component */}
              {activeTab === 'lessons' && (
                <div className="animate-fadeIn">
                  <LessonsPreview courseId={course._id} courseTitle={course.title} />
                </div>
              )}

              {/* Ratings Tab - Using CourseRatings Component */}
              {activeTab === 'ratings' && (
                <div className="animate-fadeIn">
                  <CourseRatings courseId={course._id} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {course && (
  <div className="mt-8 border-t border-[#c8963e]/10 pt-8">
    <SimilarCourses
      currentCourseId={course._id}
      category={course.category}
      subject={course.subject}
    />
  </div>
)}

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out forwards;
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default CoursePreview;