import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, ChevronRight } from 'lucide-react';
import BookCourseCard from '../extra/BookCourseCard';

const MostRatedCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setCourses([
        { _id: 'c1', title: 'Machine Learning A-Z', type: 'course', thumbnail: null, description: 'Learn to create Machine Learning algorithms in Python', rating: 4.9, views: 30000, totalWatchTime: 36000, createdAt: new Date(), instructors: [{ name: 'Kirill Eremenko' }] },
        { _id: 'c2', title: 'The Complete Web Developer', type: 'course', thumbnail: null, description: 'Master web development with HTML, CSS, JS, React, Node.js', rating: 4.8, views: 28000, totalWatchTime: 42000, createdAt: new Date(), instructors: [{ name: 'Andrei Neagoie' }] },
        { _id: 'c3', title: 'Python for Data Science', type: 'course', thumbnail: null, description: 'Learn Python for data analysis and visualization', rating: 4.7, views: 22000, totalWatchTime: 30000, createdAt: new Date(), instructors: [{ name: 'Jose Portilla' }] },
        { _id: 'c4', title: 'iOS & Swift Development', type: 'course', thumbnail: null, description: 'Build iOS apps from scratch with Swift and Xcode', rating: 4.6, views: 18000, totalWatchTime: 25000, createdAt: new Date(), instructors: [{ name: 'Angela Yu' }] },
      ]);
      setLoading(false);
    }, 700);
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-44 bg-gray-200 dark:bg-[#1a1a1a] rounded"></div>
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
    <div className="animate-slide-in-right" style={{ animationDelay: '200ms' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Most Rated Courses</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600">
            Top Courses
          </span>
        </div>
        <button className="flex items-center gap-1 text-sm text-[#22c55e] hover:underline">
          View all <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {courses.map((course, index) => (
          <BookCourseCard key={course._id} item={course} index={index} />
        ))}
      </div>
    </div>
  );
};

export default MostRatedCourses;