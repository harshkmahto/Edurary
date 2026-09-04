import React, { useState, useEffect } from 'react';
import { Video, ChevronRight } from 'lucide-react';
import BookCourseCard from '../extra/BookCourseCard';

const SimilarCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setCourses([
        { _id: 'sc1', title: 'Deep Learning Specialization', type: 'course', thumbnail: null, description: 'Master deep learning with neural networks', rating: 4.9, views: 25000, totalWatchTime: 50000, createdAt: new Date(), instructors: [{ name: 'Andrew Ng' }] },
        { _id: 'sc2', title: 'Full Stack Web Development', type: 'course', thumbnail: null, description: 'Complete full stack development course', rating: 4.8, views: 22000, totalWatchTime: 45000, createdAt: new Date(), instructors: [{ name: 'Colt Steele' }] },
        { _id: 'sc3', title: 'Data Structures & Algorithms', type: 'course', thumbnail: null, description: 'Master DSA for coding interviews', rating: 4.7, views: 19000, totalWatchTime: 35000, createdAt: new Date(), instructors: [{ name: 'Abdul Bari' }] },
        { _id: 'sc4', title: 'DevOps Engineering', type: 'course', thumbnail: null, description: 'Learn DevOps with Docker, Kubernetes, and AWS', rating: 4.6, views: 15000, totalWatchTime: 28000, createdAt: new Date(), instructors: [{ name: 'Stephane Maarek' }] },
      ]);
      setLoading(false);
    }, 1000);
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
    <div className="animate-slide-in-right" style={{ animationDelay: '400ms' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Similar Courses</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600">
            Recommended
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

export default SimilarCourses;