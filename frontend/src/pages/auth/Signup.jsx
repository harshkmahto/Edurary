// frontend/src/pages/Signup.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, verifyOTP, resendOTP } from '../../services/auth.service';

const Signup = () => {
  const navigate = useNavigate();
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '', // Optional
  });
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (error) setError('');
  };

  // Handle OTP input change
  const handleOtpChange = (e) => {
    setOtp(e.target.value.replace(/\D/g, ''));
    if (error) setError('');
  };

  // Handle Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate required fields only (name, username, email)
    if (!formData.name || !formData.name.trim()) {
      setError('Full name is required');
      setLoading(false);
      return;
    }

    if (!formData.username || !formData.username.trim()) {
      setError('Username is required');
      setLoading(false);
      return;
    }

    if (!formData.email || !formData.email.trim()) {
      setError('Email address is required');
      setLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Phone is optional - only validate if provided
    let phoneData = undefined;
    if (formData.phone && formData.phone.trim()) {
      phoneData = formData.phone.trim();
    }

    try {
      const response = await register({
        name: formData.name.trim(),
        username: formData.username.trim().toLowerCase(),
        email: formData.email.trim().toLowerCase(),
        phone: phoneData, // Will be undefined if not provided
      });

      if (response.success) {
        setUserId(response.data.user.id);
        setShowOtp(true);
      }
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      const response = await verifyOTP({
        email: formData.email.trim().toLowerCase(),
        otp: otp,
      });

      if (response.success) {
        navigate('/auth/signin', { 
          state: { 
            message: 'Registration successful! Please login.' 
          } 
        });
      }
    } catch (error) {
      setError(error.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    try {
      await resendOTP(formData.email.trim().toLowerCase());
      alert(`📨 New OTP sent to ${formData.email}`);
    } catch (error) {
      setError(error.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // Handle Back to Registration
  const handleBackToRegister = () => {
    setShowOtp(false);
    setOtp('');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white font-manrope">
            {showOtp ? 'Verify Email' : 'Create Account'}
          </h1>
          <p className="text-[#898989] text-lg mt-1 flex items-center gap-2">
            {showOtp ? (
              `OTP sent to ${formData.email}`
            ) : (
              <>
                Already have an account?{' '}
                <Link to="/auth/signin" className="text-[#d4a85a] hover:text-[#d4a08a] transition-colors font-medium">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Registration Form */}
        {!showOtp ? (
          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            {/* Name - Required */}
            <div>
              <label htmlFor="name" className="block text-white/80 text-lg font-light mb-2">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full bg-[#0a0a0a] border border-[#232323] rounded-lg px-5 py-3 text-white placeholder-[#898989] text-lg outline-none focus:border-[#A3A3A3] transition-all"
                required
                disabled={loading}
              />
            </div>

            {/* Username - Required */}
            <div>
              <label htmlFor="username" className="block text-white/80 text-lg font-light mb-2">
                Username <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                className="w-full bg-[#0a0a0a] border border-[#232323] rounded-lg px-5 py-3 text-white placeholder-[#898989] text-lg outline-none focus:border-[#A3A3A3] transition-all"
                required
                disabled={loading}
              />
            </div>

            {/* Email - Required */}
            <div>
              <label htmlFor="email" className="block text-white/80 text-lg font-light mb-2">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                className="w-full bg-[#0a0a0a] border border-[#232323] rounded-lg px-5 py-3 text-white placeholder-[#898989] text-lg outline-none focus:border-[#A3A3A3] transition-all"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-white/80 text-lg font-light mb-2">
                Phone Number 
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number (optional)"
                className="w-full bg-[#0a0a0a] border border-[#232323] rounded-lg px-5 py-3 text-white placeholder-[#898989] text-lg outline-none focus:border-[#A3A3A3] transition-all"
                // ✅ NO required attribute here!
                disabled={loading}
              />
              <p className="text-[#898989] text-xs mt-1">
                Phone number is optional and can be added later
              </p>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#be880c] hover:bg-yellow-500 text-white font-bold text-lg py-3.5 rounded-lg transition-all shadow-lg hover:shadow-xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        ) : (
          /* OTP Verification Form */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-white/80 text-lg font-light mb-2">
                Enter OTP Code
              </label>
              <input
                type="text"
                id="otp"
                maxLength={6}
                value={otp}
                onChange={handleOtpChange}
                placeholder="Enter 6-digit OTP"
                className="w-full bg-[#0a0a0a] border border-[#232323] rounded-lg px-5 py-3 text-white placeholder-[#898989] text-lg outline-none focus:border-[#A3A3A3] transition-all text-center tracking-widest"
                required
                disabled={loading}
              />
              <p className="text-[#898989] text-sm mt-2">
                OTP sent to <span className="text-white">{formData.email}</span>
              </p>
            </div>

            {/* Verify OTP Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#be880c] hover:bg-yellow-500 text-white font-bold text-lg py-3.5 rounded-lg transition-all shadow-lg hover:shadow-xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify & Complete Registration'}
            </button>

            {/* Resend OTP */}
            <div className="flex items-center justify-between mt-2">
              <button
                type="button"
                onClick={handleBackToRegister}
                className="text-[#898989] hover:text-white text-sm transition-colors"
                disabled={loading}
              >
                ← Back to registration
              </button>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="text-[#d4a85a] hover:text-[#d4a08a] text-sm transition-colors disabled:opacity-50"
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Signup;