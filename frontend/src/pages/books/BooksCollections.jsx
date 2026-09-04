import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Clock, Sparkles, GraduationCap, Compass,
  Globe, Code, Calculator, Microscope, Palette,
  Brain, TrendingUp, Award, Users, Star, Filter,
  Search, Grid, List, BookMarked, Library, Zap
} from 'lucide-react';
import BooksCard from '../../components/Books/BooksCard';
import { getUserBooks } from '../../services/book.service';
import MainButton from '../../components/style/MainButton';

const BooksCollections = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  // Real books fetched from backend
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [booksError, setBooksError] = useState('');

  // Subject Data with search queries
  const subjects = [
    { name: 'Computer Science', icon: <Code className="w-8 h-8" />, color: 'from-blue-500/20 to-blue-600/10', query: 'computer science' },
    { name: 'Mathematics', icon: <Calculator className="w-8 h-8" />, color: 'from-green-500/20 to-green-600/10', query: 'mathematics' },
    { name: 'Science', icon: <Microscope className="w-8 h-8" />, color: 'from-purple-500/20 to-purple-600/10', query: 'science' },
    { name: 'Arts', icon: <Palette className="w-8 h-8" />, color: 'from-pink-500/20 to-pink-600/10', query: 'arts' },
    { name: 'Geography', icon: <Globe className="w-8 h-8" />, color: 'from-cyan-500/20 to-cyan-600/10', query: 'geography' },
    { name: 'Psychology', icon: <Brain className="w-8 h-8" />, color: 'from-indigo-500/20 to-indigo-600/10', query: 'psychology' },
    { name: 'Physics', icon: <Zap className="w-8 h-8" />, color: 'from-yellow-500/20 to-yellow-600/10', query: 'physics' },
    { name: 'Chemistry', icon: <Microscope className="w-8 h-8" />, color: 'from-red-500/20 to-red-600/10', query: 'chemistry' },
  ];

  // Category Data with search queries
  const categories = [
    { name: 'Self Development', icon: <TrendingUp className="w-8 h-8" />, count: 45, query: 'self development' },
    { name: 'Academic', icon: <GraduationCap className="w-8 h-8" />, count: 32, query: 'academic' },
    { name: 'Technology', icon: <Code className="w-8 h-8" />, count: 28, query: 'technology' },
    { name: 'Business', icon: <Award className="w-8 h-8" />, count: 23, query: 'business' },
    { name: 'Arts & Design', icon: <Palette className="w-8 h-8" />, count: 18, query: 'arts design' },
    { name: 'Health & Wellness', icon: <Brain className="w-8 h-8" />, count: 15, query: 'health wellness' },
    { name: 'History', icon: <BookOpen className="w-8 h-8" />, count: 12, query: 'history' },
  ];

  // Fetch real active books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoadingBooks(true);
        setBooksError('');

        const response = await getUserBooks({
          page: 1,
          limit: 12,
        });

        if (response?.success) {
          const books = response.books || [];

          // Convert backend book data to BooksCard props
          const formattedBooks = books.map((book) => ({
            id: book._id,
            _id: book._id,

            title: book.title,
            author: book.authorName,
            authorName: book.authorName,

            thumbnail: book.thumbnail,
            description: book.description,

            category: book.category,
            subject: book.subject,

            rating: book.ratings?.average || 0,
            ratingCount: book.ratings?.count || 0,

            pages: book.pages || 0,

            isPremium: book.type === 'premium',
            type: book.type,

            views: book.views || 0,
            downloads: book.downloads || 0,

            edition: book.edition,
            publication: book.publication,

            features: book.features || [],
            about: book.about || {},

            premiumPlans: book.premiumPlans || [],

            language: book.language,
            order: book.order,

            status: book.status,

            createdAt: book.createdAt,
            updatedAt: book.updatedAt,
          }));

          setFeaturedBooks(formattedBooks);
        } else {
          setFeaturedBooks([]);
          setBooksError(response?.message || 'Failed to fetch books');
        }
      } catch (error) {
        console.error('Fetch user books error:', error);
        setFeaturedBooks([]);
        setBooksError(error?.message || 'Failed to fetch books');
      } finally {
        setLoadingBooks(false);
      }
    };

    fetchBooks();
  }, []);

  // Handle subject click - navigate to search with subject query
  const handleSubjectClick = (subjectName) => {
    navigate(`/search?q=${encodeURIComponent(subjectName)}`);
  };

  // Handle category click - navigate to search with category query
  const handleCategoryClick = (categoryName) => {
    navigate(`/search?q=${encodeURIComponent(categoryName)}`);
  };

  // Handle search all books
  const handleSearchAll = () => {
    navigate('/search');
  };

  return (
    <div className="min-h-screen bg-orange-100 dark:bg-[#0a0505] relative overflow-hidden transition-colors duration-300">
      {/* Background Gradient Effects - Dark mode only */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                      w-[800px] h-[800px] rounded-full 
                      bg-gradient-to-r from-[#8b0000]/20 via-[#4a0000]/10 to-transparent
                      blur-3xl animate-pulse dark:opacity-100 opacity-0 transition-opacity duration-300" />

        <div className="absolute top-0 right-0 w-[500px] h-[500px] 
                      bg-gradient-to-bl from-[#8b0000]/30 to-transparent 
                      rounded-full blur-3xl dark:opacity-100 opacity-0 transition-opacity duration-300" />

        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] 
                      bg-gradient-to-tr from-[#6b0000]/20 to-transparent 
                      rounded-full blur-3xl dark:opacity-100 opacity-0 transition-opacity duration-300" />

        <div className="absolute top-1/4 right-1/4 w-64 h-64 
                      bg-[#c8963e]/5 rounded-full blur-2xl dark:opacity-100 opacity-0 transition-opacity duration-300" />

        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 
                      bg-[#d4a85a]/5 rounded-full blur-2xl dark:opacity-100 opacity-0 transition-opacity duration-300" />

        {/* Light mode background effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                      w-[800px] h-[800px] rounded-full 
                      bg-gradient-to-r from-gray-100/50 via-gray-200/30 to-transparent
                      blur-3xl dark:opacity-0 opacity-100 transition-opacity duration-300" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="px-4 py-1.5 rounded-full bg-[#c8963e]/10 border border-[#c8963e]/20 
                           text-[#d4a85a] text-xs sm:text-sm font-semibold tracking-wider uppercase
                           backdrop-blur-sm inline-flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5" />
              EDURARY
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-2">
            <span className="bg-gradient-to-r from-[#d4a85a] via-[#e8c87a] to-[#d4a85a] 
                           bg-clip-text text-transparent">
              Books
            </span>
          </h1>

          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c8963e]/40" />
            <Compass className="w-5 h-5 text-[#c8963e]/60" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c8963e]/40" />
          </div>

          <p className="text-gray-600 dark:text-[#d4b8a0] text-lg sm:text-xl font-medium tracking-wide transition-colors duration-300">
            Explore All Books
          </p>

          {/* Search All Books Button */}
          <button
            onClick={handleSearchAll}
            className="mt-4 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#d97706] 
                       text-white font-medium transition-all duration-300 hover:scale-105 
                       shadow-lg shadow-[#f59e0b]/25 hover:shadow-[#f59e0b]/40
                       flex items-center gap-2 mx-auto"
          >
            <Search className="w-4 h-4" />
            Search All Books
          </button>
        </div>

        {/* Three Horizontal Card Sections */}
        <div className="space-y-6 mb-12">

          {/* Subjects */}
          <div className="bg-yellow-100 dark:bg-[#1a0a0a]/40 backdrop-blur-xl rounded-2xl p-6 
                        border border-gray-200 dark:border-[#c8963e]/10 
                        hover:border-gray-300 dark:hover:border-[#c8963e]/30
                        transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,150,62,0.05)]">

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-[#c8963e]/10 border border-[#c8963e]/20">
                <BookMarked className="w-5 h-5 text-[#d4a85a]" />
              </div>

              <h3 className="text-gray-800 dark:text-[#f5e6d3] font-bold text-lg transition-colors duration-300">
                Subjects
              </h3>

              <span className="text-gray-400 dark:text-[#8b6b5a] text-xs ml-2">
                ({subjects.length})
              </span>
            </div>

            <div className="flex flex-wrap gap-4">
              {subjects.map((subject, index) => (
                <div
                  key={index}
                  onClick={() => handleSubjectClick(subject.name)}
                  className={`flex flex-col items-center gap-2 px-5 py-4 rounded-xl min-w-[100px] cursor-pointer
                            bg-gradient-to-br ${subject.color}
                            border border-gray-200 dark:border-[#c8963e]/10
                            hover:border-gray-300 dark:hover:border-[#c8963e]/30
                            transition-all duration-300
                            hover:scale-105 hover:-translate-y-1
                            hover:shadow-[0_0_30px_rgba(200,150,62,0.15)]
                            group`}
                >
                  <div className="text-[#d4a85a] group-hover:scale-110 transition-transform duration-300">
                    {subject.icon}
                  </div>

                  <span className="text-gray-600 dark:text-[#d4b8a0] text-xs font-medium text-center leading-tight transition-colors duration-300 group-hover:text-[#f5e6d3]">
                    {subject.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="bg-yellow-100 dark:bg-[#1a0a0a]/40 backdrop-blur-xl rounded-2xl p-6 
                        border border-gray-200 dark:border-[#c8963e]/10 
                        hover:border-gray-300 dark:hover:border-[#c8963e]/30
                        transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,150,62,0.05)]">

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-[#c8963e]/10 border border-[#c8963e]/20">
                <Filter className="w-5 h-5 text-[#d4a85a]" />
              </div>

              <h3 className="text-gray-800 dark:text-[#f5e6d3] font-bold text-lg transition-colors duration-300">
                Categories
              </h3>

              <span className="text-gray-400 dark:text-[#8b6b5a] text-xs ml-2">
                ({categories.length})
              </span>
            </div>

            <div className="flex flex-wrap gap-4">
              {categories.map((category, index) => (
                <div
                  key={index}
                  onClick={() => handleCategoryClick(category.name)}
                  className="flex flex-col items-center gap-2 px-5 py-4 rounded-xl min-w-[100px] cursor-pointer
                            bg-gray-50/50 dark:bg-[#c8963e]/5 border border-gray-200 dark:border-[#c8963e]/10
                            hover:border-gray-300 dark:hover:border-[#c8963e]/30 
                            hover:bg-gray-100/50 dark:hover:bg-[#c8963e]/15
                            transition-all duration-300 
                            hover:scale-105 hover:-translate-y-1
                            hover:shadow-[0_0_30px_rgba(200,150,62,0.12)]
                            group"
                >
                  <div className="text-[#d4a85a] group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>

                  <span className="text-gray-600 dark:text-[#d4b8a0] text-xs font-medium text-center leading-tight transition-colors duration-300 group-hover:text-[#f5e6d3]">
                    {category.name}
                  </span>

                  <span className="text-gray-400 dark:text-[#8b6b5a] text-xs px-2 py-0.5 rounded-full 
                                 bg-gray-100 dark:bg-[#c8963e]/10 border border-gray-200 dark:border-[#c8963e]/10 
                                 transition-colors duration-300 group-hover:bg-[#c8963e]/20 group-hover:text-[#d4a85a]">
                    {category.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Explore Line */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="h-px flex-1 max-w-32 bg-gradient-to-r from-transparent to-[#c8963e]/20" />

          <span className="text-gray-400 dark:text-[#8b6b5a] text-sm font-medium tracking-wider uppercase flex items-center gap-2 transition-colors duration-300">
            <Compass className="w-4 h-4 text-[#c8963e]/40" />
            Explore in this way
            <Compass className="w-4 h-4 text-[#c8963e]/40" />
          </span>

          <div className="h-px flex-1 max-w-32 bg-gradient-to-l from-transparent to-[#c8963e]/20" />
        </div>

        {/* Books Grid/List */}
        <div>

          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-[#f5e6d3] transition-colors duration-300">
                Featured Books
              </h2>

              <span className="px-2 py-0.5 rounded-full text-xs bg-[#c8963e]/20 text-[#d4a85a] border border-[#c8963e]/20">
                {loadingBooks ? '...' : featuredBooks.length}
              </span>
            </div>

            {/* View Toggle */}
            <div className="flex gap-1 p-1 rounded-lg bg-gray-100/80 dark:bg-[#1a0a0a]/60 border border-gray-200 dark:border-[#c8963e]/10 transition-colors duration-300">

              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all duration-300
                          ${viewMode === 'grid'
                            ? 'bg-[#c8963e]/20 text-[#d4a85a]'
                            : 'text-gray-400 dark:text-[#8b6b5a] hover:text-gray-600 dark:hover:text-[#d4b8a0]'}`}
              >
                <Grid className="w-4 h-4" />
              </button>

              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all duration-300
                          ${viewMode === 'list'
                            ? 'bg-[#c8963e]/20 text-[#d4a85a]'
                            : 'text-gray-400 dark:text-[#8b6b5a] hover:text-gray-600 dark:hover:text-[#d4b8a0]'}`}
              >
                <List className="w-4 h-4" />
              </button>

            </div>
          </div>

          {/* Loading State */}
          {loadingBooks && (
            <div
              className={`grid ${viewMode === 'grid'
                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                : 'grid-cols-1'
                } gap-4 sm:gap-6`}
            >
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl bg-gray-100 dark:bg-[#1a0a0a]/50 border border-gray-200 dark:border-[#c8963e]/10 animate-pulse overflow-hidden"
                >
                  <div className="h-48 bg-gray-200 dark:bg-[#2a1515]" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-[#2a1515] rounded" />
                    <div className="h-3 bg-gray-200 dark:bg-[#2a1515] rounded w-2/3" />
                    <div className="h-3 bg-gray-200 dark:bg-[#2a1515] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!loadingBooks && booksError && (
            <div className="text-center py-12">
              <BookOpen className="w-10 h-10 mx-auto mb-3 text-gray-400 dark:text-[#8b6b5a]" />

              <p className="text-gray-600 dark:text-[#d4b8a0] mb-2">
                {booksError}
              </p>

              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2 rounded-lg
                           bg-[#c8963e]/10
                           border border-[#c8963e]/20
                           text-[#d4a85a]
                           hover:bg-[#c8963e]/20
                           transition-all duration-300"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Books Grid/List */}
          {!loadingBooks && !booksError && featuredBooks.length > 0 && (
            <div
              className={`grid ${viewMode === 'grid'
                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                : 'grid-cols-1'
                } gap-4 sm:gap-6`}
            >
              {featuredBooks.map((book) => (
                <BooksCard
                  key={book.id}
                  {...book}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}

          {/* No Books */}
          {!loadingBooks && !booksError && featuredBooks.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-[#8b6b5a]" />

              <h3 className="text-lg font-semibold text-gray-700 dark:text-[#f5e6d3] mb-2">
                No Books Available
              </h3>

              <p className="text-sm text-gray-500 dark:text-[#8b6b5a]">
                There are currently no active books available.
              </p>
            </div>
          )}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <MainButton text='Load More Books' />
        </div>

      </div>
    </div>
  );
};

export default BooksCollections;