import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Heart, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Folder,
  Star,
  ChevronRight,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import bookService from '../../services/book.service';
import SquareText from '../../components/style/SquareText';
import MainButton from '../../components/style/MainButton';

const Save = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [booksInList, setBooksInList] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [newListData, setNewListData] = useState({
    name: '',
    color: '#c8963e',
    icon: '📚',
    description: ''
  });
  const [bookLoading, setBookLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const colorOptions = [
    '#c8963e', '#ff6b6b', '#4ecdc4', '#45b7d1', 
    '#96ceb4', '#dda0dd', '#f0e68c', '#ff8c94',
    '#a8e6cf', '#ffd3b4', '#dcedc1', '#ffb7b2'
  ];

  const iconOptions = ['📚', '⭐', '❤️', '📖', '🎯', '💡', '🌟', '🔥', '🎨', '📝'];

  const getColorWithOpacity = (color, opacity) => {
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchUserLists();
  }, []);

  useEffect(() => {
    if (selectedList) {
      fetchBooksInList(selectedList._id);
    }
  }, [selectedList]);

  const fetchUserLists = async () => {
    try {
      setLoading(true);
      const response = await bookService.getUserLists();
      if (response.success) {
        setLists(response.lists);
        const defaultList = response.lists.find(list => list.isDefault);
        if (defaultList) {
          setSelectedList(defaultList);
        } else if (response.lists.length > 0) {
          setSelectedList(response.lists[0]);
        }
      }
    } catch (error) {
      showToast('Failed to fetch lists', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchBooksInList = async (listId) => {
    try {
      setBookLoading(true);
      const response = await bookService.getBooksInList(listId, { limit: 50 });
      if (response.success) {
        setBooksInList(response.books || []);
      }
    } catch (error) {
      showToast('Failed to fetch books', 'error');
    } finally {
      setBookLoading(false);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    try {
      const response = await bookService.createList(newListData);
      if (response.success) {
        await fetchUserLists();
        setShowCreateModal(false);
        setNewListData({
          name: '',
          color: '#c8963e',
          icon: '📚',
          description: ''
        });
        showToast('List created successfully!');
      }
    } catch (error) {
      showToast(error.message || 'Failed to create list', 'error');
    }
  };

  const handleUpdateList = async (e) => {
    e.preventDefault();
    try {
      const response = await bookService.updateList(editingList._id, editingList);
      if (response.success) {
        await fetchUserLists();
        setShowEditModal(false);
        setEditingList(null);
        showToast('List updated successfully!');
      }
    } catch (error) {
      showToast(error.message || 'Failed to update list', 'error');
    }
  };

  const handleDeleteList = async (listId) => {
    if (!confirm('Are you sure you want to delete this list? All books in this list will be removed.')) return;
    try {
      const response = await bookService.deleteList(listId);
      if (response.success) {
        await fetchUserLists();
        if (selectedList?._id === listId) {
          setSelectedList(lists.find(l => l._id !== listId) || null);
        }
        showToast('List deleted successfully!');
      }
    } catch (error) {
      showToast(error.message || 'Failed to delete list', 'error');
    }
  };

  const handleRemoveBookFromList = async (bookId) => {
    if (!confirm('Remove this book from the list?')) return;
    try {
      const response = await bookService.removeBookFromList(bookId, {
        listId: selectedList._id
      });
      if (response.success) {
        await fetchBooksInList(selectedList._id);
        await fetchUserLists();
        showToast('Book removed from list');
      }
    } catch (error) {
      showToast(error.message || 'Failed to remove book', 'error');
    }
  };

  const handleMoveToList = async (bookId, targetListId) => {
    if (targetListId === selectedList._id) return;
    try {
      const response = await bookService.moveBookToList(bookId, {
        sourceListId: selectedList._id,
        targetListId: targetListId
      });
      if (response.success) {
        await fetchBooksInList(selectedList._id);
        await fetchUserLists();
        showToast('Book moved successfully!');
      }
    } catch (error) {
      showToast(error.message || 'Failed to move book', 'error');
    }
  };

  const handleNavigateToBook = (bookId) => {
    navigate(`/book-preview/${bookId}`);
  };

  const getIconForList = (list) => {
    return list.icon || '📚';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0505] flex items-center justify-center">
        <div className="text-[#f5e6d3] text-center">
          <Loader2 className="w-12 h-12 text-[#c8963e] animate-spin mx-auto mb-4" />
          <p>Loading your saved books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0600] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <div className="inline-block mb-3">
              <SquareText text="Saved Books" size="default" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#f5e6d3]">
              Your Collections
            </h1>
            <p className="text-[#d4b8a0] mt-1">Manage your saved books and custom lists</p>
          </div>
          <MainButton 
            text="CREATE LIST" 
            onClick={() => setShowCreateModal(true)}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-80 flex-shrink-0">
            <div className=" backdrop-blur-xl rounded-2xl border border-[#c8963e]/10 p-4"
             style={{ backgroundColor: selectedList ? getColorWithOpacity(selectedList.color, 0.08) : 'transparent' }}>

              <h2 className="text-[#f5e6d3] font-semibold text-lg mb-3 flex items-center gap-2">
                <Folder className="w-5 h-5 text-[#c8963e]" />
                Your Lists
              </h2>
              <div className="space-y-2">
                {lists.map((list) => {
                  const listColor = list.color || '#c8963e';
                  const isSelected = selectedList?._id === list._id;
                  
                  return (
                    <div
                      key={list._id}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-300 border ${
                        isSelected
                          ? 'border-opacity-50'
                          : 'border-transparent hover:border-white/10'
                      }`}
                      style={{
                        backgroundColor: isSelected ? getColorWithOpacity(listColor, 0.15) : 'transparent',
                        borderColor: isSelected ? getColorWithOpacity(listColor, 0.5) : 'transparent'
                      }}
                      onClick={() => setSelectedList(list)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl">{getIconForList(list)}</span>
                        <div className="min-w-0">
                          <p 
                            className="truncate font-medium"
                            style={{ color: isSelected ? listColor : '#f5e6d3' }}
                          >
                            {list.name}
                            {list.isDefault && (
                              <Star 
                                className="w-3 h-3 inline ml-1"
                                style={{ color: listColor }}
                              />
                            )}
                          </p>
                          <p className="text-[#d4b8a0] text-xs">
                            {list.bookCount || 0} books
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!list.isDefault && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingList(list);
                                setShowEditModal(true);
                              }}
                              className="p-1 hover:bg-white/10 rounded transition-colors"
                            >
                              <Edit2 className="w-4 h-4 text-[#d4b8a0]" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteList(list._id);
                              }}
                              className="p-1 hover:bg-red-500/20 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </>
                        )}
                        <ChevronRight 
                          className={`w-4 h-4 transition-transform ${
                            isSelected ? 'rotate-90' : ''
                          }`}
                          style={{ color: isSelected ? listColor : '#d4b8a0' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              {lists.length === 0 && (
                <p className="text-[#d4b8a0] text-center py-8">
                  No lists yet. Create your first list!
                </p>
              )}
            </div>
          </div>

          <div className="flex-1">
            {selectedList ? (
              <div 
                className="rounded-2xl border p-4 transition-all duration-300"
                style={{
                  backgroundColor: getColorWithOpacity(selectedList.color, 0.08),
                  borderColor: getColorWithOpacity(selectedList.color, 0.2)
                }}
              >
                <div className="mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getIconForList(selectedList)}</span>
                    <div>
                      <h2 
                        className="font-semibold text-xl"
                        style={{ color: selectedList.color }}
                      >
                        {selectedList.name}
                        {selectedList.isDefault && (
                          <Star 
                            className="w-4 h-4 inline ml-2"
                            style={{ color: selectedList.color }}
                          />
                        )}
                      </h2>
                      <p className="text-[#d4b8a0] text-sm">
                        {selectedList.bookCount || 0} books
                      </p>
                      {selectedList.description && (
                        <p className="text-[#d4b8a0] text-sm mt-1 opacity-80">
                          {selectedList.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                </div>

                {bookLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-[#c8963e] animate-spin" />
                  </div>
                ) : booksInList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {booksInList.map((item) => (
                      <div
                        key={item.saveId}
                        className="bg-[#0a0505]/50 rounded-xl overflow-hidden border transition-all duration-300 group hover:shadow-lg hover:scale-[1.02]"
                        style={{
                          borderColor: getColorWithOpacity(selectedList.color, 0.1),
                          boxShadow: `0 0 30px ${getColorWithOpacity(selectedList.color, 0.05)}`
                        }}
                      >
                        <div 
                          className="aspect-[7/9] relative cursor-pointer"
                          onClick={() => handleNavigateToBook(item.book._id)}
                        >
                          {item.book.thumbnail ? (
                            <img 
                              src={item.book.thumbnail} 
                              alt={item.book.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2d1810]/40 to-[#1a0a0a]/60">
                              <BookOpen 
                                className="w-16 h-16"
                                style={{ color: getColorWithOpacity(selectedList.color, 0.3) }}
                              />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0505] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-[#0a0505]">
                            <h3 className="text-[#f5e6d3] text-sm font-medium truncate">
                              {item.book.title}
                            </h3>
                            <p className="text-[#d4b8a0] text-xs">
                              {item.book.authorName || 'Unknown Author'}
                            </p>
                          </div>
                          <div 
                            className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ backgroundColor: selectedList.color }}
                          />
                        </div>
                        <div className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleRemoveBookFromList(item.book._id)}
                                className="p-1.5 rounded-lg transition-colors hover:bg-red-500/20"
                                title="Remove from list"
                              >
                                <Heart 
                                  className="w-4 h-4"
                                  style={{ color: selectedList.color, fill: selectedList.color }}
                                />
                              </button>
                              <button
                                onClick={() => handleNavigateToBook(item.book._id)}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                title="View book"
                              >
                                <Eye className="w-4 h-4 text-[#d4b8a0]" />
                              </button>
                            </div>
                            <div className="relative">
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleMoveToList(item.book._id, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                                className="bg-white/5 text-[#d4b8a0] text-xs rounded-lg px-2 py-1 border focus:outline-none cursor-pointer transition-colors"
                                style={{
                                  borderColor: getColorWithOpacity(selectedList.color, 0.2),
                                }}
                                defaultValue=""
                              >
                                <option value="">Move to...</option>
                                {lists
                                  .filter(list => list._id !== selectedList._id)
                                  .map(list => (
                                    <option key={list._id} value={list._id}>
                                      {list.icon} {list.name}
                                    </option>
                                  ))}
                                {lists.filter(list => list._id !== selectedList._id).length === 0 && (
                                  <option disabled>No other lists</option>
                                )}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen 
                      className="w-16 h-16 mx-auto mb-4"
                      style={{ color: getColorWithOpacity(selectedList.color, 0.3) }}
                    />
                    <p className="text-[#d4b8a0]">No books in this list yet</p>
                    <p className="text-[#d4b8a0] text-sm opacity-70">
                      Browse books and save them to this list
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#1a0a0a]/60 backdrop-blur-xl rounded-2xl border border-[#c8963e]/10 p-8 text-center">
                <Folder className="w-16 h-16 text-[#c8963e]/30 mx-auto mb-4" />
                <h3 className="text-[#f5e6d3] text-xl font-semibold">No List Selected</h3>
                <p className="text-[#d4b8a0]">Select a list from the sidebar or create a new one</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a0a0a] rounded-2xl border border-[#c8963e]/20 max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[#f5e6d3] text-xl font-semibold">Create New List</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#d4b8a0]" />
              </button>
            </div>
            <form onSubmit={handleCreateList}>
              <div className="space-y-4">
                <div>
                  <label className="text-[#d4b8a0] text-sm block mb-1">List Name *</label>
                  <input
                    type="text"
                    required
                    value={newListData.name}
                    onChange={(e) => setNewListData({...newListData, name: e.target.value})}
                    className="w-full bg-[#0a0505] border border-[#c8963e]/20 rounded-lg px-4 py-2 text-[#f5e6d3] focus:outline-none focus:border-[#c8963e]/50"
                    placeholder="e.g., Romance Novels"
                  />
                </div>
                <div>
                  <label className="text-[#d4b8a0] text-sm block mb-1">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setNewListData({...newListData, icon})}
                        className={`text-2xl p-2 rounded-lg transition-all ${
                          newListData.icon === icon
                            ? 'bg-[#c8963e]/20 border border-[#c8963e]/50'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[#d4b8a0] text-sm block mb-1">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewListData({...newListData, color})}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          newListData.color === color
                            ? 'border-white'
                            : 'border-transparent hover:border-white/50'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[#d4b8a0] text-sm block mb-1">Description</label>
                  <textarea
                    value={newListData.description}
                    onChange={(e) => setNewListData({...newListData, description: e.target.value})}
                    className="w-full bg-[#0a0505] border border-[#c8963e]/20 rounded-lg px-4 py-2 text-[#f5e6d3] focus:outline-none focus:border-[#c8963e]/50 resize-none"
                    rows="3"
                    placeholder="Describe your list..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full text-[#0a0505] py-2 rounded-lg font-semibold transition-all hover:brightness-110"
                  style={{ backgroundColor: newListData.color }}
                >
                  Create List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingList && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a0a0a] rounded-2xl border border-[#c8963e]/20 max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[#f5e6d3] text-xl font-semibold">Edit List</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingList(null);
                }}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#d4b8a0]" />
              </button>
            </div>
            <form onSubmit={handleUpdateList}>
              <div className="space-y-4">
                <div>
                  <label className="text-[#d4b8a0] text-sm block mb-1">List Name *</label>
                  <input
                    type="text"
                    required
                    value={editingList.name}
                    onChange={(e) => setEditingList({...editingList, name: e.target.value})}
                    className="w-full bg-[#0a0505] border border-[#c8963e]/20 rounded-lg px-4 py-2 text-[#f5e6d3] focus:outline-none focus:border-[#c8963e]/50"
                  />
                </div>
                <div>
                  <label className="text-[#d4b8a0] text-sm block mb-1">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setEditingList({...editingList, icon})}
                        className={`text-2xl p-2 rounded-lg transition-all ${
                          editingList.icon === icon
                            ? 'bg-[#c8963e]/20 border border-[#c8963e]/50'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[#d4b8a0] text-sm block mb-1">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setEditingList({...editingList, color})}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          editingList.color === color
                            ? 'border-white'
                            : 'border-transparent hover:border-white/50'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[#d4b8a0] text-sm block mb-1">Description</label>
                  <textarea
                    value={editingList.description || ''}
                    onChange={(e) => setEditingList({...editingList, description: e.target.value})}
                    className="w-full bg-[#0a0505] border border-[#c8963e]/20 rounded-lg px-4 py-2 text-[#f5e6d3] focus:outline-none focus:border-[#c8963e]/50 resize-none"
                    rows="3"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full text-[#0a0505] py-2 rounded-lg font-semibold transition-all hover:brightness-110"
                  style={{ backgroundColor: editingList.color || '#c8963e' }}
                >
                  Update List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-slide-up">
          <div className={`rounded-xl shadow-2xl p-4 flex items-start gap-3 border ${
            toast.type === 'error' 
              ? 'bg-red-900/90 border-red-500/30 text-red-100' 
              : 'bg-[#1a0a0a]/95 border-[#c8963e]/30 text-[#f5e6d3]'
          } backdrop-blur-xl`}>
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-5 h-5 text-[#c8963e] flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-[#d4b8a0] hover:text-white transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Save;