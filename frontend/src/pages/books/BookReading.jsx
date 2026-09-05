// BookReading.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Loader2, AlertCircle, BookOpen,
  ChevronLeft, ChevronRight, Maximize2, Minimize2,
  ZoomIn, ZoomOut, Menu, X,
  User, BookMarked, Bookmark, BookmarkCheck,
  Sun, Moon, AlignLeft, AlignCenter, FileText
} from 'lucide-react';
import bookService from '../../services/book.service';

const BookReading = () => {
  const { bookTitle, id } = useParams();
  const navigate = useNavigate();
  const pdfContainerRef = useRef(null);
  const iframeRef = useRef(null);
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [readingMode, setReadingMode] = useState('scroll');
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  useEffect(() => {
    if (book?.content && isSubscribed) {
      getPDFPageCount(book.content);
    }
  }, [book, isSubscribed]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await bookService.getUserBookById(id);
      
      if (response.success) {
        setBook(response.book);
        setIsSubscribed(response.hasActiveSubscription || false);
        
        if (response.book.type === 'premium' && !response.hasActiveSubscription) {
          setError('You need a subscription to read this book.');
          return;
        }
        
        if (!response.book.content) {
          setError('Book content is not available.');
        }
      } else {
        setError(response.message || 'Failed to fetch book details');
      }
    } catch (err) {
      console.error('Error fetching book:', err);
      setError(err.message || 'Failed to load book. Please try again.');
    } finally {
      setLoading(false);
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
          setTotalPages(1);
        }
      });
    } else {
      setTotalPages(1);
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

  const handleFullscreen = () => {
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

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const toggleReadingMode = () => {
    setReadingMode(prev => prev === 'scroll' ? 'paged' : 'scroll');
  };

  const addBookmark = () => {
    const newBookmark = {
      page: 1,
      timestamp: new Date().toISOString(),
      note: `Bookmarked`
    };
    
    const updatedBookmarks = [...bookmarks, newBookmark];
    setBookmarks(updatedBookmarks);
    localStorage.setItem(`bookmarks_${id}`, JSON.stringify(updatedBookmarks));
  };

  const goToBookmark = () => {
    if (iframeRef.current) {
      iframeRef.current.scrollTop = 0;
    }
  };

  const removeBookmark = (index) => {
    const updatedBookmarks = bookmarks.filter((_, i) => i !== index);
    setBookmarks(updatedBookmarks);
    localStorage.setItem(`bookmarks_${id}`, JSON.stringify(updatedBookmarks));
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    alert('Right-click is disabled for this content.');
  };

  const handleCopy = (e) => {
    e.preventDefault();
    alert('Copying is disabled for this content.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0505] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#c8963e] animate-spin mx-auto mb-4" />
          <p className="text-[#d4b8a0]">Loading book content...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-[#0a0505] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-[#c8963e] mx-auto mb-4 opacity-60" />
          <h2 className="text-2xl font-bold text-[#f5e6d3] mb-2">
            Access Denied
          </h2>
          <p className="text-[#d4b8a0] mb-6">
            {error || 'You do not have access to this content.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => navigate(`/book-preview/${id}`)}
              className="px-6 py-2 rounded-lg bg-[#c8963e]/20 text-[#d4a85a] border border-[#c8963e]/30 hover:bg-[#c8963e]/30 transition-colors"
            >
              Go Back
            </button>
            {book?.type === 'premium' && !isSubscribed && (
              <button 
                onClick={() => navigate('/subscription')}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#c8963e] to-[#d4a85a] text-[#0a0505] font-bold hover:shadow-[0_0_40px_rgba(200,150,62,0.3)] transition-all"
              >
                Subscribe Now
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gray-100 dark:bg-black relative overflow-hidden"
      onContextMenu={handleContextMenu}
      onCopy={handleCopy}
    >
      {/* Google Docs style background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-900" />
        <div className="absolute inset-0 opacity-20 dark:opacity-10">
          <svg className="w-full h-full">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" className="text-black/20 dark:text-white/10" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Navigation Bar */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 transition-opacity duration-300">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(`/book-preview/${id}`)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-[#c8963e] dark:hover:text-[#c8963e] transition-colors"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="hidden sm:block">
                <h1 className="text-gray-900 dark:text-white font-medium text-sm truncate max-w-[150px] lg:max-w-[300px]">
                  {book.title}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-xs flex items-center gap-2">
                  <User className="w-3 h-3" />
                  {book.authorName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm">
                <span className="text-gray-700 dark:text-gray-300">
                  {totalPages > 0 ? `${totalPages} pages` : 'Loading...'}
                </span>
              </div>
              
              <div className="hidden md:block w-32">
                <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#c8963e] to-[#d4a85a] transition-all duration-300"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={addBookmark}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-[#d4a85a] dark:hover:text-[#d4a85a] transition-colors"
                title="Add bookmark"
              >
                {bookmarks.length > 0 ? (
                  <BookmarkCheck className="w-4 h-4 text-[#d4a85a]" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>

              <button 
                onClick={toggleReadingMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-[#d4a85a] dark:hover:text-[#d4a85a] transition-colors"
                title="Toggle reading mode"
              >
                {readingMode === 'scroll' ? (
                  <AlignLeft className="w-4 h-4" />
                ) : (
                  <AlignCenter className="w-4 h-4" />
                )}
              </button>

              <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-[#d4a85a] dark:hover:text-[#d4a85a] transition-colors"
                title="Toggle dark mode"
              >
                <Sun className="w-4 h-4 dark:hidden" />
                <Moon className="w-4 h-4 hidden dark:block" />
              </button>

              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

              <button 
                onClick={handleZoomOut}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-[#d4a85a] dark:hover:text-[#d4a85a] transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm min-w-[36px] text-center text-gray-700 dark:text-gray-300">
                100%
              </span>
              <button 
                onClick={handleZoomIn}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-[#d4a85a] dark:hover:text-[#d4a85a] transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button 
                onClick={handleResetZoom}
                className="hidden md:block px-2 py-1 text-xs bg-[#c8963e]/10 text-[#d4a85a] rounded hover:bg-[#c8963e]/20 transition-colors"
                title="Reset zoom"
              >
                Reset
              </button>

              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

              <button 
                onClick={handleFullscreen}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-[#d4a85a] dark:hover:text-[#d4a85a] transition-colors"
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>

              <button 
                onClick={() => setShowControls(!showControls)}
                className="md:hidden p-2 rounded-lg hover:bg-[#c8963e]/10 text-[#d4b8a0] hover:text-[#d4a85a] transition-colors"
              >
                {showControls ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Book Content  */}
        <div 
          ref={pdfContainerRef}
          className="flex-1 relative bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-8 transition-all duration-300"
          style={{
            height: isFullscreen ? 'calc(100vh - 100px)' : 'auto',
            minHeight: '500px',
          }}
        >
          {book.content ? (
            <div 
              className="relative rounded-sm shadow-2xl transition-all duration-300 overflow-hidden"
              style={{
                width: '100%',
                maxWidth: '900px',
                height: isFullscreen ? 'calc(100vh - 160px)' : '700px',
                backgroundColor: '#ffffff',
                boxShadow: '0 8px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.05)',
              }}
            >
              <div className="absolute inset-0 pointer-events-none z-10 dark:hidden">
                <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/5 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/5 to-transparent" />
              </div>
              
              <iframe
                ref={iframeRef}
                src={book.content}
                title={book.title}
                className="w-full h-full border-0 bg-white dark:bg-gray-800"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
              <FileText className="w-16 h-16 mb-3" />
              <p>No content available</p>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 transition-opacity duration-300 p-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {totalPages > 0 ? `${totalPages} pages` : 'Loading...'}
              </span>
            </div>

            <div className="flex-1 max-w-md mx-4">
              <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#c8963e] to-[#d4a85a] transition-all duration-300"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {bookmarks.length > 0 && (
                <div className="relative group">
                  <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-[#d4a85a] dark:hover:text-[#d4a85a] transition-colors">
                    <BookMarked className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 text-[10px] bg-[#c8963e] text-[#0a0505] rounded-full w-4 h-4 flex items-center justify-center">
                      {bookmarks.length}
                    </span>
                  </button>
                  <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 min-w-[150px] hidden group-hover:block shadow-lg">
                    {bookmarks.map((bm, index) => (
                      <div key={index} className="flex items-center justify-between gap-2 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <button 
                          onClick={goToBookmark}
                          className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm"
                        >
                          {bm.note || 'Bookmark'}
                        </button>
                        <button 
                          onClick={() => removeBookmark(index)}
                          className="text-red-500/50 hover:text-red-500 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Watermark */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute bottom-4 right-4 text-black/5 dark:text-white/5 text-xs font-mono">
            {book.title} • Protected Content
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookReading;