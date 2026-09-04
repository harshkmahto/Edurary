import React, { useState, useEffect, useRef } from 'react';
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
  Lock,
  Calendar,
  Globe,
  Bookmark,
  Share2,
  Download,
  CheckCircle,
  XCircle,
  User,
  Mail,
  FileText,
  Tag,
  Layers,
  Award,
  TrendingUp,
  Copy,
  Check,
  X,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  MessageCircle,
  Share,
  ExternalLink
} from 'lucide-react';
import { getCourseById } from '../../services/course.service';
import toast from 'react-hot-toast';

// CSS Styles
const styles = `
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

  /* Video player styles */
  .video-player-container {
    position: relative;
    background: #000;
    border-radius: 16px;
    overflow: hidden;
  }

  .video-player-container iframe {
    width: 100%;
    aspect-ratio: 16/9;
    display: block;
    border: none;
  }

  .video-controls {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px;
    background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.4), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .video-player-container:hover .video-controls {
    opacity: 1;
  }

  .video-controls-visible {
    opacity: 1 !important;
  }

  .progress-bar {
    width: 100%;
    height: 4px;
    background: rgba(255,255,255,0.2);
    border-radius: 2px;
    cursor: pointer;
    position: relative;
    margin-bottom: 12px;
  }

  .progress-bar-fill {
    height: 100%;
    background: linear-gradient(to right, #10b981, #059669);
    border-radius: 2px;
    transition: width 0.1s linear;
    position: relative;
  }

  .progress-bar-fill::after {
    content: '';
    position: absolute;
    right: -6px;
    top: -3px;
    width: 10px;
    height: 10px;
    background: #10b981;
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .progress-bar:hover .progress-bar-fill::after {
    opacity: 1;
  }

  .tab-slider {
    position: absolute;
    bottom: 0;
    height: 2px;
    background: linear-gradient(to right, #10b981, #059669);
    border-radius: 2px;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @media (max-width: 640px) {
    .video-controls {
      padding: 12px;
    }
    .video-controls button {
      padding: 4px;
    }
  }

  /* YouTube embed responsive */
  .youtube-embed {
    position: relative;
    padding-bottom: 56.25%;
    height: 0;
    overflow: hidden;
    background: #000;
  }

  .youtube-embed iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

// Pause Icon Component
const PauseIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>
);

// Info Icon Component
const InfoIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
  </svg>
);

// YouTube Icon Component
const YoutubeIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const CourseAbout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isYoutubeVideo, setIsYoutubeVideo] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const youtubePlayerRef = useRef(null);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  // Load YouTube API
  useEffect(() => {
    if (showVideoPlayer && isYoutubeVideo && youtubeVideoId) {
      loadYouTubeAPI();
    }
  }, [showVideoPlayer, isYoutubeVideo, youtubeVideoId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await getCourseById(id);
      if (response?.success) {
        setCourse(response.course);
      } else {
        toast.error(response?.message || 'Failed to fetch course details');
        navigate('/admin/courses');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error(error.message || 'Failed to fetch course details');
      navigate('/admin/courses');
    } finally {
      setLoading(false);
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
        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-sm font-medium">
          <Crown className="w-4 h-4" />
          Premium
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-medium">
        <Unlock className="w-4 h-4" />
        Free
      </span>
    );
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(course._id);
    setCopied(true);
    toast.success('Course ID copied to clipboard');
    setTimeout(() => setCopied(false), 3000);
  };

  // Extract YouTube video ID from URL
  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7] && match[7].length === 11) ? match[7] : null;
  };

  // Check if URL is YouTube
  const isYoutubeUrl = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const handlePlayLesson = (lesson) => {
    setSelectedLesson(lesson);
    setShowVideoPlayer(true);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setVideoDuration(0);
    
    // Check if it's a YouTube video
    const isYoutube = isYoutubeUrl(lesson.videoLink);
    setIsYoutubeVideo(isYoutube);
    
    if (isYoutube) {
      const videoId = getYoutubeVideoId(lesson.videoLink);
      setYoutubeVideoId(videoId || '');
    }
  };

  const closeVideoPlayer = () => {
    setShowVideoPlayer(false);
    setIsPlaying(false);
    setSelectedLesson(null);
    setIsYoutubeVideo(false);
    setYoutubeVideoId('');
    
    // Stop YouTube player if exists
    if (youtubePlayerRef.current) {
      try {
        youtubePlayerRef.current.stopVideo();
        youtubePlayerRef.current.destroy();
        youtubePlayerRef.current = null;
      } catch (e) {
        console.log('Error stopping YouTube player:', e);
      }
    }
  };

  // Load YouTube API
  const loadYouTubeAPI = () => {
    if (!document.getElementById('youtube-iframe-api')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }

    // Initialize player when API is ready
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
            setVideoDuration(event.target.getDuration());
            setIsPlaying(true);
            setShowControls(true);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setShowControls(true);
              // Update progress
              const interval = setInterval(() => {
                if (youtubePlayerRef.current) {
                  try {
                    const current = youtubePlayerRef.current.getCurrentTime();
                    const duration = youtubePlayerRef.current.getDuration();
                    setCurrentTime(current);
                    setVideoDuration(duration);
                    setProgress((current / duration) * 100);
                  } catch (e) {
                    clearInterval(interval);
                  }
                }
              }, 1000);
              // Store interval for cleanup
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

  const togglePlay = () => {
    if (isYoutubeVideo && youtubePlayerRef.current) {
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
        toast.error('Unable to control video playback.');
      }
    } else if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(err => {
            console.log('Play error:', err);
            toast.error('Unable to play video. Please try again.');
          });
      }
    }
  };

  const toggleMute = () => {
    if (isYoutubeVideo && youtubePlayerRef.current) {
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

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setCurrentTime(current);
      setVideoDuration(duration);
      setProgress((current / duration) * 100);
    }
  };

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    
    if (isYoutubeVideo && youtubePlayerRef.current) {
      try {
        const duration = youtubePlayerRef.current.getDuration();
        youtubePlayerRef.current.seekTo(percentage * duration, true);
      } catch (e) {
        console.error('Error seeking:', e);
      }
    } else if (videoRef.current && videoRef.current.duration) {
      videoRef.current.currentTime = percentage * videoRef.current.duration;
    }
  };

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/50 dark:from-black dark:via-emerald-950/5 dark:to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent dark:border-emerald-400 mx-auto"></div>
          <p className="mt-6 text-emerald-600 dark:text-emerald-400/70 font-medium">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/50 dark:from-black dark:via-emerald-950/5 dark:to-black flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-20 h-20 text-emerald-400 dark:text-emerald-600 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Course not found</h3>
          <p className="text-emerald-600 dark:text-emerald-400/60 mt-2">The course you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/admin/courses')}
            className="mt-6 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'instructors', label: `Instructors (${course.instructors?.length || 0})` },
    { id: 'lessons', label: `Lessons (${course.lessons?.length || 0})` },
    { id: 'details', label: 'Details' },
    ...(course.premiumPlans && course.premiumPlans.length > 0 ? [{ id: 'plans', label: 'Premium Plans' }] : []),
    { id: 'ratings', label: 'Ratings' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/50 dark:from-black dark:via-emerald-950/5 dark:to-black">
      {/* Header */}
      <div className=" top-0 z-10 backdrop-blur-xl bg-white/80 dark:bg-black/80 border-b border-emerald-200/20 dark:border-emerald-800/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/courses')}
                className="p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-all group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Course Details</h1>
                <p className="text-sm text-emerald-600/60 dark:text-emerald-400/50">Complete information about the course</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-all">
                <Bookmark className="w-5 h-5" />
              </button>
              <button className="p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-all">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Course Header - Thumbnail Left, Info Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Thumbnail */}
          <div className="lg:col-span-1">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-100/50 to-emerald-200/50 dark:from-emerald-900/20 dark:to-emerald-800/20 aspect-video shadow-xl border border-emerald-200/30 dark:border-emerald-800/30 group">
              <img
                src={course.thumbnail || '/placeholder-course.jpg'}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button className="w-16 h-16 rounded-full bg-emerald-500/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 ml-1" />
                </button>
              </div>
              <div className="absolute top-3 left-3 flex items-center gap-2">
                {getTypeBadge(course.type)}
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(course.courseStatus)}`}>
                  {course.courseStatus.charAt(0).toUpperCase() + course.courseStatus.slice(1)}
                </span>
              </div>
              {course.isPublished && (
                <div className="absolute top-3 right-3">
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-medium backdrop-blur-sm">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Published
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                {course.title}
              </h1>
              <p className="text-emerald-600/70 dark:text-emerald-400/60 mt-1 line-clamp-2">
                {course.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{course.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{course.subject}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {course.languages?.join(', ') || 'English'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {course.lessons?.reduce((acc, l) => acc + (l.duration || 0), 0)} min total
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-emerald-200/20 dark:border-emerald-800/20">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{course.enrollmentCount || 0}</span>
                <span className="text-xs text-emerald-600/60 dark:text-emerald-400/50">enrolled</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{course.views || 0}</span>
                <span className="text-xs text-emerald-600/60 dark:text-emerald-400/50">views</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{course.rating?.average?.toFixed(1) || 0}</span>
                <span className="text-xs text-emerald-600/60 dark:text-emerald-400/50">({course.rating?.count || 0} reviews)</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{course.lessons?.length || 0}</span>
                <span className="text-xs text-emerald-600/60 dark:text-emerald-400/50">lessons</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs with Sliding Animation */}
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl rounded-2xl border border-emerald-200/20 dark:border-emerald-800/20 shadow-xl overflow-hidden">
          <div className="border-b border-emerald-200/20 dark:border-emerald-800/20 relative">
            <div className="flex overflow-x-auto hide-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium transition-all duration-300 whitespace-nowrap relative ${
                    activeTab === tab.id
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-emerald-600/60 dark:text-emerald-400/50 hover:text-emerald-600 dark:hover:text-emerald-400'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {/* Sliding indicator */}
            <div 
              className="tab-slider"
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
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-500" />
                      Description
                    </h3>
                    <p className="text-emerald-700 dark:text-emerald-300 leading-relaxed bg-emerald-50/50 dark:bg-emerald-500/5 rounded-xl p-4 border border-emerald-200/20 dark:border-emerald-800/20">
                      {course.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-emerald-50/50 dark:bg-emerald-500/5 rounded-xl p-4 border border-emerald-200/20 dark:border-emerald-800/20">
                      <h4 className="text-sm font-medium text-emerald-600/70 dark:text-emerald-400/60 mb-2 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Category
                      </h4>
                      <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                        {course.category}
                      </span>
                    </div>
                    <div className="bg-emerald-50/50 dark:bg-emerald-500/5 rounded-xl p-4 border border-emerald-200/20 dark:border-emerald-800/20">
                      <h4 className="text-sm font-medium text-emerald-600/70 dark:text-emerald-400/60 mb-2 flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        Subject
                      </h4>
                      <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-sm font-medium">
                        {course.subject}
                      </span>
                    </div>
                  </div>

                  {course.features && course.features.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-500" />
                        Features
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {course.features.map((feature, index) => (
                          <span key={index} className="px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 text-sm font-medium border border-purple-200/20 dark:border-purple-800/20">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {course.about && Object.keys(course.about).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <InfoIcon className="w-5 h-5 text-blue-500" />
                        About
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(course.about).map(([key, value]) => (
                          <div key={key} className="bg-emerald-50/50 dark:bg-emerald-500/5 rounded-xl p-4 border border-emerald-200/20 dark:border-emerald-800/20">
                            <p className="text-xs font-medium text-emerald-600/60 dark:text-emerald-400/50 uppercase tracking-wider">{key}</p>
                            <p className="text-sm text-gray-900 dark:text-white mt-1">{value}</p>
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
                    <div key={index} className="bg-gradient-to-br from-emerald-50/50 to-blue-50/50 dark:from-emerald-500/5 dark:to-blue-500/5 rounded-xl p-6 border border-emerald-200/20 dark:border-emerald-800/20 hover:shadow-lg transition-all">
                      <div className="flex items-start gap-4">
                        {instructor.profile ? (
                          <img
                            src={instructor.profile}
                            alt={instructor.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-emerald-200 dark:border-emerald-800"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-200 to-emerald-300 dark:from-emerald-500/30 dark:to-emerald-400/20 flex items-center justify-center">
                            <User className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{instructor.name}</h4>
                          {instructor.email && (
                            <p className="text-sm text-emerald-600 dark:text-emerald-400/60 flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5" />
                              {instructor.email}
                            </p>
                          )}
                          {instructor.bio && (
                            <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-2">{instructor.bio}</p>
                          )}
                          <div className="flex items-center gap-3 mt-3">
                            <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                              Instructor
                            </span>
                            <span className="text-xs text-emerald-600/60 dark:text-emerald-400/50">• {course.lessons?.length || 0} lessons</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Lessons Tab */}
              {activeTab === 'lessons' && (
                <div className="space-y-3 animate-fadeIn">
                  {course.lessons?.length > 0 ? (
                    course.lessons.map((lesson, index) => (
                      <div key={index} className="group bg-gradient-to-r from-emerald-50/30 to-transparent dark:from-emerald-500/5 dark:to-transparent rounded-xl p-4 border border-emerald-200/20 dark:border-emerald-800/20 hover:border-emerald-300/40 dark:hover:border-emerald-700/40 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/20">
                              {index + 1}
                            </span>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">{lesson.sectionName}</h4>
                              <div className="flex items-center gap-4 text-sm text-emerald-600 dark:text-emerald-400/60">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {lesson.duration || 0} min
                                </span>
                                <span className={`flex items-center gap-1 ${lesson.isPublic ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {lesson.isPublic ? (
                                    <CheckCircle className="w-3.5 h-3.5" />
                                  ) : (
                                    <XCircle className="w-3.5 h-3.5" />
                                  )}
                                  {lesson.isPublic ? 'Public' : 'Private'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handlePlayLesson(lesson)}
                            className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white dark:group-hover:bg-emerald-500 transition-all shadow-lg group-hover:shadow-emerald-500/25"
                          >
                            <Play className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-emerald-600 dark:text-emerald-400/60">
                      <Play className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p className="text-lg font-medium">No lessons available</p>
                      <p className="text-sm">This course doesn't have any lessons yet.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Details Tab */}
              {activeTab === 'details' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                  <div className="space-y-5">
                    <div className="bg-emerald-50/50 dark:bg-emerald-500/5 rounded-xl p-4 border border-emerald-200/20 dark:border-emerald-800/20">
                      <h4 className="text-xs font-medium text-emerald-600/60 dark:text-emerald-400/50 uppercase tracking-wider mb-2">Course ID</h4>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-900 dark:text-white font-mono text-sm truncate">{course._id}</p>
                        <button
                          onClick={handleCopyId}
                          className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-colors flex-shrink-0"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="bg-emerald-50/50 dark:bg-emerald-500/5 rounded-xl p-4 border border-emerald-200/20 dark:border-emerald-800/20">
                      <h4 className="text-xs font-medium text-emerald-600/60 dark:text-emerald-400/50 uppercase tracking-wider mb-2">Language</h4>
                      <div className="flex flex-wrap gap-2">
                        {course.languages?.map((lang, index) => (
                          <span key={index} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 text-sm font-medium">
                            <Globe className="w-3.5 h-3.5" />
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-emerald-50/50 dark:bg-emerald-500/5 rounded-xl p-4 border border-emerald-200/20 dark:border-emerald-800/20">
                      <h4 className="text-xs font-medium text-emerald-600/60 dark:text-emerald-400/50 uppercase tracking-wider mb-2">Created At</h4>
                      <p className="text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-500" />
                        {new Date(course.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="bg-emerald-50/50 dark:bg-emerald-500/5 rounded-xl p-4 border border-emerald-200/20 dark:border-emerald-800/20">
                      <h4 className="text-xs font-medium text-emerald-600/60 dark:text-emerald-400/50 uppercase tracking-wider mb-2">Last Updated</h4>
                      <p className="text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-500" />
                        {new Date(course.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="bg-emerald-50/50 dark:bg-emerald-500/5 rounded-xl p-4 border border-emerald-200/20 dark:border-emerald-800/20">
                      <h4 className="text-xs font-medium text-emerald-600/60 dark:text-emerald-400/50 uppercase tracking-wider mb-2">Course Type</h4>
                      <div className="mt-1">{getTypeBadge(course.type)}</div>
                    </div>

                    <div className="bg-emerald-50/50 dark:bg-emerald-500/5 rounded-xl p-4 border border-emerald-200/20 dark:border-emerald-800/20">
                      <h4 className="text-xs font-medium text-emerald-600/60 dark:text-emerald-400/50 uppercase tracking-wider mb-2">Status</h4>
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(course.courseStatus)}`}>
                        {course.courseStatus.charAt(0).toUpperCase() + course.courseStatus.slice(1)}
                      </span>
                    </div>

                    <div className="bg-emerald-50/50 dark:bg-emerald-500/5 rounded-xl p-4 border border-emerald-200/20 dark:border-emerald-800/20">
                      <h4 className="text-xs font-medium text-emerald-600/60 dark:text-emerald-400/50 uppercase tracking-wider mb-2">Order</h4>
                      <p className="text-gray-900 dark:text-white font-medium">{course.order || 0}</p>
                    </div>

                    <div className="bg-emerald-50/50 dark:bg-emerald-500/5 rounded-xl p-4 border border-emerald-200/20 dark:border-emerald-800/20">
                      <h4 className="text-xs font-medium text-emerald-600/60 dark:text-emerald-400/50 uppercase tracking-wider mb-2">Total Lessons</h4>
                      <p className="text-gray-900 dark:text-white font-medium">{course.lessons?.length || 0}</p>
                    </div>

                    {course.premiumPlans && course.premiumPlans.length > 0 && (
                      <div className="bg-emerald-50/50 dark:bg-emerald-500/5 rounded-xl p-4 border border-emerald-200/20 dark:border-emerald-800/20">
                        <h4 className="text-xs font-medium text-emerald-600/60 dark:text-emerald-400/50 uppercase tracking-wider mb-2">Premium Plans</h4>
                        <div className="flex flex-wrap gap-2">
                          {course.premiumPlans.map((plan, index) => (
                            <span key={index} className="px-3 py-1.5 rounded-full bg-gradient-to-r from-gold-50 to-yellow-50 dark:from-gold-500/10 dark:to-yellow-500/10 text-gold-700 dark:text-gold-300 text-sm font-medium border border-gold-200/30 dark:border-gold-800/30">
                              <Crown className="w-3.5 h-3.5 inline mr-1" />
                              {plan.charAt(0).toUpperCase() + plan.slice(1)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Premium Plans Tab */}
              {activeTab === 'plans' && course.premiumPlans && course.premiumPlans.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
                  {course.premiumPlans.map((plan, index) => {
                    const planDetails = {
                      basic: { 
                        color: 'from-blue-500 to-blue-600', 
                        icon: '⭐', 
                        desc: 'Basic access to course content',
                        features: ['Full course access', 'Certificate of completion', 'Community access']
                      },
                      premium: { 
                        color: 'from-purple-500 to-purple-600', 
                        icon: '👑', 
                        desc: 'Full access with bonus content',
                        features: ['Full course access', 'Certificate of completion', 'Bonus content', 'Priority support']
                      },
                      elite: { 
                        color: 'from-amber-500 to-amber-600', 
                        icon: '💎', 
                        desc: 'All access + exclusive benefits',
                        features: ['Full course access', 'Certificate of completion', 'Bonus content', '1-on-1 mentoring', 'Exclusive community']
                      }
                    };
                    const details = planDetails[plan] || planDetails.basic;
                    return (
                      <div key={index} className={`bg-gradient-to-br ${details.color} rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]`}>
                        <div className="text-4xl mb-3">{details.icon}</div>
                        <h4 className="text-2xl font-bold">{plan.charAt(0).toUpperCase() + plan.slice(1)}</h4>
                        <p className="text-white/80 text-sm mt-1">{details.desc}</p>
                        <div className="mt-6 pt-4 border-t border-white/20">
                          <span className="text-xs opacity-75 uppercase tracking-wider">Plan includes:</span>
                          <ul className="text-sm mt-3 space-y-2">
                            {details.features.map((feature, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Ratings Tab */}
              {activeTab === 'ratings' && (
                <div className="text-center py-16 animate-fadeIn">
                  <div className="relative inline-block">
                    <Star className="w-20 h-20 text-yellow-400 mx-auto mb-4 opacity-50" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-white text-xs font-bold">NEW</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Coming Soon</h3>
                  <p className="text-emerald-600 dark:text-emerald-400/60 mt-2 max-w-md mx-auto">
                    We're building a comprehensive rating and review system for this course.
                    Check back later to see what students are saying!
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-2 text-sm text-emerald-600/60 dark:text-emerald-400/50">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      Rate
                    </span>
                    <span className="w-1 h-1 rounded-full bg-emerald-600/30" />
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      Review
                    </span>
                    <span className="w-1 h-1 rounded-full bg-emerald-600/30" />
                    <span className="flex items-center gap-1">
                      <Share className="w-4 h-4" />
                      Share
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Modal - Supports YouTube and regular videos */}
      {showVideoPlayer && selectedLesson && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fadeIn"
          onClick={closeVideoPlayer}
        >
          <div 
            className="relative w-full max-w-5xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeVideoPlayer}
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Video Player */}
            <div 
              ref={playerRef} 
              className="relative bg-black rounded-2xl overflow-hidden shadow-2xl video-player-container"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {isYoutubeVideo ? (
                // YouTube Player
                <div id="youtube-player-container" className="w-full aspect-video"></div>
              ) : (
                // Regular HTML5 Video Player
                <>
                  <video
                    ref={videoRef}
                    src={selectedLesson.videoLink}
                    className="w-full aspect-video"
                    onTimeUpdate={handleTimeUpdate}
                    onClick={togglePlay}
                    onLoadedMetadata={handleVideoLoaded}
                    onEnded={handleVideoEnded}
                    playsInline
                  >
                    Your browser does not support the video tag.
                  </video>

                  {/* Central Play Button (when paused) */}
                  {!isPlaying && (
                    <button
                      onClick={togglePlay}
                      className="absolute inset-0 flex items-center justify-center z-10 group"
                    >
                      <div className="w-20 h-20 rounded-full bg-emerald-500/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform group-hover:bg-emerald-500">
                        <Play className="w-10 h-10 ml-1" />
                      </div>
                    </button>
                  )}

                  {/* Video Controls (only for regular videos) */}
                  <div className={`video-controls ${showControls ? 'video-controls-visible' : ''}`}>
                    {/* Progress Bar */}
                    <div 
                      className="progress-bar"
                      onClick={handleProgressClick}
                    >
                      <div 
                        className="progress-bar-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={togglePlay}
                          className="text-white hover:text-emerald-400 transition-colors p-1"
                        >
                          {isPlaying ? (
                            <PauseIcon className="w-6 h-6" />
                          ) : (
                            <Play className="w-6 h-6" />
                          )}
                        </button>
                        <button
                          onClick={toggleMute}
                          className="text-white hover:text-emerald-400 transition-colors p-1"
                        >
                          {isMuted ? (
                            <VolumeX className="w-6 h-6" />
                          ) : (
                            <Volume2 className="w-6 h-6" />
                          )}
                        </button>
                        <span className="text-white/80 text-sm font-medium">
                          {formatTime(currentTime)} / {formatTime(videoDuration)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={toggleFullscreen}
                          className="text-white hover:text-emerald-400 transition-colors p-1"
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
                </>
              )}

              {/* Lesson Info Overlay */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 pointer-events-auto">
                  <div className="flex items-center gap-2">
                    {isYoutubeVideo && <YoutubeIcon className="w-4 h-4 text-red-500" />}
                    <p className="text-white/80 text-sm">
                      Lesson {course.lessons?.indexOf(selectedLesson) + 1} of {course.lessons?.length}
                    </p>
                  </div>
                  <h4 className="text-white font-medium">{selectedLesson.sectionName}</h4>
                </div>
                {isYoutubeVideo && (
                  <a
                    href={selectedLesson.videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 text-white/70 hover:text-white transition-colors pointer-events-auto flex items-center gap-1 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in YouTube
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseAbout;