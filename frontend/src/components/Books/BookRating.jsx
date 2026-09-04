// components/books/BookRating.jsx
import React, { useState, useEffect } from 'react';
import { Star, Loader2, CheckCircle } from 'lucide-react';
import bookService from '../../services/book.service';
import { useAuth } from '../../context/authContext';

const BookRating = ({ bookId, bookRatings, onRatingUpdate }) => {
  const { user } = useAuth();
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [userRating, setUserRating] = useState(null);

  useEffect(() => {
    if (user) {
      fetchUserRating();
    }
  }, [bookId, user]);

  const fetchUserRating = async () => {
    try {
      const response = await bookService.getUserRating(bookId);
      if (response.success && response.hasRated) {
        setHasRated(true);
        setUserRating(response.rating);
        setSelectedRating(response.rating.rating);
      }
    } catch (error) {
      console.error('Error fetching user rating:', error);
    }
  };

  const handleRating = async (rating) => {
    if (!user) {
      alert('Please login to rate this book');
      return;
    }

    if (loading) return;

    // If user already rated and clicks same rating, do nothing
    if (hasRated && selectedRating === rating) {
      return;
    }

    try {
      setLoading(true);
      const response = await bookService.addOrUpdateRating(bookId, {
        rating: rating,
        review: ''
      });

      if (response.success) {
        setSelectedRating(rating);
        setHasRated(true);
        setUserRating(response.rating);
        
        // Refresh book data to get updated average rating
        if (onRatingUpdate) {
          onRatingUpdate();
        }
      }
    } catch (error) {
      console.error('Error rating book:', error);
      alert(error.message || 'Failed to rate book');
    } finally {
      setLoading(false);
    }
  };

  const getRatingText = (rating) => {
    const texts = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return texts[rating] || '';
  };

  return (
    <div className="p-6 rounded-xl bg-[#1a0a0a]/40 border border-[#c8963e]/10">
      <div className="flex flex-col gap-3">
        {/* Rating Stars */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => !loading && setHoveredRating(star)}
                onMouseLeave={() => !loading && setHoveredRating(0)}
                onClick={() => handleRating(star)}
                disabled={loading}
                className="p-0.5 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  className={`w-8 h-8 transition-all duration-200 ${
                    star <= (hoveredRating || selectedRating)
                      ? 'text-[#c8963e] fill-[#c8963e]'
                      : 'text-[#d4b8a0] fill-transparent'
                  }`}
                />
              </button>
            ))}
          </div>
          {loading && <Loader2 className="w-5 h-5 text-[#c8963e] animate-spin ml-2" />}
          {hasRated && !loading && (
            <CheckCircle className="w-5 h-5 text-[#22c55e] ml-2" />
          )}
        </div>

        {/* Rating Text */}
        <div className="flex items-center gap-3">
          <span className="text-[#d4b8a0] text-sm">
            {hoveredRating > 0
              ? getRatingText(hoveredRating)
              : selectedRating > 0
              ? `You rated ${selectedRating} star${selectedRating > 1 ? 's' : ''}`
              : 'Tap a star to rate'}
          </span>
          {selectedRating > 0 && (
            <span className="text-[#8b6b5a] text-xs">
              {hasRated ? '(updated)' : ''}
            </span>
          )}
        </div>

        {/* Average Rating Display */}
        {bookRatings && bookRatings.average > 0 && (
          <div className="flex items-center gap-4 pt-2 border-t border-[#c8963e]/10">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-[#c8963e] fill-[#c8963e]" />
              <span className="text-[#f5e6d3] font-semibold">
                {bookRatings.average.toFixed(1)}
              </span>
              <span className="text-[#8b6b5a] text-sm">
                ({bookRatings.count} {bookRatings.count === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookRating;