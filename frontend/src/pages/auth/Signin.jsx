// frontend/src/pages/Signin.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login, verifyLoginOTP } from '../../services/auth.service';
import { useAuth } from '../../context/authContext';
import MainButton from '../../components/style/MainButton';

const Signin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuth, user, isAuthenticated } = useAuth();
  
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'username'
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isSliding, setIsSliding] = useState(false);

  const inputRefs = useRef([]);


  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [location]);

  // Timer for resend OTP
  useEffect(() => {
    let interval;
    if (showOtp && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [showOtp, timer]);

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    const newValue = value.replace(/\D/g, '');
    if (newValue.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = newValue;
    setOtp(newOtp);

    if (newValue && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    if (error) setError('');
  };

  // Handle OTP keydown
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedNumbers = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (pastedNumbers.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedNumbers.length && i < 6; i++) {
        newOtp[i] = pastedNumbers[i];
      }
      setOtp(newOtp);
      
      const nextIndex = Math.min(pastedNumbers.length, 5);
      inputRefs.current[nextIndex].focus();
    }
  };

  // Toggle between Email and Username with animation
  const toggleLoginMethod = (method) => {
    if (method === loginMethod) return;
    setIsSliding(true);
    setTimeout(() => {
      setLoginMethod(method);
      setError('');
      setTimeout(() => {
        setIsSliding(false);
      }, 50);
    }, 150);
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let loginData = {};

    if (loginMethod === 'email') {
      if (!email) {
        setError('Please enter your email');
        setLoading(false);
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }
      loginData = { email: email.trim().toLowerCase() };
    } else {
      if (!username) {
        setError('Please enter your username');
        setLoading(false);
        return;
      }
      loginData = { username: username.trim().toLowerCase() };
    }

    try {
      const response = await login(loginData);
      if (response.success) {
        setUserId(response.data.userId);
        setShowOtp(true);
        setTimer(60);
        setCanResend(false);
      }
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits of the OTP');
      setLoading(false);
      return;
    }

    try {
      const response = await verifyLoginOTP({
        userId: userId,
        otp: otpString,
      });

      if (response.success) {
        await checkAuth();
        navigate('/', { replace: true });
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } catch (error) {
      setError(error.message || 'OTP verification failed. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    setCanResend(false);
    setTimer(60);
    
    let loginData = {};
    if (loginMethod === 'email') {
      loginData = { email: email.trim().toLowerCase() };
    } else {
      loginData = { username: username.trim().toLowerCase() };
    }

    try {
      const response = await login(loginData);
      if (response.success) {
        setUserId(response.data.userId);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0].focus();
      }
    } catch (error) {
      setError(error.message || 'Failed to resend OTP');
      setCanResend(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle Back to Login
  const handleBackToLogin = () => {
    setShowOtp(false);
    setOtp(['', '', '', '', '', '']);
    setError('');
    setTimer(60);
    setCanResend(false);
  };

  
        

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white font-manrope">
            {showOtp ? 'Verify OTP' : 'Sign In'}
          </h1>
          <p className="text-[#898989] text-lg mt-1 flex items-center gap-2">
            {showOtp ? (
              `OTP sent to ${loginMethod === 'email' ? email : username}`
            ) : (
              <>
                New user?{' '}
                <Link to="/auth/signup" className="text-[#d4a85a] hover:text-[#d4a08a] transition-colors font-medium">
                  Create an account
                </Link>
              </>
            )}
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        {!showOtp ? (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Toggle Buttons */}
            <div className="flex bg-[#0a0a0a] border border-[#232323] rounded-lg p-1">
              <button
                type="button"
                onClick={() => toggleLoginMethod('email')}
                className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all duration-300 ${
                  loginMethod === 'email'
                    ? 'bg-[#be880c] text-white'
                    : 'text-[#898989] hover:text-white'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => toggleLoginMethod('username')}
                className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all duration-300 ${
                  loginMethod === 'username'
                    ? 'bg-[#be880c] text-white'
                    : 'text-[#898989] hover:text-white'
                }`}
              >
                Username
              </button>
            </div>

            {/* Input Container with Slide Animation */}
            <div className="relative overflow-hidden">
              <div
                className={`transition-all duration-300 ease-in-out ${
                  isSliding ? 'opacity-0 -translate-x-10' : 'opacity-100 translate-x-0'
                }`}
              >
                {loginMethod === 'email' ? (
                  <div>
                    <label htmlFor="email" className="block text-white/80 text-lg font-light mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full bg-[#0a0a0a] border border-[#232323] rounded-lg px-5 py-3 text-white placeholder-[#898989] text-lg outline-none focus:border-[#A3A3A3] transition-all"
                      required
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                ) : (
                  <div>
                    <label htmlFor="username" className="block text-white/80 text-lg font-light mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full bg-[#0a0a0a] border border-[#232323] rounded-lg px-5 py-3 text-white placeholder-[#898989] text-lg outline-none focus:border-[#A3A3A3] transition-all"
                      required
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#be880c] hover:bg-yellow-500 text-white font-bold text-lg py-3.5 rounded-lg transition-all shadow-lg hover:shadow-xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending OTP...' : 'Login'}
            </button>

            {/* Switch between Email and Username */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => toggleLoginMethod(loginMethod === 'email' ? 'username' : 'email')}
                className="text-[#898989] hover:text-[#d4a85a] text-sm transition-colors"
                disabled={loading}
              >
                {loginMethod === 'email' 
                  ? 'Login with username instead' 
                  : 'Login with email instead'}
              </button>
            </div>
          </form>
        ) : (
          /* OTP Verification Form */
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-white/80 text-lg font-light mb-4 text-center">
                Enter 6-Digit OTP
              </label>
              
              {/* 6 OTP Boxes */}
              <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 text-center text-white text-2xl font-bold bg-[#0a0a0a] border border-[#232323] rounded-lg outline-none focus:border-[#d4a85a] transition-all focus:ring-2 focus:ring-[#d4a85a]/50"
                    disabled={loading}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              
              <p className="text-[#898989] text-sm mt-4 text-center">
                OTP sent to{' '}
                <span className="text-white">
                  {loginMethod === 'email' ? email : username}
                </span>
              </p>
            </div>

            {/* Timer and Resend */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-[#898989] hover:text-white text-sm transition-colors"
                disabled={loading}
              >
                ← Back to login
              </button>
              <div className="text-sm">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-[#d4a85a] hover:text-[#d4a08a] transition-colors disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                ) : (
                  <span className="text-[#898989]">
                    Resend in <span className="text-white">{timer}s</span>
                  </span>
                )}
              </div>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#be880c] hover:bg-yellow-500 text-white font-bold text-lg py-3.5 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify OTP & Sign In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Signin;