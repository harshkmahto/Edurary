import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  Lock,
  Crown,
  ExternalLink
} from 'lucide-react';
import courseService from '../../services/course.service';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/authContext';

// YouTube Icon Component
const YoutubeIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const LessonPlayer = () => {
  const { courseTitle, courseId, lessonIndex } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isYoutube, setIsYoutube] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState(null);
  
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    if (courseId && lessonIndex !== undefined) {
      fetchLesson();
    }
  }, [courseId, lessonIndex]);

  useEffect(() => {
    if (isYoutube && youtubeVideoId) {
      loadYouTubeAPI();
    }
  }, [isYoutube, youtubeVideoId]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is logged in
      if (!user) {
        setError('Please login to access lessons');
        setLoading(false);
        return;
      }

      console.log('Fetching lessons for course:', courseId);
      const response = await courseService.getCourseLessons(courseId);
      console.log('Response:', response);
      
      if (response?.success && response?.data) {
        const data = response.data;
        console.log('Course data:', data);
        setCourse(data);
        setHasAccess(data.hasAccess || false);
        
        const index = parseInt(lessonIndex);
        console.log('Looking for lesson at index:', index);
        console.log('Available lessons:', data.lessons);
        
        if (data.lessons && data.lessons[index]) {
          const lessonData = data.lessons[index];
          console.log('Lesson found:', lessonData);
          setLesson(lessonData);
          
          // Check if YouTube video
          const isYt = isYoutubeUrl(lessonData.videoLink);
          setIsYoutube(isYt);
          if (isYt) {
            const videoId = getYoutubeVideoId(lessonData.videoLink);
            setYoutubeVideoId(videoId || '');
          }
        } else {
          toast.error('Lesson not found at index ' + index);
          console.error('Lesson not found. Available lessons:', data.lessons);
          navigate(`/course-preview/${courseTitle || courseId}/${courseId}`);
        }
      } else {
        const errorMsg = response?.message || 'Failed to fetch lesson';
        setError(errorMsg);
        toast.error(errorMsg);
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
      const errorMsg = error.message || 'Failed to fetch lesson';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // YouTube helper functions
  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7] && match[7].length === 11) ? match[7] : null;
  };

  const isYoutubeUrl = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Load YouTube API
  const loadYouTubeAPI = () => {
    if (!document.getElementById('youtube-iframe-api')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }

    if (window.YT && window.YT.Player) {
      initYouTubePlayer();
    } else {
      window.onYouTubeIframeAPIReady = () => {
        initYouTubePlayer();
      };
    }
  };

  const initYouTubePlayer = () => {
    const container = document.getElementById('youtube-player-container');
    if (!container) return;
    
    if (youtubePlayerRef.current) {
      try {
        youtubePlayerRef.current.destroy();
        youtubePlayerRef.current = null;
      } catch (e) {
        console.log('Error destroying player:', e);
      }
    }

    try {
      youtubePlayerRef.current = new window.YT.Player('youtube-player-container', {
        height: '100%',
        width: '100%',
        videoId: youtubeVideoId,
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          controls: 0,
          showinfo: 0,
          iv_load_policy: 3,
          playsinline: 1
        },
        events: {
          onReady: (event) => {
            setDuration(event.target.getDuration());
            setIsPlaying(true);
            setShowControls(true);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setShowControls(true);
              const interval = setInterval(() => {
                if (youtubePlayerRef.current) {
                  try {
                    const current = youtubePlayerRef.current.getCurrentTime();
                    const dur = youtubePlayerRef.current.getDuration();
                    setCurrentTime(current);
                    setDuration(dur);
                    setProgress((current / dur) * 100);
                  } catch (e) {
                    clearInterval(interval);
                  }
                }
              }, 1000);
              if (youtubePlayerRef.current) {
                youtubePlayerRef.current._progressInterval = interval;
              }
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
              if (youtubePlayerRef.current && youtubePlayerRef.current._progressInterval) {
                clearInterval(youtubePlayerRef.current._progressInterval);
              }
            } else if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              setProgress(0);
              if (youtubePlayerRef.current && youtubePlayerRef.current._progressInterval) {
                clearInterval(youtubePlayerRef.current._progressInterval);
              }
            }
          },
          onError: (error) => {
            console.error('YouTube player error:', error);
            toast.error('Error playing video. Please try again.');
          }
        }
      });
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
      toast.error('Unable to load YouTube player. Please try again.');
    }
  };

  // Video controls
  const togglePlay = () => {
    if (isYoutube && youtubePlayerRef.current) {
      try {
        if (isPlaying) {
          youtubePlayerRef.current.pauseVideo();
          setIsPlaying(false);
        } else {
          youtubePlayerRef.current.playVideo();
          setIsPlaying(true);
        }
      } catch (e) {
        console.error('Error toggling play:', e);
      }
    } else if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.log('Play error:', err));
      }
    }
  };

  const toggleMute = () => {
    if (isYoutube && youtubePlayerRef.current) {
      try {
        if (isMuted) {
          youtubePlayerRef.current.unMute();
          setIsMuted(false);
        } else {
          youtubePlayerRef.current.mute();
          setIsMuted(true);
        }
      } catch (e) {
        console.error('Error toggling mute:', e);
      }
    } else if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    
    if (isYoutube && youtubePlayerRef.current) {
      try {
        const dur = youtubePlayerRef.current.getDuration();
        youtubePlayerRef.current.seekTo(percentage * dur, true);
      } catch (e) {
        console.error('Error seeking:', e);
      }
    } else if (videoRef.current && videoRef.current.duration) {
      videoRef.current.currentTime = percentage * videoRef.current.duration;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      setCurrentTime(current);
      setDuration(dur);
      setProgress((current / dur) * 100);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Navigation handlers
  const goToPreviousLesson = () => {
    const prevIndex = parseInt(lessonIndex) - 1;
    if (prevIndex >= 0) {
      navigate(`/course/${courseTitle}/${courseId}/lesson/${prevIndex}`);
    }
  };

  const goToNextLesson = () => {
    const nextIndex = parseInt(lessonIndex) + 1;
    if (course && nextIndex < (course.totalLessons || 0)) {
      navigate(`/course/${courseTitle}/${courseId}/lesson/${nextIndex}`);
    }
  };

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0505] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Lock className="w-20 h-20 text-[#c8963e]/30 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-[#d4b8a0]">Access Restricted</h3>
          <p className="text-[#d4b8a0]/60 mt-2">{error}</p>
          <button
            onClick={() => navigate(`/course-preview/${courseTitle || courseId}/${courseId}`)}
            className="mt-6 px-8 py-3 bg-[#c8963e] hover:bg-[#d4a85a] text-[#0a0505] rounded-xl transition-all"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0505] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#c8963e] border-t-transparent mx-auto"></div>
          <p className="mt-6 text-[#d4b8a0]">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#0a0505] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Lock className="w-20 h-20 text-[#c8963e]/30 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-[#d4b8a0]">Access Restricted</h3>
          <p className="text-[#d4b8a0]/60 mt-2">
            {course?.type === 'premium' 
              ? 'This is a premium course. Please subscribe to access the lessons.'
              : 'You don\'t have access to this lesson. Please login or enroll.'}
          </p>
          {course?.type === 'premium' && (
            <button className="mt-4 px-6 py-2 bg-[#c8963e] text-[#0a0505] rounded-xl font-medium hover:bg-[#d4a85a] transition-all">
              Subscribe Now
            </button>
          )}
          <button
            onClick={() => navigate(`/course-preview/${courseTitle || courseId}/${courseId}`)}
            className="mt-4 px-8 py-3 bg-[#c8963e]/20 hover:bg-[#c8963e]/30 text-[#d4a85a] rounded-xl transition-all block mx-auto"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-[#0a0505] flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-[#d4b8a0]">Lesson not found</h3>
          <button
            onClick={() => navigate(`/course-preview/${courseTitle || courseId}/${courseId}`)}
            className="mt-6 px-8 py-3 bg-[#c8963e] hover:bg-[#d4a85a] text-[#0a0505] rounded-xl transition-all"
          >
            Back to Course
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
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/course-preview/${courseTitle || courseId}/${courseId}`)}
              className="p-2.5 rounded-xl hover:bg-[#c8963e]/10 text-[#d4a85a] transition-all group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-[#d4b8a0] truncate max-w-[200px] sm:max-w-[400px]">
                {course?.title || 'Course'}
              </h1>
              <p className="text-sm text-[#d4b8a0]/50">
                Lesson {parseInt(lessonIndex) + 1}: {lesson.sectionName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isYoutube && (
              <a
                href={lesson.videoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all text-sm"
              >
                <YoutubeIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Open in YouTube</span>
              </a>
            )}
          </div>
        </div>

        {/* Video Player */}
        <div 
          ref={playerRef}
          className="relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-[#c8963e]/20"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {isYoutube ? (
            <div id="youtube-player-container" className="w-full aspect-video"></div>
          ) : (
            <video
              ref={videoRef}
              src={lesson.videoLink}
              className="w-full aspect-video"
              onTimeUpdate={handleTimeUpdate}
              onClick={togglePlay}
              playsInline
            >
              Your browser does not support the video tag.
            </video>
          )}

          {/* Central Play Button (when paused) */}
          {!isPlaying && !isYoutube && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center z-10 group"
            >
              <div className="w-20 h-20 rounded-full bg-[#c8963e]/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform group-hover:bg-[#c8963e]">
                <Play className="w-10 h-10 ml-1" />
              </div>
            </button>
          )}

          {/* Video Controls */}
          <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}>
            {/* Progress Bar */}
            <div 
              className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-3"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-gradient-to-r from-[#c8963e] to-[#d4a85a] rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-[#c8963e] transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </button>
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-[#c8963e] transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-6 h-6" />
                  ) : (
                    <Volume2 className="w-6 h-6" />
                  )}
                </button>
                <span className="text-white/80 text-sm font-medium hidden sm:inline">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-[#c8963e] transition-colors"
                >
                  {isFullscreen ? (
                    <Minimize className="w-6 h-6" />
                  ) : (
                    <Maximize className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lesson Navigation & Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Previous/Next Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={goToPreviousLesson}
              disabled={parseInt(lessonIndex) === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all
                ${parseInt(lessonIndex) > 0 
                  ? 'bg-[#c8963e]/10 text-[#d4a85a] hover:bg-[#c8963e]/20 border border-[#c8963e]/20' 
                  : 'bg-[#1a0a0a]/50 text-[#d4b8a0]/30 cursor-not-allowed'
                }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={goToNextLesson}
              disabled={!course || parseInt(lessonIndex) >= (course?.totalLessons || 0) - 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all
                ${course && parseInt(lessonIndex) < (course?.totalLessons || 0) - 1
                  ? 'bg-[#c8963e]/10 text-[#d4a85a] hover:bg-[#c8963e]/20 border border-[#c8963e]/20' 
                  : 'bg-[#1a0a0a]/50 text-[#d4b8a0]/30 cursor-not-allowed'
                }`}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Lesson Info */}
          <div className="md:col-span-2 bg-[#1a0a0a]/40 backdrop-blur-sm rounded-xl border border-[#c8963e]/10 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#d4b8a0]">{lesson.sectionName}</h2>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-[#d4b8a0]/50 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {lesson.duration || 0} minutes
                  </span>
                  <span className={`text-xs px-3 py-0.5 rounded-full ${
                    lesson.isPublic ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {lesson.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm text-[#d4b8a0]/50">
                  {parseInt(lessonIndex) + 1} / {course?.totalLessons || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPlayer;