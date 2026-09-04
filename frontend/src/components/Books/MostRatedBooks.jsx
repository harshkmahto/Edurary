import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, ChevronRight } from 'lucide-react';
import BookCourseCard from '../extra/BookCourseCard';

const MostRatedBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setBooks([
        { _id: 'b1', title: 'Clean Code: A Handbook', type: 'book', thumbnail: null, description: 'Best practices for writing clean and maintainable code', rating: 4.9, views: 25000, reads: 18000, createdAt: new Date(), author: 'Robert C. Martin' },
        { _id: 'b2', title: 'The Pragmatic Programmer', type: 'book', thumbnail: null, description: 'Your journey to mastery in software development', rating: 4.8, views: 20000, reads: 15000, createdAt: new Date(), author: 'Andy Hunt' },
        { _id: 'b3', title: 'Design Patterns', type: 'book', thumbnail: null, description: 'Elements of reusable object-oriented software', rating: 4.7, views: 18000, reads: 12000, createdAt: new Date(), author: 'Gang of Four' },
        { _id: 'b4', title: 'You Don\'t Know JS', type: 'book', thumbnail: null, description: 'Deep dive into JavaScript core concepts', rating: 4.6, views: 16000, reads: 10000, createdAt: new Date(), author: 'Kyle Simpson' },
      ]);
      setLoading(false);
    }, 600);
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-40 bg-gray-200 dark:bg-[#1a1a1a] rounded"></div>
          <div className="h-4 w-20 bg-gray-200 dark:bg-[#1a1a1a] rounded"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-[#1a1a1a] rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-in-right" style={{ animationDelay: '100ms' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Most Rated Books</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600">
            Top Rated
          </span>
        </div>
        <button className="flex items-center gap-1 text-sm text-[#22c55e] hover:underline">
          View all <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {books.map((book, index) => (
          <BookCourseCard key={book._id} item={book} index={index} />
        ))}
      </div>
    </div>
  );
};

export default MostRatedBooks;