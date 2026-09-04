import React from 'react';
import { Eye, Edit, Trash2, Crown, Star, Calendar, User, BookOpen, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BooksCard = ({ book, onUpdate, onDelete, onToggleStatus }) => {
  const navigate = useNavigate();

  // Add safety check for book prop
  if (!book) {
    return null;
  }

  const getBadgeColor = (type) => {
    if (type === 'premium') {
      return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white';
    }
    return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white';
  };

  const getStatusColor = (status) => {
    if (status === 'active') {
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    }
    if (status === 'draft') {
      return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
    }
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  };

  // Generate random gradient for book cover fallback
  const getRandomGradient = (title) => {
    const colors = [
      'from-rose-500 to-rose-700',
      'from-blue-500 to-blue-700',
      'from-emerald-500 to-emerald-700',
      'from-purple-500 to-purple-700',
      'from-amber-500 to-amber-700',
      'from-cyan-500 to-cyan-700',
      'from-indigo-500 to-indigo-700',
      'from-pink-500 to-pink-700'
    ];
    const index = title?.length ? title.length % colors.length : 0;
    return colors[index];
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(book._id || book.id);
    }
  };

  const handleUpdate = () => {
    if (onUpdate) {
      onUpdate(book);
    }
  };

  const handleToggleStatus = () => {
    if (onToggleStatus) {
      const newStatus = book.status === 'active' ? 'inactive' : 'active';
      onToggleStatus(book._id || book.id, newStatus);
    }
  };

  const handleNavigateToPreview = () => {
    navigate(`/admin/book/preview/${book._id}`);
  };

  return (
    <div className="group bg-white dark:bg-black rounded-lg overflow-hidden border border-emerald-200/30 dark:border-emerald-800/30 hover:border-emerald-400/50 dark:hover:border-emerald-600/50 transition-all duration-300 hover:shadow-md hover:shadow-emerald-500/10 dark:hover:shadow-emerald-400/5 hover:-translate-y-0.5 max-w-[300px] w-full flex flex-col">
      {/* Thumbnail - Clickable to preview */}
      <div 
        className="relative h-40 overflow-hidden bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 cursor-pointer"
        onClick={handleNavigateToPreview}
      >
        {book.thumbnail ? (
          <img
            src={book.thumbnail}
            alt={book.title || 'Book cover'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.classList.add('bg-gradient-to-br', getRandomGradient(book.title));
            }}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getRandomGradient(book.title)} flex items-center justify-center`}>
            <BookOpen className="w-8 h-8 text-white/30" />
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-2 right-2 flex gap-1.5">
          <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium shadow-lg ${getBadgeColor(book.type)}`}>
            {book.type === 'premium' ? (
              <span className="flex items-center gap-0.5">
                <Crown className="w-2.5 h-2.5" /> Premium
              </span>
            ) : (
              <span className="flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5" /> Free
              </span>
            )}
          </span>
        </div>
        
        <div className="absolute bottom-2 left-2">
          <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium shadow-lg ${getStatusColor(book.status)}`}>
            {book.status?.charAt(0).toUpperCase() + book.status?.slice(1) || 'Pending'}
          </span>
        </div>

        {/* View indicator on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="p-2 bg-white/90 dark:bg-black/90 rounded-full shadow-xl">
            <ExternalLink className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-2.5 space-y-1 bg-white dark:bg-black flex-1">
        <h3 className="text-xs font-semibold text-black dark:text-white line-clamp-2 leading-tight min-h-[2rem]">
          {book.title || 'Untitled Book'}
        </h3>
        
        <div className="flex items-center gap-1 text-[10px] text-black/60 dark:text-white/60">
          <User className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="line-clamp-1">{book.authorName || book.author || 'Unknown'}</span>
        </div>

        <div className="flex items-center justify-between pt-1.5 border-t border-emerald-100/30 dark:border-emerald-800/30">
          <div className="flex items-center gap-1.5 text-[10px] text-black/50 dark:text-white/50">
            <Eye className="w-3 h-3" />
            <span>{(book.views || 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-black/40 dark:text-white/40">
            <Calendar className="w-2.5 h-2.5" />
            <span>{book.createdAt ? new Date(book.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</span>
          </div>
        </div>

        {/* Pages and Category */}
        <div className="flex items-center justify-between text-[10px] text-black/50 dark:text-white/50 pt-0.5">
          <span>{book.pages || 0}p</span>
          <span className="px-1.5 py-0.5 bg-black/5 dark:bg-white/5 rounded text-[9px]">
            {book.category || 'General'}
          </span>
        </div>

        {/* Action Buttons at Bottom */}
        <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-emerald-100/30 dark:border-emerald-800/30 mt-1">
          {/* Toggle Switch */}
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-medium text-black/40 dark:text-white/40">
              {book.status === 'active' ? 'Active' : 'Inactive'}
            </span>
            <button
              onClick={handleToggleStatus}
              className={`relative w-8 h-4 rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0 ${
                book.status === 'active' 
                  ? 'bg-emerald-500 dark:bg-emerald-400' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
              aria-label={`Toggle ${book.title} status`}
            >
              <span
                className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-300 shadow-md ${
                  book.status === 'active' ? 'translate-x-4.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleNavigateToPreview}
              className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors duration-200"
              aria-label="View book"
              title="View Book"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </button>
            <button
              onClick={handleUpdate}
              className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
              aria-label="Edit book"
              title="Edit Book"
            >
              <Edit className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
              aria-label="Delete book"
              title="Delete Book"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BooksCard;