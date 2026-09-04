// BookPreview.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BookOpen, Star, Clock, User, Eye, Crown, 
  ArrowLeft, Bookmark, BookmarkCheck, Calendar,
  FileText, Share2, Download, ChevronRight, 
  Lock, Sparkles, CheckCircle, AlertCircle,
  Loader2, Heart, Plus, X, Folder, Check
} from 'lucide-react';
import bookService from '../../services/book.service';
import { useAuth } from '../../context/authContext';
import MainButton from '../../components/style/MainButton';
import BookRating from '../../components/books/BookRating';
import SimilarBooks from '../../components/Books/SimmilerBooks';

const BookPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [requiresSubscription, setRequiresSubscription] = useState(false);
  const [showContent, setShowContent] = useState(false);
  
  // Save related states
  const [isSaved, setIsSaved] = useState(false);
  const [savedLists, setSavedLists] = useState([]);
  const [userLists, setUserLists] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedLists, setSelectedLists] = useState([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [totalSaves, setTotalSaves] = useState(0);

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  useEffect(() => {
    if (showSaveModal) {
      fetchUserLists();
    }
  }, [showSaveModal]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await bookService.getUserBookById(id);
      
      if (response.success) {
        setBook(response.book);
        setIsSubscribed(response.hasActiveSubscription || false);
        setRequiresSubscription(response.requiresSubscription || false);
        setTotalSaves(response.book.totalSaves || 0);
        
        if (response.book.type === 'premium' && response.hasActiveSubscription) {
          setShowContent(true);
        } else if (response.book.type === 'free') {
          setShowContent(true);
        }

        await checkBookSaveStatus();
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

  const handleRatingUpdate = async () => {
    // Refresh book details to get updated ratings
    await fetchBookDetails();
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
      
    } catch (error) {
      console.error('Error saving book:', error);
      alert(error.message || 'Failed to save book');
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
      
    } catch (error) {
      console.error('Error removing book from all lists:', error);
      alert(error.message || 'Failed to remove book from lists');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleReadNow = () => {
    if (book.type === 'premium' && !isSubscribed) {
      navigate('/subscription');
      return;
    }
    
    const bookTitle = book.title.toLowerCase().replace(/\s+/g, '-');
    navigate(`/book-reading/${bookTitle}/${book._id}`);
  };

  const handleDownload = () => {
    if (book.type === 'premium' && !isSubscribed) {
      navigate('/subscription-plans');
      return;
    }
    alert('Download feature coming soon!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: `Check out "${book.title}" by ${book.authorName}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch(console.error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0505] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#c8963e] animate-spin mx-auto mb-4" />
          <p className="text-[#d4b8a0]">Loading book details...</p>
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
            {error || 'Book not found'}
          </h2>
          <p className="text-[#d4b8a0] mb-6">
            The book you're looking for doesn't exist or has been removed.
          </p>
          <button 
            onClick={() => navigate('/books')}
            className="px-6 py-2 rounded-lg bg-[#c8963e]/20 text-[#d4a85a] border border-[#c8963e]/30 hover:bg-[#c8963e]/30 transition-colors"
          >
            Browse All Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0505] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                      w-[800px] h-[800px] rounded-full 
                      bg-gradient-to-r from-[#8b0000]/20 via-[#4a0000]/10 to-transparent
                      blur-3xl animate-pulse" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] 
                      bg-gradient-to-bl from-[#8b0000]/30 to-transparent 
                      rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] 
                      bg-gradient-to-tr from-[#6b0000]/20 to-transparent 
                      rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-[#d4b8a0] hover:text-[#d4a85a] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden
                            bg-gradient-to-br from-[#2d1810]/40 to-[#1a0a0a]/60
                            border border-[#c8963e]/20
                            shadow-[0_0_60px_rgba(200,150,62,0.1)]">
                {book.thumbnail ? (
                  <img 
                    src={book.thumbnail} 
                    alt={book.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : null}
                
                {!book.thumbnail && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-48 rounded-xl bg-gradient-to-br from-[#c8963e]/20 to-[#d4a85a]/10 
                                  border border-[#c8963e]/20 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-[#d4a85a] opacity-60" />
                    </div>
                  </div>
                )}
                
                {book.type === 'premium' && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                   bg-gradient-to-r from-[#c8963e] to-[#d4a85a] text-[#0a0505]
                                   shadow-[0_0_20px_rgba(200,150,62,0.3)]
                                   flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Premium
                    </span>
                  </div>
                )}

                {book.type === 'free' && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                   bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/20
                                   flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Free
                    </span>
                  </div>
                )}

                {book.type === 'premium' && !isSubscribed && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6">
                    <Lock className="w-12 h-12 text-[#c8963e] mb-3" />
                    <p className="text-[#f5e6d3] text-center font-semibold mb-1">
                      Premium Content
                    </p>
                    <p className="text-[#d4b8a0] text-sm text-center">
                      Subscribe to access this book
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <MainButton
                  onClick={handleReadNow}
                  variant='outline'
                  disabled={book.type === 'premium' && !isSubscribed}
                  text={book.type === 'premium' && !isSubscribed ? 'Subscribe to Read' : 'Read Now'}
                />
                  
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleDownload}
                    className="px-4 py-2 rounded-xl
                             bg-[#1a0a0a]/60 border border-[#c8963e]/20
                             text-[#d4b8a0] hover:text-[#d4a85a]
                             hover:border-[#c8963e]/40
                             transition-all duration-300
                             disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2"
                    disabled={book.type === 'premium' && !isSubscribed}
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  
                  <button 
                    onClick={() => setShowSaveModal(true)}
                    className="px-4 py-2 rounded-xl
                             bg-[#1a0a0a]/60 border border-[#c8963e]/20
                             text-[#d4b8a0] hover:text-[#d4a85a]
                             hover:border-[#c8963e]/40
                             transition-all duration-300
                             flex items-center justify-center gap-2 relative"
                  >
                    {isSaved ? (
                      <>
                        <Bookmark className="w-4 h-4 text-[#c8963e] fill-[#c8963e]" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4" />
                        <span>Save</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {book.type === 'premium' && (
                <div className="mt-4 p-3 rounded-xl bg-[#1a0a0a]/40 border border-[#c8963e]/10">
                  <div className="flex items-center gap-2">
                    {isSubscribed ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-[#22c55e]" />
                        <span className="text-[#d4b8a0] text-sm">
                          You have access to this premium book
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-[#c8963e]" />
                        <span className="text-[#d4b8a0] text-sm">
                          Subscribe to unlock premium content
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#f5e6d3] mb-2">
                {book.title}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-[#d4b8a0] text-lg flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {book.authorName}
                </p>
                {book.edition && (
                  <span className="px-2 py-1 rounded text-xs bg-[#c8963e]/10 border border-[#c8963e]/10 text-[#d4b8a0]">
                    {book.edition} Edition
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl
                          bg-[#1a0a0a]/40 border border-[#c8963e]/10">
              <span className="px-3 py-1 rounded-full text-sm 
                             bg-[#c8963e]/10 border border-[#c8963e]/10 text-[#d4b8a0]">
                {book.category}
              </span>
              {book.subject && (
                <span className="px-3 py-1 rounded-full text-sm 
                               bg-[#c8963e]/5 border border-[#c8963e]/10 text-[#d4b8a0]">
                  {book.subject}
                </span>
              )}
              <span className="flex items-center gap-1 text-[#d4b8a0]">
                <Star className="w-4 h-4 text-[#c8963e] fill-[#c8963e]" />
                {book.ratings?.average > 0 ? book.ratings.average.toFixed(1) : 'No ratings'}
                {book.ratings?.count > 0 && (
                  <span className="text-xs text-[#8b6b5a] ml-1">
                    ({book.ratings.count} {book.ratings.count === 1 ? 'review' : 'reviews'})
                  </span>
                )}
              </span>
              <span className="flex items-center gap-1 text-[#d4b8a0]">
                <Eye className="w-4 h-4" />
                {book.views >= 1000 ? `${(book.views / 1000).toFixed(1)}K` : book.views} views
              </span>
              <span className="flex items-center gap-1 text-[#d4b8a0]">
                <Bookmark className="w-4 h-4 text-[#c8963e]" />
                {book.totalSaves || 0} saves
              </span>
              <span className="flex items-center gap-1 text-[#d4b8a0]">
                <Clock className="w-4 h-4" />
                {book.pages} pages
              </span>
              {book.language && (
                <span className="flex items-center gap-1 text-[#d4b8a0]">
                  <FileText className="w-4 h-4" />
                  {book.language}
                </span>
              )}
            </div>

            <div className="p-6 rounded-xl
                          bg-[#1a0a0a]/40 border border-[#c8963e]/10">
              <h2 className="text-[#f5e6d3] font-bold text-lg mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#c8963e]" />
                About This Book
              </h2>
              <p className="text-[#d4b8a0] leading-relaxed whitespace-pre-wrap">
                {book.description}
              </p>
              
              {book.features && book.features.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-[#f5e6d3] font-semibold text-sm mb-2">Key Features:</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {book.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-[#d4b8a0] text-sm">
                        <CheckCircle className="w-4 h-4 text-[#c8963e]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-xl
                          bg-[#1a0a0a]/40 border border-[#c8963e]/10">
              {book.publication && (
                <div>
                  <p className="text-[#8b6b5a] text-xs uppercase tracking-wider">Publisher</p>
                  <p className="text-[#d4b8a0] text-sm mt-1">{book.publication}</p>
                </div>
              )}
              {book.edition && (
                <div>
                  <p className="text-[#8b6b5a] text-xs uppercase tracking-wider">Edition</p>
                  <p className="text-[#d4b8a0] text-sm mt-1">{book.edition}</p>
                </div>
              )}
              <div>
                <p className="text-[#8b6b5a] text-xs uppercase tracking-wider">Type</p>
                <p className="text-[#d4b8a0] text-sm mt-1 capitalize">{book.type}</p>
              </div>
              <div>
                <p className="text-[#8b6b5a] text-xs uppercase tracking-wider">Total Saves</p>
                <p className="text-[#d4b8a0] text-sm mt-1">{book.totalSaves || 0}</p>
              </div>
            </div>

            {book.type === 'premium' && book.premiumPlans && book.premiumPlans.length > 0 && (
              <div className="p-6 rounded-xl bg-[#1a0a0a]/40 border border-[#c8963e]/10">
                <h2 className="text-[#f5e6d3] font-bold text-lg mb-3 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-[#c8963e]" />
                  Available Plans
                </h2>
                <div className="flex flex-wrap gap-2">
                  {book.premiumPlans.map((plan, index) => (
                    <span key={index} 
                          className="px-3 py-1 rounded-full text-sm
                                   bg-[#c8963e]/10 border border-[#c8963e]/20 text-[#d4b8a0] capitalize">
                      {plan}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {book.about && Object.keys(book.about).length > 0 && (
              <div className="p-6 rounded-xl bg-[#1a0a0a]/40 border border-[#c8963e]/10">
                <h2 className="text-[#f5e6d3] font-bold text-lg mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#c8963e]" />
                  More Information
                </h2>
                <div className="space-y-2">
                  {Object.entries(book.about).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-2">
                      <span className="text-[#8b6b5a] text-sm capitalize min-w-[100px]">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-[#d4b8a0] text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Book Rating Component */}
            <BookRating 
              bookId={id} 
              bookRatings={book.ratings}
              onRatingUpdate={handleRatingUpdate}
            />

            <div className="flex items-center gap-4 pt-6 border-t border-[#c8963e]/10">
              <span className="text-[#8b6b5a] text-sm">Share this book:</span>
              <button 
                onClick={handleShare}
                className="p-2 rounded-lg bg-[#1a0a0a]/60 border border-[#c8963e]/10
                         text-[#d4b8a0] hover:text-[#d4a85a] hover:border-[#c8963e]/30
                         transition-all duration-300"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save/Unsave Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a0a0a] rounded-2xl border border-[#c8963e]/20 max-w-md w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-[#c8963e]/10">
              <h3 className="text-[#f5e6d3] text-xl font-semibold flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#c8963e]" />
                Save Book
              </h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#d4b8a0]" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <p className="text-[#d4b8a0] text-sm mb-4">
                Select lists to save "{book.title}" to:
              </p>

              {userLists.length === 0 ? (
                <div className="text-center py-8">
                  <Folder className="w-12 h-12 text-[#c8963e]/30 mx-auto mb-3" />
                  <p className="text-[#d4b8a0] text-sm">No lists found</p>
                  <button
                    onClick={() => {
                      setShowSaveModal(false);
                      navigate('/save');
                    }}
                    className="mt-3 text-[#c8963e] hover:text-[#d4a85a] text-sm transition-colors"
                  >
                    Create a list →
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {userLists.map((list) => {
                    const isSelected = selectedLists.includes(list._id);
                    const listColor = list.color || '#c8963e';
                    
                    return (
                      <div
                        key={list._id}
                        onClick={() => handleToggleListSelection(list._id)}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-300 border ${
                          isSelected
                            ? `border-[${listColor}]/50`
                            : 'border-[#c8963e]/10 hover:border-[#c8963e]/30'
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
                            <p className="text-[#f5e6d3] font-medium">
                              {list.name}
                              {list.isDefault && (
                                <Star className="w-3 h-3 text-[#c8963e] inline ml-1" />
                              )}
                            </p>
                            <p className="text-[#d4b8a0] text-xs">
                              {list.bookCount || 0} books
                            </p>
                          </div>
                        </div>
                        <div 
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? `border-[${listColor}] bg-[${listColor}]`
                              : 'border-[#d4b8a0]/30'
                          }`}
                        >
                          {isSelected && (
                            <Check className="w-3 h-3 text-[#0a0505]" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-[#c8963e]/10 flex flex-col gap-2">
              <button
                onClick={handleSaveBook}
                disabled={saveLoading}
                className="w-full bg-[#c8963e] hover:bg-[#d4a85a] text-[#0a0505] py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  className="w-full text-red-400 hover:text-red-300 text-sm py-1.5 transition-colors disabled:opacity-50"
                >
                  Remove from all lists
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {book && (
  <div className="mt-8 border-t border-[#c8963e]/10 pt-8">
    <SimilarBooks
      currentBookId={book._id}
      category={book.category}
      subject={book.subject}
      authorName={book.authorName}
    />
  </div>
)}
    </div>
  );
};

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
    '200, 150, 62';
}

export default BookPreview;