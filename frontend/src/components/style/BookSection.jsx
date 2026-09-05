import React, { useState, useEffect } from 'react';
import { BookOpen, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SquareText from '../../components/style/SquareText';
import bookService from '../../services/book.service';

const BookSection = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleBooks, setVisibleBooks] = useState(12); 
  const [hasMore, setHasMore] = useState(true);

  const handleBookNavigation = (bookId) => {
    if (bookId) {
      navigate(`/book-preview/${bookId}`);
    }
  };

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await bookService.getUserBooks({
          sortBy: 'createdAt',
          sortOrder: 'desc',
          status: 'active'
        });
        
        if (response.success) {
          setBooks(response.books);
          setHasMore(response.books.length > visibleBooks);
        } else {
          setError('Failed to fetch books');
        }
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to load books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleLoadMore = () => {
    const newVisibleCount = visibleBooks + 12;
    setVisibleBooks(newVisibleCount);
    setHasMore(books.length > newVisibleCount);
  };

  if (loading) {
    return (
      <div className="bg-[#0a0505] py-16 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center">
        <div className="text-[#f5e6d3] text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c8963e] mb-4"></div>
          <p>Loading books...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#0a0505] py-16 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center">
        <div className="text-[#f5e6d3] text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0505] py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Gradient Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                      w-[800px] h-[800px] rounded-full 
                      bg-gradient-to-r from-[#8b0000]/20 via-[#4a0000]/10 to-transparent
                      blur-3xl" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] 
                      bg-gradient-to-bl from-[#8b0000]/30 to-transparent 
                      rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] 
                      bg-gradient-to-tr from-[#6b0000]/20 to-transparent 
                      rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-3">
            <SquareText text="Latest Books" size="default" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#f5e6d3]">
            Explore Latest Collections
          </h2>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#c8963e]/30" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#c8963e]/30" />
          </div>
        </div>

        {/* Books Grid - 3 Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {books.slice(0, visibleBooks).map((book) => (
            <div 
              key={book._id || book.id}
              className="group cursor-pointer relative"
              onClick={() => handleBookNavigation(book._id || book.id)}
            >
              <div className="relative rounded-xl overflow-hidden
                            bg-gradient-to-br from-[#2d1810]/40 to-[#1a0a0a]/60
                            border border-[#c8963e]/10
                            transition-all duration-500
                            hover:shadow-[0_0_40px_rgba(200,150,62,0.2)]
                            hover:border-[#c8963e]/40
                            aspect-[3/4]">

                {/* ✅ CROWN BADGE - Only for premium books */}
                {book.type === 'premium' && (
                  <div className="absolute top-3 right-3 z-10">
                    <div className="bg-gradient-to-br from-[#f5c842] to-[#c8963e] 
                                  rounded-full p-1.5 shadow-lg shadow-[#c8963e]/30
                                  border border-[#f5c842]/50">
                      <Crown size={18} className="text-[#1a0a0a] fill-[#1a0a0a]" />
                    </div>
                  </div>
                )}

                {/* Book Cover Image */}
                <div className="relative overflow-hidden w-full h-full">
                  {book.thumbnail ? (
                    <img 
                      src={book.thumbnail} 
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-28 rounded-lg bg-gradient-to-br from-[#c8963e]/20 to-[#d4a85a]/10 
                                    border-2 border-[#c8963e]/20 flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-[#d4a85a] opacity-60" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Hover Overlay with Book Name */}
                <div className="absolute bottom-0 left-0 w-full 
                              bg-gradient-to-t from-[#0a0505] via-[#0a0505]/80 to-transparent
                              opacity-0 group-hover:opacity-100
                              transition-all duration-300
                              pt-16 pb-4 px-4">
                  <h3 className="text-lg font-medium text-[#f5e6d3] line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-[#d4b8a0] text-sm mt-1">
                    {book.authorName || 'Unknown Author'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center">
            <button 
              onClick={handleLoadMore}
              className="bg-white/10 backdrop-blur-sm rounded-full 
                        border border-[#c8963e]/30 px-8 py-3
                        hover:bg-[#c8963e]/20 hover:border-[#c8963e]/50
                        transition-all duration-300"
            >
              <span className="text-[#f5e6d3] font-medium">Load More Books</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookSection;