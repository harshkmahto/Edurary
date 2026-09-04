import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Star,
  Clock,
  User,
  Eye,
  Crown,
  Tag,
  Heart,
  Bookmark
} from 'lucide-react';

const BooksCard = ({
  id,
  title = 'Untitled Book',
  author = 'Unknown Author',
  authorName,
  category = 'General',
  subject,
  rating = 0,
  ratingCount = 0,
  pages = 0,
  thumbnail,
  image,
  isPremium = false,
  type,
  views = 0,
  downloads = 0,
  edition,
  publication,
  language = 'English',
  description,
  viewMode = 'grid',
  totalSaves = 0
}) => {
  const navigate = useNavigate();

  const bookAuthor = authorName || author;
  const bookImage = thumbnail || image;
  const premium = isPremium || type === 'premium';

  const handleCardClick = () => {
    if (!id) return;
    navigate(`/book-preview/${id}`);
  };

  const formatViews = (value) => {
    if (!value) return '0';
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value;
  };

  const renderRating = () => {
    if (!rating || rating === 0) {
      return 'No rating';
    }
    return Number(rating).toFixed(1);
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={handleCardClick}
        className="group relative rounded-2xl overflow-hidden
                   backdrop-blur-xl
                   bg-orange-50 dark:bg-[#1a0a0a]/60
                   border border-yellow-500 dark:border-[#c8963e]/40
                   transition-all duration-500
                   hover:shadow-[0_0_40px_rgba(200,150,62,0.15)]
                   hover:border-gray-300 dark:hover:border-[#c8963e]/30
                   hover:-translate-y-1
                   hover:scale-[1.01]
                   cursor-pointer"
      >
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 left-0 right-0 h-px
                          bg-gradient-to-r from-transparent
                          via-[#c8963e]/30
                          to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px
                          bg-gradient-to-r from-transparent
                          via-[#c8963e]/20
                          to-transparent" />
        </div>

        {premium && (
          <div className="absolute top-3 right-3 z-20">
            <span
              className="px-2.5 py-1.5 rounded-full
                         text-[10px] sm:text-xs
                         font-bold uppercase tracking-wider
                         bg-gradient-to-r from-[#c8963e] to-[#d4a85a]
                         text-[#0a0505]
                         shadow-[0_0_20px_rgba(200,150,62,0.3)]
                         flex items-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5" />
              Premium
            </span>
          </div>
        )}

        <div className="relative z-10 flex flex-col sm:flex-row gap-8 p-4">
          <div
            className="relative overflow-hidden rounded-xl
                       w-full sm:w-28
                       h-44 sm:h-40
                       flex-shrink-0
                       bg-gray-100 dark:bg-[#2d1810]/40
                       border border-gray-200 dark:border-[#c8963e]/10"
          >
            {bookImage ? (
              <img
                src={bookImage}
                alt={title}
                className="w-full h-full object-cover
                           transition-transform duration-700
                           group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center
                           bg-gradient-to-br
                           from-[#c8963e]/20
                           to-[#1a0a0a]/70"
              >
                <BookOpen
                  className="w-10 h-10
                             text-[#c8963e]/60"
                />
              </div>
            )}
            <div
              className="absolute inset-0
                         bg-gradient-to-t
                         from-black/50
                         via-transparent
                         to-transparent
                         pointer-events-none"
            />
          </div>

          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {category && (
                  <span
                    className="inline-flex items-center gap-1
                               px-2.5 py-1 rounded-full
                               text-[10px] sm:text-xs
                               bg-[#c8963e]/10
                               border border-[#c8963e]/10
                               text-[#c8963e]
                               dark:text-[#d4a85a]
                               truncate max-w-[180px]"
                  >
                    <Tag className="w-3 h-3 flex-shrink-0" />
                    {category}
                  </span>
                )}
                {subject && (
                  <span
                    className="hidden md:inline-block
                               px-2.5 py-1 rounded-full
                               text-[10px] sm:text-xs
                               bg-gray-100
                               dark:bg-[#c8963e]/5
                               text-gray-500
                               dark:text-[#8b6b5a]
                               truncate max-w-[150px]"
                  >
                    {subject}
                  </span>
                )}
              </div>

              <h3
                className="text-gray-800 dark:text-[#f5e6d3]
                           font-bold
                           text-base sm:text-xl
                           mb-1
                           line-clamp-2
                           leading-snug
                           group-hover:text-[#c8963e]
                           dark:group-hover:text-[#d4a85a]
                           transition-colors"
              >
                {title}
              </h3>

              <p
                className="text-gray-500 dark:text-[#d4b8a0]
                           text-sm
                           mb-2
                           flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">
                  {bookAuthor}
                </span>
              </p>
            </div>

            <div
              className="flex flex-wrap items-center
                         justify-between gap-3
                         mt-3 pt-3
                         border-t
                         border-gray-200
                         dark:border-[#c8963e]/10"
            >
              <div
                className="flex flex-wrap
                           items-center gap-3 sm:gap-5
                           text-xs
                           text-gray-400
                           dark:text-[#8b6b5a]"
              >
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  {formatViews(views)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Star
                    className={`w-4 h-4 ${
                      rating > 0
                        ? 'text-[#c8963e] fill-[#c8963e]'
                        : 'text-gray-400'
                    }`}
                  />
                  {renderRating()}
                </span>
                
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {pages} pages
                </span>
                {language && (
                  <span className="hidden lg:flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    {language}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleCardClick}
      className="group relative rounded-2xl overflow-hidden
                 backdrop-blur-xl
                 bg-orange-50 dark:bg-[#1a0a0a]/60
                 border border-yellow-400 dark:border-[#c8963e]/10
                 transition-all duration-500
                 hover:shadow-[0_0_40px_rgba(200,150,62,0.15)]
                 hover:border-gray-300 dark:hover:border-[#c8963e]/30
                 hover:-translate-y-2
                 hover:scale-[1.02]
                 cursor-pointer"
    >
      <div
        className="absolute inset-0 rounded-2xl
                   overflow-hidden pointer-events-none z-0"
      >
        <div
          className="absolute top-0 left-0 right-0 h-px
                     bg-gradient-to-r
                     from-transparent
                     via-[#c8963e]/30
                     to-transparent"
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-px
                     bg-gradient-to-r
                     from-transparent
                     via-[#c8963e]/20
                     to-transparent"
        />
      </div>

      {premium && (
        <div className="absolute top-3 right-3 z-20">
          <span
            className="px-2.5 py-1.5 rounded-full
                       text-[10px] sm:text-xs
                       font-bold uppercase tracking-wider
                       bg-gradient-to-r
                       from-[#c8963e]
                       to-[#d4a85a]
                       text-[#0a0505]
                       shadow-[0_0_20px_rgba(200,150,62,0.3)]
                       flex items-center gap-1.5"
          >
            <Crown className="w-3.5 h-3.5" />
            Premium
          </span>
        </div>
      )}

      <div
        className="relative overflow-hidden
                   aspect-[5/5]
                   bg-gray-100
                   dark:bg-gradient-to-br
                   dark:from-[#2d1810]/40
                   dark:to-[#1a0a0a]/60"
      >
        {bookImage ? (
          <img
            src={bookImage}
            alt={title}
            className="w-full h-full
                       object-cover
                       transition-transform
                       duration-700
                       group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className="absolute inset-0
                       flex items-center justify-center
                       bg-gradient-to-br
                       from-[#c8963e]/20
                       to-[#1a0a0a]/70"
          >
            <div
              className="w-16 h-20
                         rounded-xl
                         bg-[#c8963e]/10
                         border border-[#c8963e]/20
                         flex items-center justify-center
                         group-hover:scale-110
                         transition-transform duration-500"
            >
              <BookOpen
                className="w-7 h-7
                           text-[#d4a85a]
                           opacity-70"
              />
            </div>
          </div>
        )}

        <div
          className="absolute inset-0
                     bg-gradient-to-t
                     from-black/70
                     via-black/10
                     to-transparent
                     pointer-events-none"
        />

        <div
          className="absolute bottom-3 left-3 right-3
                     flex items-end justify-between
                     pointer-events-none"
        >
          {category && (
            <span
              className="max-w-[70%]
                         px-2.5 py-1
                         rounded-full
                         text-[10px]
                         font-medium
                         bg-black/50
                         backdrop-blur-md
                         border border-white/10
                         text-white
                         truncate"
            >
              {category}
            </span>
          )}
          {premium && (
            <span
              className="flex items-center gap-1
                         text-[#e8c87a]
                         text-[10px]
                         font-semibold"
            >
              <Crown className="w-3 h-3 fill-[#e8c87a]" />
            </span>
          )}
        </div>
      </div>

      <div className="relative z-10 p-4">
        <h3
          className="text-gray-800 dark:text-[#f5e6d3]
                     font-bold
                     text-sm sm:text-base
                     mb-1
                     line-clamp-2
                     leading-snug
                     min-h-[2.5rem]
                     group-hover:text-[#c8963e]
                     dark:group-hover:text-[#d4a85a]
                     transition-colors"
        >
          {title}
        </h3>

        <p
          className="text-gray-500 dark:text-[#d4b8a0]
                     text-xs
                     mb-3
                     flex items-center gap-1.5"
        >
          <User className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">
            {bookAuthor}
          </span>
        </p>

        {subject && (
          <div className="mb-3">
            <span
              className="inline-block
                         max-w-full
                         px-2 py-1
                         rounded-md
                         text-[10px]
                         bg-gray-100
                         dark:bg-[#c8963e]/5
                         border border-gray-200
                         dark:border-[#c8963e]/10
                         text-gray-500
                         dark:text-[#8b6b5a]
                         truncate"
            >
              {subject}
            </span>
          </div>
        )}

        <div
          className="flex items-center justify-between
                     pt-3
                     border-t
                     border-gray-200
                     dark:border-[#c8963e]/10"
        >
          <div
            className="flex items-center gap-2.5
                       text-[11px]
                       text-gray-400
                       dark:text-[#8b6b5a]"
          >
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {formatViews(views)}
            </span>
            <span className="flex items-center gap-1">
              <Star
                className={`w-3.5 h-3.5 ${
                  rating > 0
                    ? 'text-[#c8963e] fill-[#c8963e]'
                    : 'text-gray-400'
                }`}
              />
              {rating > 0 ? Number(rating).toFixed(1) : '-'}
            </span>
            
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {pages}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BooksCard;