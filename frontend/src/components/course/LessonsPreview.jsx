// LessonsPreview.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, CheckCircle, XCircle, Lock, Crown, AlertCircle } from 'lucide-react';
import courseService from '../../services/course.service';
import toast from 'react-hot-toast';

const LessonsPreview = ({ courseTitle, courseId }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessMessage, setAccessMessage] = useState('');
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    if (courseId) {
      fetchCourseLessons();
    }
  }, [courseId]);

  const fetchCourseLessons = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourseLessons(courseId);
      
      if (response?.success) {
        const data = response.data;
        setCourseData(data);
        setLessons(data.lessons || []);
        setHasAccess(data.hasAccess || false);
        setAccessMessage(data.message || '');
        
        if (data.progress) {
          setProgress(data.progress);
        }
      } else {
        toast.error(response?.message || 'Failed to fetch lessons');
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast.error(error.message || 'Failed to fetch lessons');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayLesson = (lesson, index) => {
    if (!hasAccess) {
      toast.error(accessMessage || 'You don\'t have access to this lesson');
      return;
    }
    // Navigate to lesson player
    navigate(`/course/${courseTitle}/${courseId}/lesson/${index}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-3 border-[#c8963e] border-t-transparent"></div>
        <span className="ml-3 text-[#d4b8a0]">Loading lessons...</span>
      </div>
    );
  }

  // No lessons available
  if (!lessons || lessons.length === 0) {
    return (
      <div className="text-center py-12">
        <Play className="w-16 h-16 text-[#c8963e]/30 mx-auto mb-4" />
        <p className="text-[#d4b8a0] text-lg font-medium">No lessons available</p>
        <p className="text-[#d4b8a0]/50 text-sm">This course doesn't have any lessons yet.</p>
      </div>
    );
  }

  // User doesn't have access
  if (!hasAccess) {
    return (
      <div className="text-center py-12">
        <div className="relative inline-block">
          <Lock className="w-16 h-16 text-[#c8963e]/30 mx-auto mb-4" />
          {courseData?.type === 'premium' && (
            <Crown className="w-6 h-6 text-[#c8963e] absolute -top-2 -right-2" />
          )}
        </div>
        <h3 className="text-xl font-semibold text-[#d4b8a0] mb-2">Access Restricted</h3>
        <p className="text-[#d4b8a0]/60 max-w-md mx-auto">
          {accessMessage || 'You need to enroll or subscribe to access these lessons.'}
        </p>
        {courseData?.type === 'premium' && (
          <button className="mt-4 px-6 py-2 bg-[#c8963e] text-[#0a0505] rounded-xl font-medium hover:bg-[#d4a85a] transition-all">
            Subscribe to Access
          </button>
        )}
      </div>
    );
  }

  // Show progress if available
  const showProgress = progress && progress.totalLessons > 0;

  return (
    <div>
      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-6 bg-[#1a0a0a]/50 rounded-xl p-4 border border-[#c8963e]/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#d4b8a0]">Your Progress</span>
            <span className="text-sm font-medium text-[#d4a85a]">
              {progress.completedLessons}/{progress.totalLessons} lessons • {progress.progressPercentage}%
            </span>
          </div>
          <div className="w-full h-2 bg-[#0a0505] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#c8963e] to-[#d4a85a] rounded-full transition-all duration-500"
              style={{ width: `${progress.progressPercentage}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-[#d4b8a0]/50">
            Total watch time: {progress.totalWatchTime} minutes
          </div>
        </div>
      )}

      {/* Lessons List */}
      <div className="space-y-4">
        {lessons.map((lesson, index) => {
          const isCompleted = progress?.lessonProgress?.[index]?.completed || false;
          const watchProgress = progress?.lessonProgress?.[index]?.progress || 0;
          
          return (
            <div 
              key={index} 
              className={`group bg-gradient-to-r from-[#1a0a0a]/40 to-transparent 
                         rounded-xl p-4 border transition-all hover:shadow-md
                         ${isCompleted 
                           ? 'border-emerald-500/30 hover:border-emerald-500/50' 
                           : 'border-[#c8963e]/10 hover:border-[#c8963e]/30'
                         }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Lesson Number */}
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full 
                                  text-sm font-bold transition-all flex-shrink-0
                                  ${isCompleted 
                                    ? 'bg-emerald-500 text-white' 
                                    : 'bg-[#c8963e]/20 text-[#d4a85a] group-hover:bg-[#c8963e] group-hover:text-[#0a0505]'
                                  }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Lesson Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium transition-colors ${isCompleted ? 'text-emerald-400' : 'text-[#d4b8a0] group-hover:text-[#d4a85a]'}`}>
                      {lesson.sectionName}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-[#d4b8a0]/50">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {lesson.duration || 0} min
                      </span>
                      <span className={`flex items-center gap-1 ${
                        lesson.isPublic ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {lesson.isPublic ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        {lesson.isPublic ? 'Public' : 'Private'}
                      </span>
                      {watchProgress > 0 && !isCompleted && (
                        <span className="text-[#d4a85a]">
                          {watchProgress}% watched
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Play Button */}
                <button
                  onClick={() => handlePlayLesson(lesson, index)}
                  className={`p-3 rounded-xl transition-all shadow-lg flex-shrink-0 ml-2
                            ${isCompleted
                              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                              : 'bg-[#c8963e]/10 text-[#d4a85a] group-hover:bg-[#c8963e] group-hover:text-[#0a0505]'
                            }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Lesson Progress Bar (if watched partially) */}
              {watchProgress > 0 && watchProgress < 100 && !isCompleted && (
                <div className="mt-2 ml-14">
                  <div className="w-full h-1 bg-[#0a0505] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#c8963e] rounded-full transition-all duration-300"
                      style={{ width: `${watchProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Total Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-[#1a0a0a]/50 rounded-xl p-3 text-center border border-[#c8963e]/10">
          <p className="text-2xl font-bold text-[#d4a85a]">{lessons.length}</p>
          <p className="text-xs text-[#d4b8a0]/50">Total Lessons</p>
        </div>
        <div className="bg-[#1a0a0a]/50 rounded-xl p-3 text-center border border-[#c8963e]/10">
          <p className="text-2xl font-bold text-[#d4a85a]">
            {progress?.completedLessons || 0}
          </p>
          <p className="text-xs text-[#d4b8a0]/50">Completed</p>
        </div>
        <div className="bg-[#1a0a0a]/50 rounded-xl p-3 text-center border border-[#c8963e]/10">
          <p className="text-2xl font-bold text-[#d4a85a]">
            {progress?.progressPercentage || 0}%
          </p>
          <p className="text-xs text-[#d4b8a0]/50">Progress</p>
        </div>
      </div>
    </div>
  );
};

export default LessonsPreview;