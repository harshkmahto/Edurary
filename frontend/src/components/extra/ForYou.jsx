import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import BookCourseCard from './BookCourseCard';

const ForYou = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching personalized recommendations
    setTimeout(() => {
      setItems([
        { _id: '1', title: 'JavaScript Mastery', type: 'course', thumbnail: null, description: 'Complete JavaScript course from beginner to advanced', rating: 4.8, views: 15000, createdAt: new Date(), instructors: [{ name: 'John Doe' }] },
        { _id: '2', title: 'Python Programming', type: 'book', thumbnail: null, description: 'Learn Python the hard way with practical examples', rating: 4.5, views: 8000, createdAt: new Date(), author: 'Jane Smith' },
        { _id: '3', title: 'Data Science Fundamentals', type: 'course', thumbnail: null, description: 'Master data science with hands-on projects', rating: 4.7, views: 12000, createdAt: new Date(), instructors: [{ name: 'Mike Johnson' }] },
        { _id: '4', title: 'React Native Development', type: 'book', thumbnail: null, description: 'Build cross-platform mobile apps with React Native', rating: 4.6, views: 6000, createdAt: new Date(), author: 'Sarah Williams' },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-32 bg-gray-200 dark:bg-[#1a1a1a] rounded"></div>
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
    <div className="animate-slide-in-right">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#22c55e]" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">For You</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#22c55e]/10 text-[#22c55e]">
            Personalized
          </span>
        </div>
        <button className="flex items-center gap-1 text-sm text-[#22c55e] hover:underline">
          View all <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <BookCourseCard key={item._id} item={item} index={index} />
        ))}
      </div>
    </div>
  );
};

export default ForYou;