import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload } from 'lucide-react';
import { updateCourse } from '../../services/course.service';
import toast from 'react-hot-toast';

const UpdateCourse = ({ course, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subject: '',
    languages: [],
    instructors: [{ name: '', bio: '', email: '' }],
    features: [],
    about: {},
    lessons: [{ sectionName: '', videoLink: '', isPublic: true, duration: 0 }],
    type: 'free',
    premiumPlans: [],
    courseStatus: 'draft',
    order: 0
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [instructorProfiles, setInstructorProfiles] = useState([]);
  const [instructorProfilePreviews, setInstructorProfilePreviews] = useState([]);
  const [languageInput, setLanguageInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        category: course.category || '',
        subject: course.subject || '',
        languages: course.languages || [],
        instructors: course.instructors || [{ name: '', bio: '', email: '' }],
        features: course.features || [],
        about: course.about || {},
        lessons: course.lessons || [{ sectionName: '', videoLink: '', isPublic: true, duration: 0 }],
        type: course.type || 'free',
        premiumPlans: course.premiumPlans || [],
        courseStatus: course.courseStatus || 'draft',
        order: course.order || 0
      });
      
      if (course.thumbnail) {
        setThumbnailPreview(course.thumbnail);
      }

      // Set instructor profile previews if they exist
      if (course.instructors) {
        const previews = course.instructors.map(instructor => instructor.profile || null);
        setInstructorProfilePreviews(previews);
      }
    }
  }, [course]);

  // ========== FORM HANDLERS ==========
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ========== LANGUAGE MANAGEMENT ==========
  const handleAddLanguage = () => {
    if (languageInput.trim() && !formData.languages.includes(languageInput.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, languageInput.trim()]
      }));
      setLanguageInput('');
    }
  };

  const handleRemoveLanguage = (lang) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== lang)
    }));
  };

  const handleLanguageKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddLanguage();
    }
  };

  // ========== FEATURES MANAGEMENT ==========
  const handleAddFeature = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const handleFeatureKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddFeature();
    }
  };

  // ========== INSTRUCTOR MANAGEMENT ==========
  const handleInstructorChange = (index, field, value) => {
    const updated = [...formData.instructors];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, instructors: updated }));
  };

  const addInstructor = () => {
    setFormData(prev => ({
      ...prev,
      instructors: [...prev.instructors, { name: '', bio: '', email: '' }]
    }));
    setInstructorProfilePreviews(prev => [...prev, null]);
  };

  const removeInstructor = (index) => {
    if (formData.instructors.length <= 1) return;
    const updated = formData.instructors.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, instructors: updated }));
    setInstructorProfilePreviews(prev => prev.filter((_, i) => i !== index));
    setInstructorProfiles(prev => prev.filter((_, i) => i !== index));
  };

  // ========== LESSON MANAGEMENT ==========
  const handleLessonChange = (index, field, value) => {
    const updated = [...formData.lessons];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, lessons: updated }));
  };

  const toggleLessonPublic = (index) => {
    const updated = [...formData.lessons];
    updated[index].isPublic = !updated[index].isPublic;
    setFormData(prev => ({ ...prev, lessons: updated }));
  };

  const addLesson = () => {
    setFormData(prev => ({
      ...prev,
      lessons: [...prev.lessons, { sectionName: '', videoLink: '', isPublic: true, duration: 0 }]
    }));
  };

  const removeLesson = (index) => {
    if (formData.lessons.length <= 1) return;
    const updated = formData.lessons.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, lessons: updated }));
  };

  // ========== ABOUT MANAGEMENT ==========
  const handleAboutChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      about: { ...prev.about, [key]: value }
    }));
  };

  const addAboutKey = () => {
    setFormData(prev => ({
      ...prev,
      about: { ...prev.about, ['']: '' }
    }));
  };

  const removeAboutKey = (key) => {
    const updated = { ...formData.about };
    delete updated[key];
    setFormData(prev => ({ ...prev, about: updated }));
  };

  // ========== FILE HANDLERS ==========
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
  };

  const handleInstructorProfileChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const files = [...instructorProfiles];
      files[index] = file;
      setInstructorProfiles(files);

      const reader = new FileReader();
      reader.onload = (e) => {
        const previews = [...instructorProfilePreviews];
        previews[index] = e.target.result;
        setInstructorProfilePreviews(previews);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeInstructorProfile = (index) => {
    const files = [...instructorProfiles];
    files[index] = null;
    setInstructorProfiles(files);
    
    const previews = [...instructorProfilePreviews];
    previews[index] = null;
    setInstructorProfilePreviews(previews);
  };

  // ========== TOGGLE SWITCH COMPONENT ==========
  const ToggleSwitch = ({ isOn, onToggle, label }) => (
    <div className="flex items-center gap-3">
      <span className="text-sm text-emerald-600 dark:text-emerald-400">{label}</span>
      <button
        type="button"
        onClick={onToggle}
        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
          isOn ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 shadow-md ${
            isOn ? 'transform translate-x-6' : ''
          }`}
        />
      </button>
      <span className={`text-sm font-medium ${isOn ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
        {isOn ? 'Public' : 'Private'}
      </span>
    </div>
  );

  // ========== SUBMIT ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      Object.keys(formData).forEach(key => {
        if (key === 'instructors' || key === 'lessons' || key === 'features' || 
            key === 'about' || key === 'languages' || key === 'premiumPlans') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (thumbnail) {
        formDataToSend.append('thumbnail', thumbnail);
      }

      instructorProfiles.forEach(file => {
        if (file) {
          formDataToSend.append('instructorProfiles', file);
        }
      });

      const response = await updateCourse(course._id, formDataToSend);
      toast.success('Course updated successfully!');
      onSuccess(response);
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white dark:bg-black rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-emerald-200/30 dark:border-emerald-800/30">
        <div className="sticky top-0 bg-white dark:bg-black p-4 border-b border-emerald-200/30 dark:border-emerald-800/30 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Update Course</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-lg border border-emerald-200/30 dark:border-emerald-800/30 bg-white dark:bg-black px-3 py-2 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300">Category *</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-lg border border-emerald-200/30 dark:border-emerald-800/30 bg-white dark:bg-black px-3 py-2 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300">Subject *</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-lg border border-emerald-200/30 dark:border-emerald-800/30 bg-white dark:bg-black px-3 py-2 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="3"
              className="mt-1 block w-full rounded-lg border border-emerald-200/30 dark:border-emerald-800/30 bg-white dark:bg-black px-3 py-2 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          {/* Thumbnail with Preview and Close */}
          <div>
            <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300">Thumbnail</label>
            <div className="mt-1">
              {thumbnailPreview ? (
                <div className="relative inline-block">
                  <img src={thumbnailPreview} alt="Thumbnail preview" className="w-32 h-32 object-cover rounded-lg border border-emerald-200/30 dark:border-emerald-800/30" />
                  <button
                    type="button"
                    onClick={removeThumbnail}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-emerald-200/30 dark:border-emerald-800/30 rounded-lg hover:border-emerald-500 transition-colors">
                  <label className="cursor-pointer flex flex-col items-center gap-1 p-4">
                    <Upload className="w-6 h-6 text-emerald-400 dark:text-emerald-500" />
                    <span className="text-xs text-emerald-500 dark:text-emerald-400">Upload New</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Language with Tags */}
          <div>
            <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300">Languages</label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={languageInput}
                onChange={(e) => setLanguageInput(e.target.value)}
                onKeyDown={handleLanguageKeyDown}
                placeholder="Type language and press Enter"
                className="flex-1 rounded-lg border border-emerald-200/30 dark:border-emerald-800/30 bg-white dark:bg-black px-3 py-2 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddLanguage}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.languages.map((lang) => (
                <span key={lang} className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-full text-sm">
                  {lang}
                  <button
                    type="button"
                    onClick={() => handleRemoveLanguage(lang)}
                    className="hover:text-red-600 dark:hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Features with Tags */}
          <div>
            <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300">Features</label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={handleFeatureKeyDown}
                placeholder="Type feature and press Enter"
                className="flex-1 rounded-lg border border-emerald-200/30 dark:border-emerald-800/30 bg-white dark:bg-black px-3 py-2 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.features.map((feature) => (
                <span key={feature} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                  {feature}
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(feature)}
                    className="hover:text-red-600 dark:hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Instructors with Profile Preview */}
          <div>
            <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2">Instructors *</label>
            {formData.instructors.map((instructor, index) => (
              <div key={index} className="border border-emerald-200/30 dark:border-emerald-800/30 rounded-lg p-4 mb-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Name *"
                    value={instructor.name}
                    onChange={(e) => handleInstructorChange(index, 'name', e.target.value)}
                    required
                    className="rounded-lg border border-emerald-200/30 dark:border-emerald-800/30 bg-white dark:bg-black px-3 py-2 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <input
                    placeholder="Email"
                    value={instructor.email}
                    onChange={(e) => handleInstructorChange(index, 'email', e.target.value)}
                    className="rounded-lg border border-emerald-200/30 dark:border-emerald-800/30 bg-white dark:bg-black px-3 py-2 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <textarea
                    placeholder="Bio"
                    value={instructor.bio}
                    onChange={(e) => handleInstructorChange(index, 'bio', e.target.value)}
                    rows="2"
                    className="col-span-2 rounded-lg border border-emerald-200/30 dark:border-emerald-800/30 bg-white dark:bg-black px-3 py-2 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <div className="col-span-2">
                    <label className="block text-sm text-emerald-600 dark:text-emerald-400">Profile Photo</label>
                    <div className="flex items-center gap-3 mt-1">
                      {instructorProfilePreviews[index] ? (
                        <div className="relative">
                          <img src={instructorProfilePreviews[index]} alt="Profile" className="w-12 h-12 rounded-full object-cover border border-emerald-200/30 dark:border-emerald-800/30" />
                          <button
                            type="button"
                            onClick={() => removeInstructorProfile(index)}
                            className="absolute -top-1 -right-1 p-0.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors text-sm">
                          <Upload className="w-4 h-4 inline mr-1" />
                          Upload Photo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleInstructorProfileChange(index, e)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                  {formData.instructors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInstructor(index)}
                      className="col-span-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
                    >
                      <Trash2 className="w-4 h-4 inline mr-1" />
                      Remove Instructor
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addInstructor}
              className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Instructor
            </button>
          </div>

          {/* Lessons with Toggle Switch */}
          <div>
            <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2">Lessons</label>
            {formData.lessons.map((lesson, index) => (
              <div key={index} className="border border-emerald-200/30 dark:border-emerald-800/30 rounded-lg p-4 mb-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Section Name *"
                    value={lesson.sectionName}
                    onChange={(e) => handleLessonChange(index, 'sectionName', e.target.value)}
                    required
                    className="rounded-lg border border-emerald-200/30 dark:border-emerald-800/30 bg-white dark:bg-black px-3 py-2 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <input
                    placeholder="Video Link *"
                    value={lesson.videoLink}
                    onChange={(e) => handleLessonChange(index, 'videoLink', e.target.value)}
                    required
                    className="rounded-lg border border-emerald-200/30 dark:border-emerald-800/30 bg-white dark:bg-black px-3 py-2 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <input
                    type="number"
                    placeholder="Duration (minutes)"
                    value={lesson.duration}
                    onChange={(e) => handleLessonChange(index, 'duration', parseInt(e.target.value) || 0)}
                    className="rounded-lg border border-emerald-200/30 dark:border-emerald-800/30 bg-white dark:bg-black px-3 py-2 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <div className="flex items-center">
                    <ToggleSwitch
                      isOn={lesson.isPublic}
                      onToggle={() => toggleLessonPublic(index)}
                      label="Visibility:"
                    />
                  </div>
                  {formData.lessons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLesson(index)}
                      className="col-span-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
                    >
                      <Trash2 className="w-4 h-4 inline mr-1" />
                      Remove Lesson
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addLesson}
              className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Lesson
            </button>
          </div>

          {/* About */}
          <div>
            <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2">About (Key-Value)</label>
            {Object.entries(formData.about).map(([key, value]) => (
              <div key={key} className="flex gap-2 mb-2">
                <input
                  placeholder="Key"
                  value={key}
                  onChange={(e) => {
                    const oldKey = key;
                    const newKey = e.target.value;
                    const updated = { ...formData.about };
                    if (oldKey !== newKey) {
                      delete updated[oldKey];
                      updated[newKey] = value;
                    }
                    setFormData(prev => ({ ...prev, about: updated }));
                  }}
                  className="flex-1 rounded-lg border border-emerald-200/30 dark:border-emerald-800/30 bg-white dark:bg-black px-3 py-2 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500"
                />
                <input
                  placeholder="Value"
                  value={value}
                  onChange={(e) => handleAboutChange(key, e.target.value)}
                  className="flex-1 rounded-lg border border-emerald-200/30 dark:border-emerald-800/30 bg-white dark:bg-black px-3 py-2 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => removeAboutKey(key)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addAboutKey}
              className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Detail
            </button>
          </div>

          {/* Type and Premium Plans */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-emerald-200/30 dark:border-emerald-800/30 bg-white dark:bg-black px-3 py-2 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500"
              >
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            {formData.type === 'premium' && (
              <div>
                <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300">Premium Plans</label>
                <select
                  multiple
                  value={formData.premiumPlans}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData(prev => ({ ...prev, premiumPlans: values }));
                  }}
                  className="mt-1 block w-full rounded-lg border border-emerald-200/30 dark:border-emerald-800/30 bg-white dark:bg-black px-3 py-2 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="elite">Elite</option>
                </select>
                <p className="text-xs text-emerald-500 dark:text-emerald-400/60 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>
            )}
          </div>

          {/* Course Status */}
          <div>
            <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300">Course Status</label>
            <select
              name="courseStatus"
              value={formData.courseStatus}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-emerald-200/30 dark:border-emerald-800/30 bg-white dark:bg-black px-3 py-2 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500"
            >
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t border-emerald-200/30 dark:border-emerald-800/30">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-emerald-200/30 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateCourse;