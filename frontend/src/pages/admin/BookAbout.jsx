import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  User, 
  Calendar, 
  Eye, 
  Download, 
  Crown, 
  Star, 
  FileText,
  Info,
  Book,
  ThumbsUp,
  Layers,
  Globe,
  Hash,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Maximize2,
  Minimize2,
  Users,
  MessageSquare,
  Clock,
  Heart,
  Loader2,
  Check,
  Folder,
  X
} from 'lucide-react';
import { getBookById } from '../../services/book.service';
import bookService from '../../services/book.service';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/authContext';

const BookAbout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [totalPages, setTotalPages] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [ratingsStats, setRatingsStats] = useState(null);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const pdfContainerRef = useRef(null);
  const iframeRef = useRef(null);

  // Save related states
  const [isSaved, setIsSaved] = useState(false);
  const [savedLists, setSavedLists] = useState([]);
  const [userLists, setUserLists] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedLists, setSelectedLists] = useState([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [totalSaves, setTotalSaves] = useState(0);

  useEffect(() => {
    fetchBook();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'ratings' && book) {
      fetchRatings();
    }
  }, [activeTab, book]);

  useEffect(() => {
    if (showSaveModal) {
      fetchUserLists();
    }
  }, [showSaveModal]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const response = await getBookById(id);
      if (response?.success) {
        setBook(response.book);
        setTotalSaves(response.book.totalSaves || 0);
        if (response.book.content) {
          getPDFPageCount(response.book.content);
        }
        await checkBookSaveStatus();
      } else {
        toast.error(response?.message || 'Failed to fetch book');
        navigate('/admin/books');
      }
    } catch (error) {
      console.error('Fetch book error:', error);
      toast.error('Failed to fetch book');
      navigate('/admin/books');
    } finally {
      setLoading(false);
    }
  };

  const checkBookSaveStatus = async () => {
    try {
      const response = await bookService.checkBookSaved(id);
      if (response.success) {
        setIsSaved(response.isSaved);
        setSavedLists(response.saves || []);
        setSelectedLists(response.saves.map(save => save.listId));
      }
    } catch (error) {
      console.error('Error checking save status:', error);
    }
  };

  const fetchUserLists = async () => {
    try {
      const response = await bookService.getUserLists();
      if (response.success) {
        setUserLists(response.lists);
        const savedListIds = savedLists.map(save => save.listId);
        setSelectedLists(savedListIds);
      }
    } catch (error) {
      console.error('Error fetching user lists:', error);
    }
  };

  const handleToggleListSelection = (listId) => {
    setSelectedLists(prev => {
      if (prev.includes(listId)) {
        return prev.filter(id => id !== listId);
      } else {
        return [...prev, listId];
      }
    });
  };

  const handleSaveBook = async () => {
    try {
      setSaveLoading(true);
      
      const currentSavedListIds = savedLists.map(save => save.listId);
      const listsToAdd = selectedLists.filter(id => !currentSavedListIds.includes(id));
      const listsToRemove = currentSavedListIds.filter(id => !selectedLists.includes(id));

      for (const listId of listsToAdd) {
        await bookService.saveBookToList(id, { listId, notes: '' });
      }

      for (const listId of listsToRemove) {
        await bookService.removeBookFromList(id, { listId });
      }

      setIsSaved(selectedLists.length > 0);
      
      if (listsToAdd.length > 0 && listsToRemove.length === 0 && !isSaved) {
        setTotalSaves(prev => prev + 1);
      } else if (listsToRemove.length > 0 && listsToAdd.length === 0 && isSaved) {
        setTotalSaves(prev => Math.max(0, prev - 1));
      }

      await checkBookSaveStatus();
      setShowSaveModal(false);
      toast.success('Book saved successfully');
      
    } catch (error) {
      console.error('Error saving book:', error);
      toast.error(error.message || 'Failed to save book');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleRemoveAllSaves = async () => {
    if (!confirm('Remove this book from all your lists?')) return;
    
    try {
      setSaveLoading(true);
      
      for (const save of savedLists) {
        await bookService.removeBookFromList(id, { listId: save.listId });
      }
      
      setIsSaved(false);
      setSavedLists([]);
      setSelectedLists([]);
      setTotalSaves(prev => Math.max(0, prev - 1));
      
      await checkBookSaveStatus();
      setShowSaveModal(false);
      toast.success('Book removed from all lists');
      
    } catch (error) {
      console.error('Error removing book from all lists:', error);
      toast.error(error.message || 'Failed to remove book from lists');
    } finally {
      setSaveLoading(false);
    }
  };

  const fetchRatings = async () => {
    try {
      setRatingsLoading(true);
      const response = await bookService.getBookRatingStats(id);
      if (response?.success) {
        setRatings(response.ratings || []);
        setRatingsStats({
          averageRating: response.averageRating,
          totalRatings: response.totalRatings,
          distribution: response.distribution,
          percentage: response.percentage
        });
      }
    } catch (error) {
      console.error('Fetch ratings error:', error);
      toast.error('Failed to fetch ratings');
    } finally {
      setRatingsLoading(false);
    }
  };

  const getPDFPageCount = (pdfUrl) => {
    if (window.pdfjsLib) {
      window.pdfjsLib.getDocument(pdfUrl).promise.then((pdf) => {
        setTotalPages(pdf.numPages);
      }).catch(() => {
        const urlParams = new URLSearchParams(pdfUrl.split('?')[1]);
        const pageCount = urlParams.get('pageCount');
        if (pageCount) {
          setTotalPages(parseInt(pageCount));
        } else {
          setTotalPages(3);
        }
      });
    } else {
      setTotalPages(3);
    }
  };

  const handleIframeLoad = () => {
    try {
      if (iframeRef.current) {
        // Some PDF viewers expose the page count
      }
    } catch (error) {
      console.log('Could not get page count from iframe');
    }
  };

  const handleZoomIn = () => {
    const container = pdfContainerRef.current;
    if (container) {
      const currentWidth = container.offsetWidth;
      const newWidth = currentWidth * 1.1;
      container.style.width = `${Math.min(newWidth, 1200)}px`;
    }
  };

  const handleZoomOut = () => {
    const container = pdfContainerRef.current;
    if (container) {
      const currentWidth = container.offsetWidth;
      const newWidth = currentWidth * 0.9;
      container.style.width = `${Math.max(newWidth, 300)}px`;
    }
  };

  const handleResetZoom = () => {
    const container = pdfContainerRef.current;
    if (container) {
      container.style.width = '100%';
    }
  };

  const handleViewPDF = () => {
    if (book?.content) {
      window.open(book.content, '_blank');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
      />
    ));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
      '200, 150, 62';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent dark:border-green-400"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-green-50 dark:bg-black flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Book not found</p>
      </div>
    );
  }

  const tabs = [
    { id: 'about', label: 'About', icon: Info },
    { id: 'content', label: 'Content', icon: Book },
    { id: 'ratings', label: 'Ratings', icon: ThumbsUp },
  ];

  return (
    <div className="min-h-screen bg-green-50 dark:bg-black">
      {/* Header */}
      <div className="bg-white dark:bg-black border-b border-green-200/30 dark:border-green-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/admin/books')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Books
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSaveModal(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isSaved 
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="w-4 h-4" />
                    <span>Saved ({totalSaves})</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>Save ({totalSaves})</span>
                  </>
                )}
              </button>
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${book.type === 'premium' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
                {book.type === 'premium' ? (
                  <span className="flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Premium
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" /> Free
                  </span>
                )}
              </span>
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                book.status === 'active' 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>
                {book.status?.charAt(0).toUpperCase() + book.status?.slice(1) || 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Book Header Info */}
        <div className="bg-white dark:bg-black rounded-xl border border-green-200/30 dark:border-green-800/30 overflow-hidden mb-6">
          <div className="md:flex p-6">
            <div className="md:w-1/4 flex-shrink-0">
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30">
                {book.thumbnail ? (
                  <img
                    src={book.thumbnail}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-600" />
                  </div>
                )}
              </div>
            </div>

            <div className="md:w-3/4 md:pl-6 mt-4 md:mt-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {book.title}
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{book.authorName || 'Unknown Author'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span>{book.pages || 0} pages</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Layers className="w-4 h-4 flex-shrink-0" />
                  <span>{book.category || 'General'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Hash className="w-4 h-4 flex-shrink-0" />
                  <span>{book.subject || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>Added: {new Date(book.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{book.views || 0} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span>{book.downloads || 0} downloads</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bookmark className="w-4 h-4 text-amber-500" />
                    <span>{totalSaves} saves</span>
                  </div>
                </div>
              </div>

              {book.type === 'premium' && book.premiumPlans?.length > 0 && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Available on:</span>
                    {book.premiumPlans.map((plan) => (
                      <span
                        key={plan}
                        className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs font-medium capitalize"
                      >
                        {plan}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-black rounded-xl border border-green-200/30 dark:border-green-800/30 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-green-200/30 dark:border-green-800/30 px-4">
            <div className="flex gap-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-3 px-1 text-sm font-medium transition-all duration-300 relative ${
                      isActive 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 dark:bg-green-400 rounded-full animate-slide-in" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                    Description
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {book.description || 'No description available'}
                  </p>
                </div>

                {book.features?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Star className="w-5 h-5 text-green-600 dark:text-green-400" />
                      Features
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {book.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                          <span className="text-green-500 dark:text-green-400 mt-1">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {book.edition && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Bookmark className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Edition</span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{book.edition}</p>
                      </div>
                    </div>
                  )}
                  {book.publication && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Globe className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Publication</span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{book.publication}</p>
                      </div>
                    </div>
                  )}
                  {book.language && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Globe className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Language</span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{book.language}</p>
                      </div>
                    </div>
                  )}
                  {book.pages && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <FileText className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Pages</span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{book.pages}</p>
                      </div>
                    </div>
                  )}
                </div>

                {book.about && Object.keys(book.about).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Info className="w-5 h-5 text-green-600 dark:text-green-400" />
                      Additional Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(book.about).map(([key, value]) => (
                        <div key={key} className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                          <span className="font-medium text-gray-700 dark:text-gray-300 capitalize text-sm min-w-[80px]">{key}:</span>
                          <span className="text-gray-600 dark:text-gray-400 text-sm">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Book className="w-5 h-5 text-green-600 dark:text-green-400" />
                    Book Content
                  </h3>
                  <div className="flex items-center gap-3">
                    {totalPages > 0 && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {totalPages} pages
                      </span>
                    )}
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-400"
                      title="Toggle Fullscreen"
                    >
                      {isFullscreen ? (
                        <Minimize2 className="w-4 h-4" />
                      ) : (
                        <Maximize2 className="w-4 h-4" />
                      )}
                    </button>
                    {book.content && (
                      <button
                        onClick={handleViewPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-green-500/30"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View PDF
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        PDF Viewer
                      </span>
                      {totalPages > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({totalPages} pages)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleZoomOut}
                        className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200 text-gray-700 dark:text-gray-300"
                        title="Zoom Out"
                      >
                        <span className="text-sm font-bold">-</span>
                      </button>
                      <button
                        onClick={handleResetZoom}
                        className="px-3 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all duration-200"
                      >
                        Reset
                      </button>
                      <button
                        onClick={handleZoomIn}
                        className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200 text-gray-700 dark:text-gray-300"
                        title="Zoom In"
                      >
                        <span className="text-sm font-bold">+</span>
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <div 
                      ref={pdfContainerRef}
                      className="pdf-scroll-container"
                      style={{
                        height: isFullscreen ? 'calc(100vh - 200px)' : '600px',
                        overflow: 'auto',
                        background: 'repeating-linear-gradient(45deg, #f0f0f0 0px, #f0f0f0 2px, #e8e8e8 2px, #e8e8e8 4px)',
                        backgroundAttachment: 'fixed',
                        padding: '20px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                      }}
                    >
                      {book.content ? (
                        <div 
                          className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg overflow-hidden transition-all duration-300"
                          style={{
                            width: isFullscreen ? '90%' : '100%',
                            maxWidth: '900px',
                            minHeight: isFullscreen ? '90vh' : '550px',
                          }}
                        >
                          <iframe
                            ref={iframeRef}
                            src={`${book.content}`}
                            title={`${book.title}`}
                            className="w-full h-full border-0"
                            style={{ 
                              background: 'white',
                              minHeight: isFullscreen ? '90vh' : '550px',
                              height: '100%'
                            }}
                            onLoad={handleIframeLoad}
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                          <div className="text-center">
                            <FileText className="w-16 h-16 mx-auto mb-3" />
                            <p>No content available</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ratings Tab */}
            {activeTab === 'ratings' && (
              <div className="animate-fade-in">
                {ratingsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent dark:border-green-400"></div>
                  </div>
                ) : (
                  <>
                    {/* Rating Summary */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 mb-6 border border-green-200/30 dark:border-green-800/30">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-gray-900 dark:text-white">
                              {ratingsStats?.averageRating?.toFixed(1) || '0.0'}
                            </div>
                            <div className="flex items-center justify-center gap-1 mt-1">
                              {renderStars(Math.round(ratingsStats?.averageRating || 0))}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {ratingsStats?.totalRatings || 0} {ratingsStats?.totalRatings === 1 ? 'rating' : 'ratings'}
                            </div>
                          </div>
                          <div className="hidden md:block w-px h-16 bg-gray-300 dark:bg-gray-700"></div>
                          <div className="flex-1 min-w-[200px]">
                            {[5, 4, 3, 2, 1].map((star) => {
                              const count = ratingsStats?.distribution?.[star] || 0;
                              const total = ratingsStats?.totalRatings || 0;
                              const percentage = total > 0 ? (count / total) * 100 : 0;
                              
                              return (
                                <div key={star} className="flex items-center gap-2 text-sm">
                                  <span className="text-gray-600 dark:text-gray-400 w-8">{star}★</span>
                                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-gray-500 dark:text-gray-400 text-xs w-12 text-right">
                                    {count}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{ratingsStats?.totalRatings || 0} users</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>Reviews</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ratings List */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                          User Reviews
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {ratings.length} reviews
                        </span>
                      </div>

                      {ratings.length > 0 ? (
                        <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3 ratings-scroll">
                          {ratings.map((rating, index) => (
                            <div 
                              key={rating._id || index}
                              className="bg-gray-50 dark:bg-black rounded-lg p-4 border border-gray-200 dark:border-green-800 hover:border-green-200 dark:hover:border-green-500 transition-all duration-200"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                    {rating.userId?.name?.charAt(0)?.toUpperCase() || 'U'}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {rating.userId?.name || 'Anonymous User'}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-0.5">
                                        {renderStars(rating.rating)}
                                      </div>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {rating.rating}.0
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatDate(rating.createdAt)}</span>
                                </div>
                              </div>
                              {rating.review && (
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 pl-13">
                                  {rating.review}
                                </p>
                              )}
                              {rating.userId?.email && (
                                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 pl-13">
                                  {rating.userId.email}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ThumbsUp className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                          </div>
                          <h4 className="text-gray-600 dark:text-gray-400 font-medium">No Ratings Yet</h4>
                          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                            This book hasn't received any ratings yet.
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save/Unsave Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-green-200/30 dark:border-green-800/30 max-w-md w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-green-200/30 dark:border-green-800/30">
              <h3 className="text-gray-900 dark:text-white text-xl font-semibold flex items-center gap-2">
                <Heart className="w-5 h-5 text-green-600 dark:text-green-400" />
                Save Book
              </h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Select lists to save "{book.title}" to:
              </p>

              {userLists.length === 0 ? (
                <div className="text-center py-8">
                  <Folder className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm">No lists found</p>
                  <button
                    onClick={() => {
                      setShowSaveModal(false);
                      navigate('/save');
                    }}
                    className="mt-3 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm transition-colors"
                  >
                    Create a list →
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {userLists.map((list) => {
                    const isSelected = selectedLists.includes(list._id);
                    const listColor = list.color || '#22c55e';
                    
                    return (
                      <div
                        key={list._id}
                        onClick={() => handleToggleListSelection(list._id)}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-300 border ${
                          isSelected
                            ? `border-[${listColor}]/50`
                            : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700'
                        }`}
                        style={{
                          backgroundColor: isSelected 
                            ? `rgba(${hexToRgb(listColor)}, 0.1)`
                            : 'transparent'
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{list.icon || '📚'}</span>
                          <div>
                            <p className="text-gray-900 dark:text-white font-medium">
                              {list.name}
                              {list.isDefault && (
                                <Star className="w-3 h-3 text-amber-400 inline ml-1" />
                              )}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">
                              {list.bookCount || 0} books
                            </p>
                          </div>
                        </div>
                        <div 
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? `border-[${listColor}] bg-[${listColor}]`
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {isSelected && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-green-200/30 dark:border-green-800/30 flex flex-col gap-2">
              <button
                onClick={handleSaveBook}
                disabled={saveLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saveLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4" />
                    Save to Selected Lists
                  </>
                )}
              </button>
              {isSaved && savedLists.length > 0 && (
                <button
                  onClick={handleRemoveAllSaves}
                  disabled={saveLoading}
                  className="w-full text-red-500 hover:text-red-400 text-sm py-1.5 transition-colors disabled:opacity-50"
                >
                  Remove from all lists
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }

        .pdf-scroll-container::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .pdf-scroll-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .pdf-scroll-container::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #22c55e, #16a34a);
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .pdf-scroll-container::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #16a34a, #15803d);
        }

        .pdf-scroll-container {
          scrollbar-width: thin;
          scrollbar-color: #22c55e #f1f1f1;
        }

        .dark .pdf-scroll-container::-webkit-scrollbar-track {
          background: #1f2937;
        }

        .dark .pdf-scroll-container::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #22c55e, #16a34a);
        }

        .dark .pdf-scroll-container {
          scrollbar-color: #22c55e #1f2937;
        }

        /* Ratings Scrollbar */
        .ratings-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .ratings-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .ratings-scroll::-webkit-scrollbar-thumb {
          background: #22c55e;
          border-radius: 3px;
        }

        .ratings-scroll::-webkit-scrollbar-thumb:hover {
          background: #16a34a;
        }

        .ratings-scroll {
          scrollbar-width: thin;
          scrollbar-color: #22c55e transparent;
        }

        .pl-13 {
          padding-left: 3.25rem;
        }
      `}</style>
    </div>
  );
};

export default BookAbout;