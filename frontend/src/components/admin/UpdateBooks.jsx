import React, { useState, useEffect } from 'react';
import { X, Upload, BookOpen, Sparkles, FileText, Image, Crown, Star, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateBook } from '../../services/book.service';

const UpdateBooks = ({ book, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subject: '',
    authorName: '',
    pages: '',
    edition: '',
    publication: '',
    features: [],
    about: {},
    type: 'free',
    premiumPlans: [],
    status: 'pending',
    language: 'English',
    order: 0,
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [contentFile, setContentFile] = useState(null);
  const [contentPreview, setContentPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Feature management
  const [featureInput, setFeatureInput] = useState('');
  const [aboutKey, setAboutKey] = useState('');
  const [aboutValue, setAboutValue] = useState('');

  // Load book data
  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        description: book.description || '',
        category: book.category || '',
        subject: book.subject || '',
        authorName: book.authorName || '',
        pages: book.pages || '',
        edition: book.edition || '',
        publication: book.publication || '',
        features: book.features || [],
        about: book.about || {},
        type: book.type || 'free',
        premiumPlans: book.premiumPlans || [],
        status: book.status || 'pending',
        language: book.language || 'English',
        order: book.order || 0,
      });
      if (book.thumbnail) {
        setThumbnailPreview(book.thumbnail);
      }
      if (book.content) {
        setContentPreview(book.content.split('/').pop() || 'book.pdf');
      }
    }
  }, [book]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeToggle = () => {
    const newType = formData.type === 'free' ? 'premium' : 'free';
    setFormData(prev => ({ ...prev, type: newType }));
    if (newType === 'free') {
      setFormData(prev => ({ ...prev, premiumPlans: [] }));
    }
  };

  // Thumbnail handlers
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        toast.error('Only image files (jpeg, jpg, png, gif, webp) are allowed');
        return;
      }
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setThumbnailPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    const input = document.getElementById('thumbnailInput');
    if (input) input.value = '';
  };

  // Content (PDF) handlers
  const handleContentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }
      const allowedTypes = ['application/pdf', 'application/epub+zip', 'application/x-mobipocket-ebook'];
      const extensions = ['.pdf', '.epub', '.mobi'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!allowedTypes.includes(file.type) && !extensions.includes(fileExtension)) {
        toast.error('Only PDF, EPUB, and MOBI files are allowed');
        return;
      }
      setContentFile(file);
      setContentPreview(file.name);
    }
  };

  const removeContent = () => {
    setContentFile(null);
    setContentPreview(null);
    const input = document.getElementById('contentInput');
    if (input) input.value = '';
  };

  // Features handlers
  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  // About handlers
  const addAbout = () => {
    if (aboutKey.trim() && aboutValue.trim()) {
      setFormData(prev => ({
        ...prev,
        about: { ...prev.about, [aboutKey.trim()]: aboutValue.trim() }
      }));
      setAboutKey('');
      setAboutValue('');
    }
  };

  const removeAbout = (key) => {
    setFormData(prev => {
      const newAbout = { ...prev.about };
      delete newAbout[key];
      return { ...prev, about: newAbout };
    });
  };

  // Premium Plan handlers - Simplified (Checkbox based)
  const handlePremiumPlanToggle = (planName) => {
    setFormData(prev => {
      const currentPlans = prev.premiumPlans || [];
      if (currentPlans.includes(planName)) {
        return {
          ...prev,
          premiumPlans: currentPlans.filter(p => p !== planName)
        };
      } else {
        return {
          ...prev,
          premiumPlans: [...currentPlans, planName]
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.description || !formData.category || 
        !formData.subject || !formData.authorName || !formData.pages) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.type === 'premium' && formData.premiumPlans.length === 0) {
      toast.error('Please select at least one premium plan (basic, premium, or elite)');
      return;
    }

    try {
      setLoading(true);
      
      const formDataToSend = new FormData();
      
      // Append all fields
      Object.keys(formData).forEach(key => {
        if (key === 'features') {
          formDataToSend.append('features', JSON.stringify(formData.features));
        } else if (key === 'about') {
          formDataToSend.append('about', JSON.stringify(formData.about));
        } else if (key === 'premiumPlans') {
          formDataToSend.append('premiumPlans', JSON.stringify(formData.premiumPlans));
        } else if (key === 'pages' || key === 'order') {
          formDataToSend.append(key, String(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append files (only if new files are selected)
      if (thumbnailFile) {
        formDataToSend.append('thumbnail', thumbnailFile);
      }
      if (contentFile) {
        formDataToSend.append('content', contentFile);
      }

      const response = await updateBook(book._id, formDataToSend);
      
      if (response?.success) {
        toast.success('Book updated successfully');
        onSuccess();
        onClose();
      } else {
        toast.error(response?.message || 'Failed to update book');
      }
    } catch (error) {
      console.error('Update book error:', error);
      toast.error(error.message || 'Failed to update book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-green-500/20 dark:border-green-400/10 shadow-2xl shadow-green-500/10 dark:shadow-green-400/5">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-green-500/10 dark:border-green-400/10 bg-white/90 dark:bg-black/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-600 to-green-700 dark:from-green-500 dark:to-green-600 rounded-xl shadow-lg shadow-green-500/30 dark:shadow-green-400/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Update Book</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-green-500/10 dark:hover:bg-green-400/10 rounded-xl transition-all duration-300 hover:scale-110"
          >
            <X className="w-5 h-5 text-gray-900 dark:text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: Book Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
              Book Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/50 border border-green-500/20 dark:border-green-400/10 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="Enter book title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Author Name *
                </label>
                <input
                  type="text"
                  name="authorName"
                  value={formData.authorName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/50 border border-green-500/20 dark:border-green-400/10 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="Enter author name"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                required
                className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/50 border border-green-500/20 dark:border-green-400/10 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                placeholder="Describe your book..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Category *
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/50 border border-green-500/20 dark:border-green-400/10 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="e.g., Technology, Fiction"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/50 border border-green-500/20 dark:border-green-400/10 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="e.g., Programming, Science"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Pages *
                </label>
                <input
                  type="number"
                  name="pages"
                  value={formData.pages}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/50 border border-green-500/20 dark:border-green-400/10 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Edition
                </label>
                <input
                  type="text"
                  name="edition"
                  value={formData.edition}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/50 border border-green-500/20 dark:border-green-400/10 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="e.g., 2nd Edition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Publication
                </label>
                <input
                  type="text"
                  name="publication"
                  value={formData.publication}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/50 border border-green-500/20 dark:border-green-400/10 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="Publisher name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Language *
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/50 border border-green-500/20 dark:border-green-400/10 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/50 border border-green-500/20 dark:border-green-400/10 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Features & About */}
          <div className="border-t border-green-500/10 dark:border-green-400/10 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-green-600 dark:text-green-400" />
              Features & About
            </h3>
            
            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Features
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="Enter a feature"
                  className="flex-1 px-4 py-2.5 bg-white/50 dark:bg-black/50 border border-green-500/20 dark:border-green-400/10 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl transition-all duration-300 hover:scale-105 font-medium"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 dark:bg-green-400/10 text-green-700 dark:text-green-400 rounded-lg text-sm border border-green-500/20 dark:border-green-400/10"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* About */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                About (Key-Value)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aboutKey}
                  onChange={(e) => setAboutKey(e.target.value)}
                  placeholder="Key"
                  className="w-1/3 px-4 py-2.5 bg-white/50 dark:bg-black/50 border border-green-500/20 dark:border-green-400/10 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  value={aboutValue}
                  onChange={(e) => setAboutValue(e.target.value)}
                  placeholder="Value"
                  className="flex-1 px-4 py-2.5 bg-white/50 dark:bg-black/50 border border-green-500/20 dark:border-green-400/10 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={addAbout}
                  className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl transition-all duration-300 hover:scale-105 font-medium"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {Object.entries(formData.about).map(([key, value]) => (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 dark:bg-blue-400/10 text-blue-700 dark:text-blue-400 rounded-lg text-sm border border-blue-500/20 dark:border-blue-400/10"
                  >
                    <strong>{key}:</strong> {value}
                    <button
                      type="button"
                      onClick={() => removeAbout(key)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Media */}
          <div className="border-t border-green-500/10 dark:border-green-400/10 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Image className="w-5 h-5 text-green-600 dark:text-green-400" />
              Media
            </h3>
            
            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Thumbnail Image
              </label>
              <div className="flex items-center gap-4">
                {thumbnailPreview ? (
                  <div className="relative">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-24 h-24 rounded-xl object-cover border-2 border-green-500/30 dark:border-green-400/30"
                    />
                    <button
                      type="button"
                      onClick={removeThumbnail}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-24 h-24 rounded-xl border-2 border-dashed border-green-500/30 dark:border-green-400/30 hover:border-green-500 dark:hover:border-green-400 cursor-pointer transition-colors bg-white/50 dark:bg-black/50">
                    <Upload className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                    <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">Upload</span>
                    <input
                      id="thumbnailInput"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                  </label>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  JPEG, PNG, GIF, WebP (Max 5MB) - Leave empty to keep current
                </p>
              </div>
            </div>

            {/* Content PDF */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Book Content (PDF)
              </label>
              <div className="flex items-center gap-4">
                {contentPreview ? (
                  <div className="flex items-center gap-3 px-4 py-2 bg-green-500/10 dark:bg-green-400/10 rounded-xl border border-green-500/20 dark:border-green-400/10">
                    <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{contentPreview}</span>
                    <button
                      type="button"
                      onClick={removeContent}
                      className="p-1 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center px-6 py-3 rounded-xl border-2 border-dashed border-green-500/30 dark:border-green-400/30 hover:border-green-500 dark:hover:border-green-400 cursor-pointer transition-colors bg-white/50 dark:bg-black/50">
                    <Upload className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                    <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">Upload PDF</span>
                    <input
                      id="contentInput"
                      type="file"
                      accept=".pdf,.epub,.mobi,application/pdf,application/epub+zip"
                      onChange={handleContentChange}
                      className="hidden"
                    />
                  </label>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PDF, EPUB, MOBI (Max 50MB) - Leave empty to keep current
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Type & Status */}
          <div className="border-t border-green-500/10 dark:border-green-400/10 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-green-600 dark:text-green-400" />
              Type & Status
            </h3>

            {/* Type Toggle */}
            <div className="flex items-center gap-4 p-4 bg-green-500/5 dark:bg-green-400/5 rounded-xl border border-green-500/10 dark:border-green-400/10">
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${formData.type === 'free' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  Free
                </span>
                <button
                  type="button"
                  onClick={handleTypeToggle}
                  className="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none"
                  style={{
                    backgroundColor: formData.type === 'premium' ? '#22c55e' : '#6b7280'
                  }}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-md ${
                      formData.type === 'premium' ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
                <span className={`text-sm font-medium ${formData.type === 'premium' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  Premium
                </span>
              </div>
            </div>

            {/* Premium Plans - Simplified Checkboxes */}
            {formData.type === 'premium' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Which Premium Plans Can Access This Book? *
                </label>
                <div className="space-y-2 p-4 bg-green-500/5 dark:bg-green-400/5 rounded-xl border border-green-500/10 dark:border-green-400/10">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Select which subscription plans can access this premium book
                  </p>
                  
                  <div className="flex flex-wrap gap-4">
                    {['basic', 'premium', 'elite'].map((plan) => (
                      <label 
                        key={plan}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.premiumPlans.includes(plan)}
                          onChange={() => handlePremiumPlanToggle(plan)}
                          className="w-4 h-4 text-green-600 border-green-300 rounded focus:ring-green-500 dark:border-green-600 dark:bg-black/50"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {plan}
                        </span>
                      </label>
                    ))}
                  </div>

                  {formData.premiumPlans.length === 0 && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                      Please select at least one plan
                    </p>
                  )}
                  
                  {formData.premiumPlans.length > 0 && (
                    <div className="mt-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Selected: {formData.premiumPlans.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/50 border border-green-500/20 dark:border-green-400/10 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t border-green-500/10 dark:border-green-400/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-green-500/20 dark:border-green-400/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-green-500/5 dark:hover:bg-green-400/5 transition-all duration-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 dark:from-green-500 dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 text-white rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-green-500/30 dark:hover:shadow-green-400/20 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                  Updating...
                </span>
              ) : (
                'Update Book'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateBooks;