import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Edit, 
  Trash2, 
  Eye, 
  Star, 
  Users, 
  Play,
  Clock,
  CheckCircle,
  XCircle,
  Crown,
  Lock,
  Unlock,
  VideoIcon,
  Pencil
} from 'lucide-react';

const CourseCard = ({ course, onUpdate, onDelete, onToggleStatus }) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-emerald-600 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-800';
      case 'pending': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-800';
      case 'draft': return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
      case 'archived': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-800';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
    }
  };

  const getTypeBadge = (type) => {
    if (type === 'premium') {
      return (
        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400 text-xs font-medium">
          <Crown className="w-3 h-3" />
          Premium
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400 text-xs font-medium">
        <Unlock className="w-3 h-3" />
        Free
      </span>
    );
  };

  const getLessonCount = () => {
    return course.lessons?.length || 0;
  };

  const handleCardClick = () => {
    navigate(`/admin/course/about/${course._id}`);
  };

  const handleActionClick = (e, action) => {
    e.stopPropagation(); // Prevent card navigation when clicking actions
    action();
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white dark:bg-black rounded-xl border border-emerald-200/30 dark:border-emerald-800/30 overflow-hidden hover:shadow-lg hover:shadow-emerald-100 dark:hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={course.thumbnail || '/placeholder-course.jpg'} 
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          {getTypeBadge(course.type)}
        </div>
        <div className="absolute bottom-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.courseStatus)}`}>
            {course.courseStatus.charAt(0).toUpperCase() + course.courseStatus.slice(1)}
          </span>
        </div>
        {getLessonCount() > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 text-white text-xs">
            <Play className="w-3 h-3" />
            {getLessonCount()} Lessons
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1">
          {course.title}
        </h3>
        <p className="text-sm text-emerald-600 dark:text-emerald-400/60 line-clamp-2 mb-3">
          {course.description}
        </p>

        {/* Category & Subject */}
        <div className="flex flex-wrap gap-2 mb-3">
          {course.category && (
            <span className="px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs">
              {course.category}
            </span>
          )}
          {course.subject && (
            <span className="px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs">
              {course.subject}
            </span>
          )}
          {course.languages && course.languages.length > 0 && (
            <span className="px-2 py-1 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs">
              {course.languages.join(', ')}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-emerald-600 dark:text-emerald-400/60 border-t border-emerald-200/30 dark:border-emerald-800/30 pt-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {course.views || 0}
            </span>
            <span className="flex items-center gap-1">
              <VideoIcon className="w-4 h-4" />
              {getLessonCount()}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 dark:text-yellow-400 fill-yellow-500 dark:fill-yellow-400" />
            <span className="font-medium">{course.rating?.average?.toFixed(1) || 0}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-emerald-200/30 dark:border-emerald-800/30">
          <button
            onClick={(e) => handleActionClick(e, () => onToggleStatus(course._id, course.courseStatus === 'active' ? 'draft' : 'active'))}
            className={`p-2 rounded-lg transition-colors ${
              course.courseStatus === 'active'
                ? 'hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400'
                : 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            }`}
            title={course.courseStatus === 'active' ? 'draft' : 'Activate'}
          >
            {course.courseStatus === 'active' ? (
              <XCircle className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={(e) => handleActionClick(e, () => onUpdate(course))}
            className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => handleActionClick(e, () => onDelete(course._id))}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;