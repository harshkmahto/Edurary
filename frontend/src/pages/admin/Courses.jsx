import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Book, 
  Clock, 
  CheckCircle, 
  Crown, 
  Star,
  Users,
  Eye
} from 'lucide-react';
import CourseCard from '../../components/admin/CourseCard';
import CreateCourse from '../../components/admin/CreateCourse';
import UpdateCourse from '../../components/admin/UpdateCourse';
import { getAllCourses, deleteCourse, toggleCourseStatus } from '../../services/course.service';
import toast from 'react-hot-toast';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [animatedStats, setAnimatedStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    draft: 0,
    archived: 0,
    free: 0,
    premium: 0,
    totalViews: 0,
    totalEnrollments: 0,
    averageRating: 0
  });

  // Fetch courses only
  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      const response = await getAllCourses();
      if (response?.success) {
        const coursesData = response.courses || [];
        setCourses(coursesData);
        updateStats(coursesData);
      } else {
        toast.error(response?.message || 'Failed to fetch courses');
        setCourses([]);
        updateStats([]);
      }
    } catch (error) {
      console.error('Fetch courses error:', error);
      toast.error(error.message || 'Failed to fetch courses');
      setCourses([]);
      updateStats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const updateStats = (coursesData) => {
    const safeCoursesData = Array.isArray(coursesData) ? coursesData : [];
    
    const newStats = {
      total: safeCoursesData.length,
      active: safeCoursesData.filter(c => c && c.courseStatus === 'active').length,
      pending: safeCoursesData.filter(c => c && c.courseStatus === 'pending').length,
      draft: safeCoursesData.filter(c => c && c.courseStatus === 'draft').length,
      archived: safeCoursesData.filter(c => c && c.courseStatus === 'archived').length,
      free: safeCoursesData.filter(c => c && c.type === 'free').length,
      premium: safeCoursesData.filter(c => c && c.type === 'premium').length,
      totalViews: safeCoursesData.reduce((sum, c) => sum + (c.views || 0), 0),
      totalEnrollments: safeCoursesData.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0),
      averageRating: safeCoursesData.length > 0 
        ? safeCoursesData.reduce((sum, c) => sum + (c.rating?.average || 0), 0) / safeCoursesData.length 
        : 0
    };
    animateStats(newStats);
  };

  const animateStats = (targetStats) => {
    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;
    let currentStep = 0;

    const startStats = {
      total: 0,
      active: 0,
      pending: 0,
      draft: 0,
      archived: 0,
      free: 0,
      premium: 0,
      totalViews: 0,
      totalEnrollments: 0,
      averageRating: 0
    };

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      
      setAnimatedStats({
        total: Math.round(startStats.total + (targetStats.total - startStats.total) * eased),
        active: Math.round(startStats.active + (targetStats.active - startStats.active) * eased),
        pending: Math.round(startStats.pending + (targetStats.pending - startStats.pending) * eased),
        draft: Math.round(startStats.draft + (targetStats.draft - startStats.draft) * eased),
        archived: Math.round(startStats.archived + (targetStats.archived - startStats.archived) * eased),
        free: Math.round(startStats.free + (targetStats.free - startStats.free) * eased),
        premium: Math.round(startStats.premium + (targetStats.premium - startStats.premium) * eased),
        totalViews: Math.round(startStats.totalViews + (targetStats.totalViews - startStats.totalViews) * eased),
        totalEnrollments: Math.round(startStats.totalEnrollments + (targetStats.totalEnrollments - startStats.totalEnrollments) * eased),
        averageRating: Number((startStats.averageRating + (targetStats.averageRating - startStats.averageRating) * eased).toFixed(1))
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedStats(targetStats);
      }
    }, interval);
  };

  const handleCreateCourse = (responseData) => {
    const newCourse = responseData?.course || responseData;
    if (newCourse && newCourse._id) {
      const updatedCourses = [...courses, newCourse];
      setCourses(updatedCourses);
      updateStats(updatedCourses);
      toast.success('Course created successfully!');
    } else {
      fetchCourses();
    }
  };

  const handleUpdateCourse = (responseData) => {
    const updatedCourse = responseData?.course || responseData;
    if (updatedCourse && updatedCourse._id) {
      const updatedCourses = courses.map(course => 
        course && course._id === updatedCourse._id ? updatedCourse : course
      );
      setCourses(updatedCourses);
      updateStats(updatedCourses);
      toast.success('Course updated successfully!');
    } else {
      fetchCourses();
    }
  };

  const handleToggleStatus = async (courseId, newStatus) => {
    try {
      const response = await toggleCourseStatus(courseId, newStatus);
      if (response?.success) {
        const updatedCourses = courses.map(course => 
          course && course._id === courseId ? { ...course, courseStatus: newStatus } : course
        );
        setCourses(updatedCourses);
        updateStats(updatedCourses);
        toast.success(`Course ${newStatus === 'active' ? 'activated' : 'updated to ' + newStatus} successfully`);
      } else {
        toast.error(response?.message || 'Failed to toggle course status');
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error(error.message || 'Failed to toggle course status');
    }
  };

  const handleDeleteClick = (courseId) => {
    setCourseToDelete(courseId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;
    
    try {
      const response = await deleteCourse(courseToDelete);
      if (response?.success) {
        toast.success('Course deleted successfully');
        const updatedCourses = courses.filter(course => course && course._id !== courseToDelete);
        setCourses(updatedCourses);
        updateStats(updatedCourses);
        setShowDeleteConfirm(false);
        setCourseToDelete(null);
      } else {
        toast.error(response?.message || 'Failed to delete course');
      }
    } catch (error) {
      console.error('Delete course error:', error);
      toast.error(error.message || 'Failed to delete course');
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setCourseToDelete(null);
  };

  const filteredCourses = courses.filter(course => {
    if (!course) return false;
    
    const matchesSearch = (course.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (course.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || course.courseStatus === filterStatus;
    const matchesType = filterType === 'all' || course.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const StatCard = ({ icon: Icon, label, value, color, suffix = '' }) => (
    <div className="p-4 rounded-xl bg-white dark:bg-black border border-emerald-200/30 dark:border-emerald-800/30 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-emerald-100 dark:hover:shadow-emerald-500/10">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm text-emerald-600 dark:text-emerald-400/70">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {animatedStats[value] !== undefined ? 
              typeof animatedStats[value] === 'number' && value === 'averageRating' 
                ? animatedStats[value].toFixed(1) 
                : animatedStats[value].toLocaleString() 
              : '0'}
            {suffix}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-green-50 dark:bg-black">
      {/* Header */}
      <div className="bg-white dark:bg-black border-b border-emerald-200/30 dark:border-emerald-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-500 dark:to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30 dark:shadow-emerald-400/20">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Edurary Course Management
                </h1>
                <p className="text-sm text-emerald-600/70 dark:text-emerald-400/60">
                  Manage your course collection efficiently
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 dark:from-emerald-500 dark:to-emerald-600 dark:hover:from-emerald-600 dark:hover:to-emerald-700 text-white rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/30 dark:hover:shadow-emerald-400/20 font-medium"
            >
              <Plus className="w-4 h-4" />
              Create Course
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <StatCard 
            icon={Book} 
            label="Total Courses" 
            value="total"
            color="bg-gradient-to-br from-emerald-600 to-emerald-700"
          />
          <StatCard 
            icon={CheckCircle} 
            label="Active" 
            value="active"
            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
          <StatCard 
            icon={Clock} 
            label="Pending" 
            value="pending"
            color="bg-gradient-to-br from-yellow-500 to-yellow-600"
          />
          <StatCard 
            icon={Star} 
            label="Free" 
            value="free"
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard 
            icon={Crown} 
            label="Premium" 
            value="premium"
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <StatCard 
            icon={Eye} 
            label="Total Views" 
            value="totalViews"
            color="bg-gradient-to-br from-cyan-500 to-cyan-600"
          />
          <StatCard 
            icon={Users} 
            label="Enrollments" 
            value="totalEnrollments"
            color="bg-gradient-to-br from-indigo-500 to-indigo-600"
          />
          <StatCard 
            icon={Star} 
            label="Avg Rating" 
            value="averageRating"
            color="bg-gradient-to-br from-amber-500 to-amber-600"
            suffix=" ⭐"
          />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-black rounded-xl border border-emerald-200/30 dark:border-emerald-800/30 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 dark:text-emerald-500" />
                <input
                  type="text"
                  placeholder="Search courses by title or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-green-50 dark:bg-black border border-emerald-200/30 dark:border-emerald-800/30 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-emerald-500/60 dark:placeholder-emerald-400/50"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  filterStatus === 'all'
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                    : 'bg-green-50 dark:bg-black text-emerald-600 dark:text-emerald-400/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-200/30 dark:border-emerald-800/30'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  filterStatus === 'active'
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                    : 'bg-green-50 dark:bg-black text-emerald-600 dark:text-emerald-400/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-200/30 dark:border-emerald-800/30'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  filterStatus === 'pending'
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                    : 'bg-green-50 dark:bg-black text-emerald-600 dark:text-emerald-400/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-200/30 dark:border-emerald-800/30'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus('draft')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  filterStatus === 'draft'
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                    : 'bg-green-50 dark:bg-black text-emerald-600 dark:text-emerald-400/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-200/30 dark:border-emerald-800/30'
                }`}
              >
                Draft
              </button>
              <button
                onClick={() => setFilterStatus('archived')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  filterStatus === 'archived'
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                    : 'bg-green-50 dark:bg-black text-emerald-600 dark:text-emerald-400/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-200/30 dark:border-emerald-800/30'
                }`}
              >
                Archived
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  filterType === 'all'
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                    : 'bg-green-50 dark:bg-black text-emerald-600 dark:text-emerald-400/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-200/30 dark:border-emerald-800/30'
                }`}
              >
                All Types
              </button>
              <button
                onClick={() => setFilterType('free')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  filterType === 'free'
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                    : 'bg-green-50 dark:bg-black text-emerald-600 dark:text-emerald-400/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-200/30 dark:border-emerald-800/30'
                }`}
              >
                Free
              </button>
              <button
                onClick={() => setFilterType('premium')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  filterType === 'premium'
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                    : 'bg-green-50 dark:bg-black text-emerald-600 dark:text-emerald-400/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-200/30 dark:border-emerald-800/30'
                }`}
              >
                Premium
              </button>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent dark:border-emerald-400"></div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-black rounded-xl border border-emerald-200/30 dark:border-emerald-800/30">
            <BookOpen className="w-16 h-16 mx-auto text-emerald-400 dark:text-emerald-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No courses found</h3>
            <p className="text-emerald-600 dark:text-emerald-400/60">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onUpdate={(course) => {
                  setSelectedCourse(course);
                  setShowUpdateModal(true);
                }}
                onDelete={handleDeleteClick}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-black rounded-xl p-6 max-w-md w-full border border-red-500/20 shadow-2xl shadow-red-500/10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <BookOpen className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Delete Course
              </h3>
              <p className="text-sm text-emerald-600 dark:text-emerald-400/60 mb-6">
                Are you sure you want to delete this course? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 border border-emerald-200/30 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateCourse
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateCourse}
        />
      )}

      {showUpdateModal && selectedCourse && (
        <UpdateCourse
          course={selectedCourse}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedCourse(null);
          }}
          onSuccess={handleUpdateCourse}
        />
      )}
    </div>
  );
};

export default Courses;