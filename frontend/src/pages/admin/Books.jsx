import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Book, 
  Clock, 
  CheckCircle, 
  Crown, 
  Star
} from 'lucide-react';
import BooksCard from '../../components/admin/BooksCard';
import CreateBooks from '../../components/admin/CreateBooks';
import UpdateBooks from '../../components/admin/UpdateBooks';
import { getAllBooks, deleteBook, toggleBookStatus } from '../../services/book.service';
import toast from 'react-hot-toast';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    free: 0,
    premium: 0
  });
  const [animatedStats, setAnimatedStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    free: 0,
    premium: 0
  });

  // Fetch books from API
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await getAllBooks();
      if (response?.success) {
        const booksData = response.books || [];
        setBooks(booksData);
        updateStats(booksData);
      } else {
        toast.error(response?.message || 'Failed to fetch books');
        setBooks([]);
        updateStats([]);
      }
    } catch (error) {
      console.error('Fetch books error:', error);
      toast.error(error.message || 'Failed to fetch books');
      setBooks([]);
      updateStats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const updateStats = (booksData) => {
    // Ensure booksData is always an array
    const safeBooksData = Array.isArray(booksData) ? booksData : [];
    
    const newStats = {
      total: safeBooksData.length,
      active: safeBooksData.filter(b => b && b.status === 'active').length,
      pending: safeBooksData.filter(b => b && b.status === 'pending').length,
      free: safeBooksData.filter(b => b && b.type === 'free').length,
      premium: safeBooksData.filter(b => b && b.type === 'premium').length
    };
    setStats(newStats);
    animateStats(newStats);
  };

  const animateStats = (targetStats) => {
    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;
    let currentStep = 0;

    const startStats = {
      total: 0,
      active: 0,
      pending: 0,
      free: 0,
      premium: 0
    };

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedStats({
        total: Math.round(startStats.total + (targetStats.total - startStats.total) * progress),
        active: Math.round(startStats.active + (targetStats.active - startStats.active) * progress),
        pending: Math.round(startStats.pending + (targetStats.pending - startStats.pending) * progress),
        free: Math.round(startStats.free + (targetStats.free - startStats.free) * progress),
        premium: Math.round(startStats.premium + (targetStats.premium - startStats.premium) * progress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedStats(targetStats);
      }
    }, interval);
  };

  const handleCreateBook = (responseData) => {
    // Extract the book from the response
    const newBook = responseData?.book || responseData;
    if (newBook && newBook._id) {
      const updatedBooks = [...books, newBook];
      setBooks(updatedBooks);
      updateStats(updatedBooks);
      toast.success('Book created successfully!');
    } else {
      // If the response doesn't contain a book, refresh the list
      fetchBooks();
    }
  };

  const handleUpdateBook = (responseData) => {
    // Extract the book from the response
    const updatedBook = responseData?.book || responseData;
    if (updatedBook && updatedBook._id) {
      const updatedBooks = books.map(book => 
        book && book._id === updatedBook._id ? updatedBook : book
      );
      setBooks(updatedBooks);
      updateStats(updatedBooks);
      toast.success('Book updated successfully!');
    } else {
      // If the response doesn't contain a book, refresh the list
      fetchBooks();
    }
  };

  const handleToggleStatus = async (bookId, newStatus) => {
    try {
      const response = await toggleBookStatus(bookId, newStatus);
      if (response?.success) {
        const updatedBooks = books.map(book => 
          book && book._id === bookId ? { ...book, status: newStatus } : book
        );
        setBooks(updatedBooks);
        updateStats(updatedBooks);
        toast.success(`Book ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      } else {
        toast.error(response?.message || 'Failed to toggle book status');
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error(error.message || 'Failed to toggle book status');
    }
  };

  const handleDeleteClick = (bookId) => {
    setBookToDelete(bookId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!bookToDelete) return;
    
    try {
      const response = await deleteBook(bookToDelete);
      if (response?.success) {
        toast.success('Book deleted successfully');
        const updatedBooks = books.filter(book => book && book._id !== bookToDelete);
        setBooks(updatedBooks);
        updateStats(updatedBooks);
        setShowDeleteConfirm(false);
        setBookToDelete(null);
      } else {
        toast.error(response?.message || 'Failed to delete book');
      }
    } catch (error) {
      console.error('Delete book error:', error);
      toast.error(error.message || 'Failed to delete book');
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setBookToDelete(null);
  };

  const filteredBooks = books.filter(book => {
    if (!book) return false;
    const matchesSearch = (book.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (book.authorName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
      book.type === filterType || 
      book.status === filterType;
    return matchesSearch && matchesFilter;
  });

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="p-4 rounded-xl bg-white dark:bg-black border border-green-200/30 dark:border-green-800/30 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {animatedStats[value] || 0}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-green-50 dark:bg-black">
      {/* Header */}
      <div className="bg-white dark:bg-black border-b border-green-200/30 dark:border-green-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-600 to-green-700 dark:from-green-500 dark:to-green-600 rounded-xl shadow-lg shadow-green-500/30 dark:shadow-green-400/20">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Edurary Book Library Management
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your book collection efficiently
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 dark:from-green-500 dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 text-white rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 dark:hover:shadow-green-400/20 font-medium"
            >
              <Plus className="w-4 h-4" />
              Create Book
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard 
            icon={Book} 
            label="Total Books" 
            value="total"
            color="bg-gradient-to-br from-green-600 to-green-700"
          />
          <StatCard 
            icon={CheckCircle} 
            label="Active" 
            value="active"
            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
          <StatCard 
            icon={Clock} 
            label="Pending" 
            value="pending"
            color="bg-gradient-to-br from-yellow-500 to-yellow-600"
          />
          <StatCard 
            icon={Star} 
            label="Free" 
            value="free"
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard 
            icon={Crown} 
            label="Premium" 
            value="premium"
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-black rounded-xl border border-green-200/30 dark:border-green-800/30 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search books by title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-green-50 dark:bg-black border border-green-200/30 dark:border-green-800/30 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  filterType === 'all'
                    ? 'bg-green-600 text-white dark:bg-green-500'
                    : 'bg-green-50 dark:bg-black text-gray-600 dark:text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200/30 dark:border-green-800/30'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('active')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  filterType === 'active'
                    ? 'bg-green-600 text-white dark:bg-green-500'
                    : 'bg-green-50 dark:bg-black text-gray-600 dark:text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200/30 dark:border-green-800/30'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterType('pending')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  filterType === 'pending'
                    ? 'bg-green-600 text-white dark:bg-green-500'
                    : 'bg-green-50 dark:bg-black text-gray-600 dark:text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200/30 dark:border-green-800/30'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterType('free')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  filterType === 'free'
                    ? 'bg-green-600 text-white dark:bg-green-500'
                    : 'bg-green-50 dark:bg-black text-gray-600 dark:text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200/30 dark:border-green-800/30'
                }`}
              >
                Free
              </button>
              <button
                onClick={() => setFilterType('premium')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  filterType === 'premium'
                    ? 'bg-green-600 text-white dark:bg-green-500'
                    : 'bg-green-50 dark:bg-black text-gray-600 dark:text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200/30 dark:border-green-800/30'
                }`}
              >
                Premium
              </button>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent dark:border-green-400"></div>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-black rounded-xl border border-green-200/30 dark:border-green-800/30">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No books found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <BooksCard
                key={book._id}
                book={book}
                onUpdate={(book) => {
                  setSelectedBook(book);
                  setShowUpdateModal(true);
                }}
                onDelete={handleDeleteClick}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-black rounded-xl p-6 max-w-md w-full border border-red-500/20 shadow-2xl shadow-red-500/10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Delete Book
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete this book? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateBooks
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateBook}
        />
      )}

      {showUpdateModal && selectedBook && (
        <UpdateBooks
          book={selectedBook}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedBook(null);
          }}
          onSuccess={handleUpdateBook}
        />
      )}
    </div>
  );
};

export default Books;