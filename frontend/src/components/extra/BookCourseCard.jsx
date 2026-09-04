import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, Star, BookOpen, Video, Clock, 
  TrendingUp, Award, Calendar, User 
} from 'lucide-react';

const BookCourseCard = ({ item, viewMode = 'grid', index }) => {
  const navigate = useNavigate();

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 80) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const handleClick = () => {
    if (item.type === 'book') {
      navigate(`/book-preview/${item._id}`);
    } else {
      const courseTitle = item.title?.toLowerCase().replace(/\s+/g, '-') || 'course';
      navigate(`/course-preview/${courseTitle}/${item._id}`);
    }
  };

  if (viewMode === 'list') {
    return (
      <div 
        onClick={handleClick}
        className="group bg-white/50 dark:bg-[#0a0a0a]/50 rounded-xl border border-gray-200/50 dark:border-[#f59e0b]/20 p-4 hover:shadow-lg transition-all duration-300 hover:border-[#f59e0b]/40 cursor-pointer flex gap-4"
      >
        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-[#f59e0b]/10 to-[#d97706]/10">
          {item.thumbnail ? (
            <img 
              src={item.thumbnail} 
              alt={item.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {item.type === 'book' ? (
                <BookOpen className="w-8 h-8 text-[#f59e0b]" />
              ) : (
                <Video className="w-8 h-8 text-[#f59e0b]" />
              )}
            </div>
          )}
          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-medium bg-black/50 text-white backdrop-blur-sm">
            {item.type}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#f59e0b] transition-colors">
              {truncateText(item.title, 50)}
            </h3>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {item.type === 'book' ? item.author : item.instructors?.[0]?.name || 'Unknown'}
          </p>
          
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">
            {truncateText(item.description, 60)}
          </p>

          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {item.views || 0}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-[#f59e0b] fill-[#f59e0b]" />
              {item.rating?.toFixed(1) || 0}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(item.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center">
          <span className={`text-xs px-2 py-1 rounded-full ${
            item.type === 'free' 
              ? 'bg-[#f59e0b]/10 text-[#f59e0b]' 
              : 'bg-[#f59e0b]/20 text-[#d97706]'
          }`}>
            {item.type || 'Free'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={handleClick}
      className="group bg-white/50 dark:bg-[#0a0a0a]/50 rounded-xl border border-gray-200/50 dark:border-[#f59e0b]/20 overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-[#f59e0b]/40 hover:-translate-y-1 cursor-pointer"
      style={{
        animationDelay: `${index * 50}ms`,
        animationFillMode: 'both'
      }}
    >
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-[#f59e0b]/10 to-[#d97706]/10">
        {item.thumbnail ? (
          <img 
            src={item.thumbnail} 
            alt={item.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {item.type === 'book' ? (
              <BookOpen className="w-12 h-12 text-[#f59e0b]" />
            ) : (
              <Video className="w-12 h-12 text-[#f59e0b]" />
            )}
          </div>
        )}
        
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-black/50 text-white backdrop-blur-sm">
            {item.type}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-medium backdrop-blur-sm ${
            item.type === 'free' 
              ? 'bg-[#f59e0b]/80 text-white' 
              : 'bg-[#d97706]/80 text-white'
          }`}>
            {item.type || 'Free'}
          </span>
        </div>

        {item.rating > 0 && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm flex items-center gap-1">
            <Star className="w-3 h-3 text-[#f59e0b] fill-[#f59e0b]" />
            <span className="text-xs font-medium text-white">{item.rating?.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#f59e0b] transition-colors line-clamp-1">
          {item.title}
        </h3>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {item.type === 'book' ? item.author : item.instructors?.[0]?.name || 'Unknown'}
        </p>
        
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">
          {truncateText(item.description, 60)}
        </p>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/50 dark:border-[#f59e0b]/10">
          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-0.5">
              <Eye className="w-3 h-3" />
              {item.views || 0}
            </span>
            {item.engagement?.reads && (
              <span className="flex items-center gap-0.5">
                <BookOpen className="w-3 h-3" />
                {item.engagement.reads}
              </span>
            )}
            {item.engagement?.watchTime && (
              <span className="flex items-center gap-0.5">
                <Clock className="w-3 h-3" />
                {Math.floor(item.engagement.watchTime / 60)}m
              </span>
            )}
          </div>
        
        </div>
      </div>
    </div>
  );
};

export default BookCourseCard;