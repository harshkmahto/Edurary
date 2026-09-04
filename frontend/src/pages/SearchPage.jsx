import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  X,
  SlidersHorizontal,
  TrendingUp,
  Star,
  Clock,
  Grid3x3,
  List,
  ChevronDown,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import analyticsService from '../services/analytics.service';
import BookCourseCard from '../components/extra/BookCourseCard';
import toast from 'react-hot-toast';
import searchIcon from '../assets/serch.gif';

const SearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [itemType, setItemType] = useState('all');
  const [priceType, setPriceType] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }

    fetchFilters();
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const fetchFilters = async () => {
    try {
      setCategories(['Technology', 'Science', 'Arts', 'Business', 'Health', 'Education']);
      setSubjects(['Programming', 'Data Science', 'Design', 'Marketing', 'Finance', 'Language']);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  // Auto-search with debounce
  useEffect(() => {
    if (searchQuery.length >= 2) {
      setIsTyping(true);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(searchQuery);
        setIsTyping(false);
      }, 500);
    } else if (searchQuery.length === 0) {
      setHasSearched(false);
      setResults([]);
    }
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const performSearch = async (query) => {
    if (!query || query.trim().length < 2) {
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      
      const params = {
        query: query.trim(),
        itemType: itemType,
        priceType: priceType,
        sortBy: sortBy === 'relevance' ? 'popular' : sortBy,
        category: filterCategory,
        subject: filterSubject,
        page: 1,
        limit: 30
      };

      const response = await analyticsService.searchItems(params);
      if (response.success) {
        setResults(response.data.results || []);
        navigate(`/search?q=${encodeURIComponent(query)}`, { replace: true });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error(error.message || 'Failed to search');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      performSearch(searchQuery);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setResults([]);
    setHasSearched(false);
    setIsTyping(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    navigate('/search', { replace: true });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  const handleFilterChange = (newItemType, newPriceType) => {
    let changed = false;
    
    if (newItemType !== undefined && newItemType !== itemType) {
      setItemType(newItemType);
      changed = true;
    }
    
    if (newPriceType !== undefined && newPriceType !== priceType) {
      setPriceType(newPriceType);
      changed = true;
    }
    
    if (changed && searchQuery.trim().length >= 2) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        setIsTyping(false);
      }
      performSearch(searchQuery);
    }
  };

  const itemTypeOptions = [
    { value: 'all', label: 'All' },
    { value: 'books', label: 'Books' },
    { value: 'courses', label: 'Courses' }
  ];

  const priceTypeOptions = [
    { value: 'all', label: 'All' },
    { value: 'free', label: 'Free' },
    { value: 'premium', label: 'Premium' }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance', icon: Sparkles },
    { value: 'popular', label: 'Most Viewed', icon: TrendingUp },
    { value: 'rating', label: 'Top Rated', icon: Star },
    { value: 'newest', label: 'Newest', icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Search Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-[#f59e0b]/20 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="flex items-center gap-3">
            <div className="relative flex-1 group">
              <img 
                src={searchIcon} 
                alt="Search" 
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 transition-all duration-300 ${
                  searchQuery ? 'opacity-100' : 'opacity-60'
                }`}
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search for books, courses, topics..."
                className="w-full pl-14 pr-12 py-3.5 rounded-2xl bg-gray-100/50 dark:bg-[#1a1a1a]/50 border-2 transition-all duration-300 text-lg focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                  border-gray-200/50 dark:border-[#f59e0b]/20
                  focus:border-[#f59e0b] dark:focus:border-[#fbbf24]
                  focus:shadow-[0_0_30px_rgba(245,158,11,0.15)] dark:focus:shadow-[0_0_30px_rgba(251,191,36,0.1)]
                  group-hover:border-[#f59e0b]/50 dark:group-hover:border-[#fbbf24]/50
                "
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-200/50 dark:hover:bg-[#f59e0b]/10 text-gray-400 dark:text-gray-500 transition-all duration-300 hover:scale-110 hover:text-[#f59e0b]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {isTyping && (
                <div className="absolute right-14 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-[#f59e0b] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || searchQuery.trim().length < 2}
              className="px-6 py-3.5 bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#d97706] hover:to-[#b45309] text-white rounded-2xl font-medium transition-all duration-300 shadow-lg shadow-[#f59e0b]/25 hover:shadow-[#f59e0b]/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                  <span className="hidden sm:inline">Search</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className="flex items-center gap-2">
              {itemTypeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange(option.value, undefined)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    itemType === option.value
                      ? 'bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white shadow-lg shadow-[#f59e0b]/25'
                      : 'bg-gray-100/50 dark:bg-[#1a1a1a]/50 text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-[#f59e0b]/10 hover:text-[#f59e0b]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 border-l border-gray-200/50 dark:border-[#f59e0b]/20 pl-3">
              {priceTypeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange(undefined, option.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                    priceType === option.value
                      ? 'bg-[#f59e0b] text-white shadow-lg shadow-[#f59e0b]/25'
                      : 'bg-gray-100/50 dark:bg-[#1a1a1a]/50 text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-[#f59e0b]/10 hover:text-[#f59e0b]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                  showFilters 
                    ? 'bg-[#f59e0b]/10 text-[#f59e0b]' 
                    : 'hover:bg-gray-100/50 dark:hover:bg-[#1a1a1a]/50 text-gray-600 dark:text-gray-400 hover:text-[#f59e0b]'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              <div className="relative">
                <button
                  onClick={() => {
                    const options = document.getElementById('sortDropdown');
                    options?.classList.toggle('hidden');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100/50 dark:bg-[#1a1a1a]/50 text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-[#f59e0b]/10 transition-all duration-300 text-sm hover:text-[#f59e0b]"
                >
                  <span>{sortOptions.find(s => s.value === sortBy)?.label || 'Sort'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${
                    document.getElementById('sortDropdown')?.classList.contains('hidden') ? '' : 'rotate-180'
                  }`} />
                </button>
                <div
                  id="sortDropdown"
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl border border-gray-200/50 dark:border-[#f59e0b]/20 py-1 hidden z-20 animate-slide-down"
                >
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        if (searchQuery.trim().length >= 2) {
                          if (searchTimeoutRef.current) {
                            clearTimeout(searchTimeoutRef.current);
                            setIsTyping(false);
                          }
                          performSearch(searchQuery);
                        }
                        document.getElementById('sortDropdown')?.classList.add('hidden');
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-all duration-200 hover:pl-6 ${
                        sortBy === option.value
                          ? 'text-[#f59e0b] bg-[#f59e0b]/5'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-[#f59e0b]/10 hover:text-[#f59e0b]'
                      }`}
                    >
                      <option.icon className="w-3.5 h-3.5" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1 bg-gray-100/50 dark:bg-[#1a1a1a]/50 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid' ? 'bg-[#f59e0b] text-white shadow-lg shadow-[#f59e0b]/25' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-[#f59e0b]/10'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all duration-300 ${
                    viewMode === 'list' ? 'bg-[#f59e0b] text-white shadow-lg shadow-[#f59e0b]/25' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-[#f59e0b]/10'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-3 p-4 bg-gray-50/50 dark:bg-[#1a1a1a]/30 rounded-2xl border border-gray-200/50 dark:border-[#f59e0b]/20 animate-slide-down">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => {
                      setFilterCategory(e.target.value);
                      if (searchQuery.trim().length >= 2) {
                        if (searchTimeoutRef.current) {
                          clearTimeout(searchTimeoutRef.current);
                          setIsTyping(false);
                        }
                        performSearch(searchQuery);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200/50 dark:border-[#f59e0b]/20 focus:border-[#f59e0b] focus:outline-none text-gray-900 dark:text-white transition-all duration-300 focus:shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    Subject
                  </label>
                  <select
                    value={filterSubject}
                    onChange={(e) => {
                      setFilterSubject(e.target.value);
                      if (searchQuery.trim().length >= 2) {
                        if (searchTimeoutRef.current) {
                          clearTimeout(searchTimeoutRef.current);
                          setIsTyping(false);
                        }
                        performSearch(searchQuery);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200/50 dark:border-[#f59e0b]/20 focus:border-[#f59e0b] focus:outline-none text-gray-900 dark:text-white transition-all duration-300 focus:shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={() => {
                      setFilterCategory('');
                      setFilterSubject('');
                      if (searchQuery.trim().length >= 2) {
                        if (searchTimeoutRef.current) {
                          clearTimeout(searchTimeoutRef.current);
                          setIsTyping(false);
                        }
                        performSearch(searchQuery);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-gray-200/50 dark:bg-[#1a1a1a]/50 text-gray-600 dark:text-gray-400 hover:bg-gray-300/50 dark:hover:bg-[#f59e0b]/10 transition-all duration-300 text-sm hover:text-[#f59e0b]"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => {
                      if (searchQuery.trim().length >= 2) {
                        if (searchTimeoutRef.current) {
                          clearTimeout(searchTimeoutRef.current);
                          setIsTyping(false);
                        }
                        performSearch(searchQuery);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white hover:from-[#d97706] hover:to-[#b45309] transition-all duration-300 text-sm flex-1 shadow-lg shadow-[#f59e0b]/25 hover:shadow-[#f59e0b]/40"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Area */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {!hasSearched ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="p-6 rounded-full bg-gradient-to-br from-[#f59e0b]/10 to-[#d97706]/10 dark:from-[#f59e0b]/5 dark:to-[#d97706]/5 mb-8 transition-all duration-500 hover:scale-110 hover:rotate-12">
              <img 
                src={searchIcon} 
                alt="Search" 
                className="w-40 h-40 object-contain"
              />
            </div>
            <h3 className="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-3">
              Search for Books & Courses
            </h3>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#f59e0b]/20 border-t-[#f59e0b] rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#d97706]/20 border-t-[#d97706] rounded-full animate-spin" style={{ animationDuration: '0.6s' }} />
              </div>
            </div>
            <p className="mt-6 text-gray-500 dark:text-gray-400 animate-pulse">Searching...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="p-6 rounded-full bg-gray-100/50 dark:bg-[#1a1a1a]/50 mb-4 transition-all duration-300 hover:scale-110">
              <Search className="w-12 h-12 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No results found for "<span className="text-[#f59e0b]">{searchQuery}</span>"
            </h3>
            <p className="text-gray-400 dark:text-gray-500 max-w-md">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <button
              onClick={handleClear}
              className="mt-4 px-6 py-2 bg-[#f59e0b]/10 hover:bg-[#f59e0b]/20 text-[#f59e0b] rounded-xl transition-all duration-300 hover:scale-105"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Found <span className="font-semibold text-[#f59e0b]">{results.length}</span> results
                {itemType !== 'all' && ` in ${itemType}`}
                {priceType !== 'all' && ` (${priceType})`}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Sorted by {sortOptions.find(s => s.value === sortBy)?.label || 'Relevance'}
              </p>
            </div>

            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
              : 'space-y-3'
            }>
              {results.map((item, index) => (
                <BookCourseCard 
                  key={item._id || index} 
                  item={item} 
                  viewMode={viewMode}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;