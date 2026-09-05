// frontend/src/pages/Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import authService from '../../services/auth.service';
import { 
  User, Mail, Phone, Briefcase, Calendar, 
  CheckCircle, XCircle, Edit2, LogOut, Save, X,
  AlertCircle, AtSign, Cake, Home, Sparkles,
  Crown, Clock, Upload, Image,
  Camera,
  FileText,
  StarCheck
} from 'lucide-react';
import MainButton from '../../components/style/MainButton';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, checkAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    phone: '',
    age: '',
    city: '',
    profession: '',
    bio: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isUsernameChecking, setIsUsernameChecking] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [remainingDays, setRemainingDays] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
      if (response.success && response.data && response.data.user) {
        const userData = response.data.user;
        setFormData({
          name: userData.name || '',
          username: userData.username || '',
          phone: userData.phone || '',
          age: userData.age || '',
          city: userData.city || '',
          profession: userData.profession || '',
          bio: userData.bio || ''
        });
        // SAFELY set profile picture
        const profilePic = userData.profilePicture || null;
        setProfilePicture(profilePic);
        setProfilePicturePreview(profilePic);
        
        // Get subscription details
        if (userData.activeSubscription) {
          setSubscription(userData.activeSubscription);
          calculateRemainingDays(userData.activeSubscription.endDate);
        }
        
        await checkAuth();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setErrors({ general: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const calculateRemainingDays = (endDate) => {
    if (!endDate) return 0;
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setRemainingDays(diffDays > 0 ? diffDays : 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (name === 'username' && errors.username) {
      setErrors(prev => ({ ...prev, username: '' }));
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        // toast.error('Please select an image file');
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        // toast.error('Image size should be less than 5MB');
        alert('Image size should be less than 5MB');
        return;
      }
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePictureClick = () => {
    if (editing) {
      // In edit mode: open file upload
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    } else {
      // In view mode: open image popup
      if (profilePicturePreview) {
        setShowImageModal(true);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (formData.username.trim() && formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    if (formData.username.trim() && !/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }
    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (formData.age && (formData.age < 1 || formData.age > 120)) {
      newErrors.age = 'Age must be between 1 and 120';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccess('');
    setErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      // Check username uniqueness
      if (formData.username !== user?.username) {
        setIsUsernameChecking(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsUsernameChecking(false);
      }

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('username', formData.username.trim().toLowerCase());
      if (formData.phone) formDataToSend.append('phone', formData.phone.trim());
      if (formData.age) formDataToSend.append('age', formData.age);
      if (formData.city) formDataToSend.append('city', formData.city.trim());
      if (formData.profession) formDataToSend.append('profession', formData.profession.trim());
      if (formData.bio) formDataToSend.append('bio', formData.bio.trim());
      
      // Append profile picture if changed
      if (profilePicture && typeof profilePicture !== 'string') {
        formDataToSend.append('profilePicture', profilePicture);
      }

      const response = await authService.updateProfile(formDataToSend);
      if (response.success) {
        setSuccess('Profile updated successfully!');
        setEditing(false);
        await checkAuth();
        await fetchProfile();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.message?.includes('username') || error.message?.includes('duplicate')) {
        setErrors({ username: 'Username is already taken. Please choose another' });
      } else {
        setErrors({ general: error.message || 'Failed to update profile' });
      }
    } finally {
      setIsUsernameChecking(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      setErrors({ general: 'Failed to logout' });
    } finally {
      setShowLogoutModal(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setErrors({});
    setSuccess('');
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        phone: user.phone || '',
        age: user.age || '',
        city: user.city || '',
        profession: user.profession || '',
        bio: user.bio || ''
      });
      setProfilePicturePreview(user.profilePicture || null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0505] relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
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
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 border-3 border-[rgba(200,150,62,0.1)] border-t-[#c8963e] rounded-full animate-spin" />
          </div>
          <p className="mt-4 text-[#d4b8a0] animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  // If user is null, show error or redirect
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0505] relative overflow-hidden flex items-center justify-center">
        <div className="relative z-10 text-center">
          <p className="text-[#d4b8a0] text-lg">Please login to view your profile</p>
          <button
            onClick={() => navigate('/auth/signin')}
            className="mt-4 px-6 py-2 bg-[#c8963e] text-white rounded-lg hover:bg-[#d4a85a] transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0505] relative overflow-hidden flex items-center justify-center p-4 md:p-8">
      {/* Background - same as before */}
      <div className="absolute inset-0 overflow-hidden">
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
        <div className="absolute top-1/4 right-1/4 w-64 h-64 
                      bg-[#c8963e]/5 rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 
                      bg-[#d4a85a]/5 rounded-full blur-2xl" />
        <div className="absolute top-1/3 left-1/3 w-40 h-40 
                      bg-[#d4a85a]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-40 h-40 
                      bg-[#c8963e]/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-2xl">
        <div className="relative rounded-3xl p-8 sm:p-10 lg:p-12
                      backdrop-blur-xl bg-[#1a0a0a]/60
                      border border-[#c8963e]/20
                      shadow-[0_0_60px_rgba(200,150,62,0.05)]
                      transition-all duration-500
                      hover:shadow-[0_0_80px_rgba(200,150,62,0.1)]
                      hover:border-[#c8963e]/30">
          
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8963e]/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8963e]/20 to-transparent" />
            <div className="absolute top-0 left-0 w-px h-1/2 bg-gradient-to-b from-[#c8963e]/20 to-transparent" />
            <div className="absolute top-0 right-0 w-px h-1/2 bg-gradient-to-b from-[#c8963e]/20 to-transparent" />
          </div>

          {/* Profile Badge */}
          <div className="text-center relative mb-8">
            <div className="inline-block mb-4">
              <span className="px-4 py-1.5 rounded-full bg-[#c8963e]/10 border border-[#c8963e]/20 
                             text-[#d4a85a] text-xs sm:text-sm font-semibold tracking-wider uppercase
                             backdrop-blur-sm inline-flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                Profile
              </span>
            </div>

            {/* Avatar with Click Handler */}
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-[#c8963e]/20 rounded-full blur-2xl animate-pulse" />
              <div 
                className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full
                          bg-gradient-to-br from-[#c8963e]/30 to-[#d4a85a]/20
                          border-2 border-[#c8963e]/40
                          flex items-center justify-center
                          shadow-[0_0_40px_rgba(200,150,62,0.15)]
                          transition-transform duration-300 hover:scale-105
                          overflow-hidden cursor-pointer"
                onClick={handleProfilePictureClick}
              >
                {profilePicturePreview ? (
                  <img 
                    src={profilePicturePreview} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl sm:text-4xl font-bold text-[#d4a85a]">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
                {/* Camera icon only shown in edit mode */}
                {editing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
              {user?.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full 
                              bg-gradient-to-r from-[#00cc88] to-[#00e699]
                              border-2 border-[#0a0505]
                              flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-3.5 h-3.5 text-[#0a0505]" />
                </div>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-[#f5e6c8] mt-4 
                          transition-all duration-300 hover:text-[#d4a85a]">
              {user?.name || 'User'}
            </h2>
            <p className="text-[#d4b8a0] text-sm flex items-center justify-center gap-1.5">
              <AtSign className="w-3.5 h-3.5 text-[#c8963e]" />
              {user?.username || ''}
            </p>
            {user?.bio && (
              <p className="text-[#d4b8a0] text-sm flex items-center justify-center gap-1.5">
                <StarCheck className="w-3.5 h-3.5 text-[#c8963e]" />
                {user?.bio}
              </p>
            )}

            {/* Active Subscription */}
            {subscription && subscription.subscriptionStatus === 'active' && (
              <div className="mt-4 p-4 rounded-xl bg-[#c8963e]/10 border border-[#c8963e]/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Crown className="w-5 h-5 text-[#d4a85a]" />
                    <div className="text-left">
                      <p className="text-[#d4a85a] text-sm font-semibold">
                        {subscription.planName} Plan
                      </p>
                      <p className="text-[#d4b8a0] text-xs">
                        ₹{subscription.sellingPrice} / {subscription.validity?.value} {subscription.validity?.unit}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#d4a85a]" />
                      <span className="text-[#d4a85a] font-semibold">
                        {remainingDays > 0 ? `${remainingDays} days left` : 'Expired'}
                      </span>
                    </div>
                    <p className="text-[#d4b8a0] text-xs">
                      Expires: {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rest of the component remains the same */}
          {/* Decorative Divider */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#c8963e]/20" />
            <Sparkles className="w-3 h-3 text-[#c8963e]/30" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#c8963e]/20" />
          </div>

          {/* Messages */}
          {errors.general && (
            <div className="mb-4 p-3 rounded-xl bg-[rgba(200,50,50,0.15)] border border-[rgba(200,50,50,0.3)] text-[#ff6b6b] text-sm animate-slide-down flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errors.general}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-[rgba(0,200,100,0.1)] border border-[rgba(0,200,100,0.2)] text-[#66ffaa] text-sm animate-slide-down flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              {success}
            </div>
          )}

          {/* Content */}
          <div className="mt-2">
            {editing ? (
              <form onSubmit={handleUpdate} className="space-y-4 animate-fade-in">
                {/* Name Field */}
                <div className="space-y-1.5">
                  <label className="text-[#d4b8a0] text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#c8963e]" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                    className={`w-full px-4 py-3 bg-[rgba(10,5,5,0.6)] border ${
                      errors.name ? 'border-[#ff6b6b]' : 'border-[rgba(200,150,62,0.2)]'
                    } rounded-xl text-[#f5e6c8] placeholder-[#5a3d2a] focus:outline-none focus:border-[#c8963e] focus:shadow-[0_0_30px_rgba(200,150,62,0.1)] transition-all duration-300`}
                  />
                  {errors.name && <p className="text-[#ff6b6b] text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-[#d4b8a0] text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                    <AtSign className="w-3.5 h-3.5 text-[#c8963e]" />
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Enter username"
                      required
                      className={`w-full px-4 py-3 bg-[rgba(10,5,5,0.6)] border ${
                        errors.username ? 'border-[#ff6b6b]' : 'border-[rgba(200,150,62,0.2)]'
                      } rounded-xl text-[#f5e6c8] placeholder-[#5a3d2a] focus:outline-none focus:border-[#c8963e] focus:shadow-[0_0_30px_rgba(200,150,62,0.1)] transition-all duration-300`}
                    />
                    {isUsernameChecking && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-[#c8963e] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  {errors.username && <p className="text-[#ff6b6b] text-xs mt-1">{errors.username}</p>}
                </div>

                {/* Email - Read Only */}
                <div className="space-y-1.5">
                  <label className="text-[#d4b8a0] text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#c8963e]" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 bg-[rgba(10,5,5,0.3)] border border-[rgba(200,150,62,0.1)] rounded-xl text-[#5a3d2a] cursor-not-allowed"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-[#d4b8a0] text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#c8963e]" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className={`w-full px-4 py-3 bg-[rgba(10,5,5,0.6)] border ${
                      errors.phone ? 'border-[#ff6b6b]' : 'border-[rgba(200,150,62,0.2)]'
                    } rounded-xl text-[#f5e6c8] placeholder-[#5a3d2a] focus:outline-none focus:border-[#c8963e] focus:shadow-[0_0_30px_rgba(200,150,62,0.1)] transition-all duration-300`}
                  />
                  {errors.phone && <p className="text-[#ff6b6b] text-xs mt-1">{errors.phone}</p>}
                </div>

                {/* Age & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[#d4b8a0] text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                      <Cake className="w-3.5 h-3.5 text-[#c8963e]" />
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="Age"
                      min="1"
                      max="120"
                      className={`w-full px-4 py-3 bg-[rgba(10,5,5,0.6)] border ${
                        errors.age ? 'border-[#ff6b6b]' : 'border-[rgba(200,150,62,0.2)]'
                      } rounded-xl text-[#f5e6c8] placeholder-[#5a3d2a] focus:outline-none focus:border-[#c8963e] focus:shadow-[0_0_30px_rgba(200,150,62,0.1)] transition-all duration-300`}
                    />
                    {errors.age && <p className="text-[#ff6b6b] text-xs mt-1">{errors.age}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[#d4b8a0] text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                      <Home className="w-3.5 h-3.5 text-[#c8963e]" />
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter your city"
                      className="w-full px-4 py-3 bg-[rgba(10,5,5,0.6)] border border-[rgba(200,150,62,0.2)] rounded-xl text-[#f5e6c8] placeholder-[#5a3d2a] focus:outline-none focus:border-[#c8963e] focus:shadow-[0_0_30px_rgba(200,150,62,0.1)] transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Profession */}
                <div className="space-y-1.5">
                  <label className="text-[#d4b8a0] text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-[#c8963e]" />
                    Profession
                  </label>
                  <input
                    type="text"
                    name="profession"
                    value={formData.profession}
                    onChange={handleInputChange}
                    placeholder="Enter your profession"
                    className="w-full px-4 py-3 bg-[rgba(10,5,5,0.6)] border border-[rgba(200,150,62,0.2)] rounded-xl text-[#f5e6c8] placeholder-[#5a3d2a] focus:outline-none focus:border-[#c8963e] focus:shadow-[0_0_30px_rgba(200,150,62,0.1)] transition-all duration-300"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-1.5">
                  <label className="text-[#d4b8a0] text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#c8963e]" />
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    rows="3"
                    className="w-full px-4 py-3 bg-[rgba(10,5,5,0.6)] border border-[rgba(200,150,62,0.2)] rounded-xl text-[#f5e6c8] placeholder-[#5a3d2a] focus:outline-none focus:border-[#c8963e] focus:shadow-[0_0_30px_rgba(200,150,62,0.1)] transition-all duration-300 resize-none"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <MainButton
                    text="Cancel"
                    variant="secondary"
                    onClick={cancelEdit}
                    className="flex-1"
                  />
                  <MainButton
                    text="Save Changes"
                    variant="primary"
                    type="submit"
                    className="flex-1"
                  />
                </div>
              </form>
            ) : (
              // View Mode
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between py-3 border-b border-[rgba(200,150,62,0.08)]">
                  <span className="text-[#d4b8a0] text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#c8963e]" />
                    Email
                  </span>
                  <span className="text-[#f5e6c8] text-sm">{user?.email || 'Not provided'}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-[rgba(200,150,62,0.08)]">
                  <span className="text-[#d4b8a0] text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                    <AtSign className="w-3.5 h-3.5 text-[#c8963e]" />
                    Username
                  </span>
                  <span className="text-[#f5e6c8] text-sm">@{user?.username || 'Not provided'}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-[rgba(200,150,62,0.08)]">
                  <span className="text-[#d4b8a0] text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#c8963e]" />
                    Phone
                  </span>
                  <span className="text-[#f5e6c8] text-sm">{user?.phone || 'Not provided'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                  <div className="flex items-center justify-between py-3 border-b border-[rgba(200,150,62,0.08)] sm:border-b-0 sm:border-r border-[rgba(200,150,62,0.08)] sm:pr-6">
                    <span className="text-[#d4b8a0] text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                      <Cake className="w-3.5 h-3.5 text-[#c8963e]" />
                      Age
                    </span>
                    <span className="text-[#f5e6c8] text-sm">{user?.age || 'Not provided'}</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-[rgba(200,150,62,0.08)] sm:pl-6">
                    <span className="text-[#d4b8a0] text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                      <Home className="w-3.5 h-3.5 text-[#c8963e]" />
                      City
                    </span>
                    <span className="text-[#f5e6c8] text-sm">{user?.city || 'Not provided'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-[rgba(200,150,62,0.08)]">
                  <span className="text-[#d4b8a0] text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-[#c8963e]" />
                    Profession
                  </span>
                  <span className="text-[#f5e6c8] text-sm">{user?.profession || 'Not provided'}</span>
                </div>

                {user?.bio && (
                  <div className="flex items-start justify-between py-3 border-b border-[rgba(200,150,62,0.08)]">
                    <span className="text-[#d4b8a0] text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-[#c8963e]" />
                      Bio
                    </span>
                    <span className="text-[#f5e6c8] text-sm text-right max-w-[60%]">{user.bio}</span>
                  </div>
                )}

                <div className="flex items-center justify-between py-3">
                  <span className="text-[#d4b8a0] text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#c8963e]" />
                    Member Since
                  </span>
                  <span className="text-[#f5e6c8] text-sm">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {!editing && (
            <div className="mt-8 pt-6 border-t border-[rgba(200,150,62,0.1)] flex flex-col sm:flex-row gap-3">
              <MainButton
                text="Edit Profile"
                variant="secondary"
                onClick={() => setEditing(true)}
                className="flex-1"
              />
              <MainButton
                text="Logout"
                variant="danger"
                onClick={() => setShowLogoutModal(true)}
                className="flex-1"
              />
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {showImageModal && profilePicturePreview && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setShowImageModal(false)}
        >
          <div 
            className="relative max-w-2xl max-h-[90vh] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img 
              src={profilePicturePreview} 
              alt="Profile" 
              className="w-full h-full object-contain rounded-2xl shadow-[0_0_60px_rgba(200,150,62,0.15)]"
            />
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setShowLogoutModal(false)}
        >
          <div 
            className="relative rounded-2xl p-8 max-w-md w-full mx-4
                      backdrop-blur-xl bg-[#1a0a0a]/80
                      border border-[rgba(200,150,62,0.2)]
                      shadow-[0_0_60px_rgba(200,150,62,0.05)]
                      animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8963e]/30 to-transparent" />
            </div>
            
            <div className="text-center relative">
              <div className="w-20 h-20 mx-auto rounded-full bg-[rgba(200,50,50,0.15)] 
                            border border-[rgba(200,50,50,0.3)] flex items-center justify-center mb-4
                            shadow-[0_0_40px_rgba(200,50,50,0.1)]">
                <LogOut className="w-10 h-10 text-[#ff6b6b]" />
              </div>
              <h3 className="text-2xl font-bold text-[#f5e6c8] mb-2">Confirm Logout</h3>
              <p className="text-[#d4b8a0] text-sm leading-relaxed mb-6">
                Are you sure you want to logout? You'll need to login again to access your account.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <MainButton
                  text="Cancel"
                  variant="secondary"
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1"
                />
                <MainButton
                  text="Yes, Logout"
                  variant="danger"
                  onClick={handleLogout}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;