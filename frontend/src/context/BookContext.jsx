import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { 
  getUserBooks,
} from '../services/book.service';
import toast from 'react-hot-toast';

// Create Context
const BookContext = createContext();

// Custom hook to use BookContext
export const useBooks = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
};

export const BookProvider = ({ children }) => {
  // State
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalBooks, setTotalBooks] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    subject: '',
    type: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Fetch all active books (public)
  const fetchBooks = useCallback(async (page = 1, limit = 12, filterParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit,
        ...filters,
        ...filterParams
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await getUserBooks(params);
      
      if (response?.success) {
        setBooks(response.books || []);
        setTotalBooks(response.total || 0);
        setCurrentPage(response.page || 1);
        setTotalPages(response.totalPages || 1);
        return response;
      } else {
        throw new Error(response?.message || 'Failed to fetch books');
      }
    } catch (error) {
      console.error('Fetch books error:', error);
      setError(error.message);
      toast.error(error.message || 'Failed to fetch books');
      return null;
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Get book from local state by ID (faster than API call)
  const getBookFromState = useCallback((id) => {
    return books.find(b => b._id === id) || null;
  }, [books]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      subject: '',
      type: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  }, []);

  // Clear all books data
  const clearBooks = useCallback(() => {
    setBooks([]);
    setTotalBooks(0);
    setCurrentPage(1);
    setTotalPages(1);
    setError(null);
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchBooks();
  }, []);

  // Refetch when filters change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooks(1, 12, filters);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  // Context value - Public only
  const value = {
    // State
    books,
    loading,
    error,
    totalBooks,
    currentPage,
    totalPages,
    filters,
    
    // Actions
    fetchBooks,
    getBookFromState,
    updateFilters,
    resetFilters,
    clearBooks,
    
    // Helpers
    hasBooks: books.length > 0,
    isEmpty: books.length === 0 && !loading,
  };

  return (
    <BookContext.Provider value={value}>
      {children}
    </BookContext.Provider>
  );
};

export default BookContext;