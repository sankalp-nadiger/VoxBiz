"use client";
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigateTo = useNavigate();
  
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('english');
  const [showMenu, setShowMenu] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [instructions, setInstructions] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

  const [translations, setTranslations] = useState({
    signUp: "Sign up",
    fullName: "Full Name",
    email: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    agreement: "You are agreeing to the",
    termsOfService: "Terms of Services",
    and: "and",
    privacyPolicy: "Privacy Policy",
    getStarted: "Get Started",
    alreadyMember: "Already a member?",
    signIn: "Sign in",
    theme: "Theme",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    language: "Language",
    googleSignUp: "Sign up with Google",
    or: "or",
    oneClick: "One click to create",
    allDigital: "your account"
  });

  const instructionTexts = {
    fullName: "Enter your full legal name as it appears on official documents.",
    email: "Provide a valid email address. We'll send verification link here.",
    password: "Create a strong password (8+ chars, uppercase, lowercase, number).",
    confirmPassword: "Re-enter your password to confirm it matches."
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    return minLength && hasUpper && hasLower && hasNumber;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be 8+ chars with uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    setShowMenu(false);
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    setShowMenu(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFocus = (fieldName) => {
    setInstructions(instructionTexts[fieldName]);
    setShowInstructions(true);
  };

  const handleBlur = () => {
    setShowInstructions(false);
  };

  const handleGoogleSignUp = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/auth/google-url');
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Google Sign-up Error:", err);
      alert("Google Sign-up failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Registration successful:', data);
        navigateTo('/main');
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.message || 'Registration failed' });
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setErrors({ submit: 'Network error. Please try again.' });
    }
  };

  // Theme-based styles
  const themeStyles = {
    dark: {
      bg: 'bg-black',
      cardBg: 'bg-white/5',
      text: 'text-white',
      textSecondary: 'text-gray-300',
      textMuted: 'text-gray-400',
      border: 'border-white/10',
      inputBg: 'bg-white/10',
      inputBorder: 'border-white/20',
      menuBg: 'bg-white/10',
      buttonBg: 'bg-white/10',
      buttonHover: 'hover:bg-white/20'
    },
    light: {
      bg: 'bg-gray-50',
      cardBg: 'bg-white',
      text: 'text-gray-900',
      textSecondary: 'text-gray-700',
      textMuted: 'text-gray-500',
      border: 'border-gray-200',
      inputBg: 'bg-gray-50',
      inputBorder: 'border-gray-300',
      menuBg: 'bg-white',
      buttonBg: 'bg-gray-100',
      buttonHover: 'hover:bg-gray-200'
    }
  };

  const currentTheme = themeStyles[theme];

  return (
    <div className={`${currentTheme.bg} w-screen h-screen flex items-center justify-center transition-colors duration-300`}>
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-64 h-64 ${theme === 'dark' ? 'bg-blue-500/5' : 'bg-blue-500/10'} rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-64 h-64 ${theme === 'dark' ? 'bg-purple-500/5' : 'bg-purple-500/10'} rounded-full blur-3xl animate-pulse delay-1000`}></div>
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className={`${currentTheme.buttonBg} ${currentTheme.buttonHover} ${currentTheme.border} backdrop-blur-sm border p-2 rounded-lg transition-all duration-300`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${currentTheme.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            
            {showMenu && (
              <div className={`absolute right-0 mt-2 w-40 rounded-xl shadow-lg py-2 ${currentTheme.menuBg} ${currentTheme.border} backdrop-blur-xl border z-50`}>
                <div className={`px-3 py-2 text-xs font-medium border-b ${currentTheme.border} text-cyan-400`}>Theme</div>
                <button onClick={() => toggleTheme('light')} className={`w-full text-left block px-3 py-2 text-sm ${currentTheme.textSecondary} ${currentTheme.buttonHover}`}>Light Mode</button>
                <button onClick={() => toggleTheme('dark')} className={`w-full text-left block px-3 py-2 text-sm ${currentTheme.textSecondary} ${currentTheme.buttonHover}`}>Dark Mode</button>
                
                <div className={`px-3 py-2 text-xs font-medium border-b border-t ${currentTheme.border} text-cyan-400 mt-2`}>Language</div>
                <button onClick={() => changeLanguage('english')} className={`w-full text-left block px-3 py-2 text-sm ${currentTheme.textSecondary} ${currentTheme.buttonHover}`}>English</button>
                <button onClick={() => changeLanguage('hindi')} className={`w-full text-left block px-3 py-2 text-sm ${currentTheme.textSecondary} ${currentTheme.buttonHover}`}>Hindi</button>
                <button onClick={() => changeLanguage('kannada')} className={`w-full text-left block px-3 py-2 text-sm ${currentTheme.textSecondary} ${currentTheme.buttonHover}`}>Kannada</button>
              </div>
            )}
          </div>
        </div>

        {/* Welcome Badge */}
        <div className="flex justify-center mb-4">
          <div className={`inline-flex items-center gap-2 ${currentTheme.cardBg} ${currentTheme.border} backdrop-blur-sm px-4 py-2 rounded-full border`}>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-cyan-400 font-medium text-sm">Join Us Today</span>
          </div>
        </div>
        
        {/* Title */}
        <div className={`text-center ${currentTheme.text} mb-8`}>
          <h1 className="text-2xl md:text-3xl font-bold flex flex-wrap justify-center items-center gap-2">
            <span>{translations.oneClick}</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              {translations.allDigital}
            </span>
          </h1>
        </div>

        {/* Instructions Popup */}
        {showInstructions && (
          <div className={`mb-4 p-3 ${currentTheme.cardBg} ${currentTheme.border} backdrop-blur-xl rounded-lg border animate-fade-in`}>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className={`text-sm ${currentTheme.textSecondary}`}>{instructions}</p>
            </div>
          </div>
        )}

        {/* Signup Form */}
        <div className={`${currentTheme.cardBg} ${currentTheme.border} backdrop-blur-xl p-6 rounded-2xl border shadow-xl`}>
          <h2 className={`text-xl font-bold ${currentTheme.text} text-center mb-6`}>{translations.signUp}</h2>
          
          <button
            onClick={handleGoogleSignUp}
            className={`flex items-center justify-center w-full ${currentTheme.buttonBg} ${currentTheme.buttonHover} ${currentTheme.border} ${currentTheme.text} backdrop-blur-sm border rounded-xl py-2.5 px-4 mb-4 transition-all duration-300`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" fill="#4285F4" />
            </svg>
            {translations.googleSignUp}
          </button>
          
          <div className="flex items-center justify-center my-4">
            <div className={`border-t ${currentTheme.border} flex-grow`}></div>
            <span className={`px-3 ${currentTheme.textMuted} text-sm`}>{translations.or}</span>
            <div className={`border-t ${currentTheme.border} flex-grow`}></div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${currentTheme.textSecondary} mb-1`}>
                {translations.fullName}<span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                className={`w-full p-2.5 ${currentTheme.inputBg} ${currentTheme.inputBorder} ${currentTheme.text} backdrop-blur-sm border rounded-lg placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300 ${errors.fullName ? 'border-red-400' : ''}`}
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                onFocus={() => handleFocus('fullName')}
                onBlur={handleBlur}
              />
              {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium ${currentTheme.textSecondary} mb-1`}>
                {translations.email}<span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                className={`w-full p-2.5 ${currentTheme.inputBg} ${currentTheme.inputBorder} ${currentTheme.text} backdrop-blur-sm border rounded-lg placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300 ${errors.email ? 'border-red-400' : ''}`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => handleFocus('email')}
                onBlur={handleBlur}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium ${currentTheme.textSecondary} mb-1`}>
                {translations.password}<span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`w-full p-2.5 pr-10 ${currentTheme.inputBg} ${currentTheme.inputBorder} ${currentTheme.text} backdrop-blur-sm border rounded-lg placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300 ${errors.password ? 'border-red-400' : ''}`}
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => handleFocus('password')}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 right-2 flex items-center ${currentTheme.textMuted} hover:${currentTheme.text}`}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium ${currentTheme.textSecondary} mb-1`}>
                {translations.confirmPassword}<span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className={`w-full p-2.5 pr-10 ${currentTheme.inputBg} ${currentTheme.inputBorder} ${currentTheme.text} backdrop-blur-sm border rounded-lg placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300 ${errors.confirmPassword ? 'border-red-400' : ''}`}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={() => handleFocus('confirmPassword')}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute inset-y-0 right-2 flex items-center ${currentTheme.textMuted} hover:${currentTheme.text}`}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <div className={`text-xs ${currentTheme.textMuted} text-center`}>
              {translations.agreement} <a href="/terms" className="text-cyan-400 hover:text-cyan-300">{translations.termsOfService}</a> {translations.and} <a href="/privacy" className="text-cyan-400 hover:text-cyan-300">{translations.privacyPolicy}</a>.
            </div>

            {errors.submit && <p className="text-red-400 text-sm text-center">{errors.submit}</p>}

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2.5 rounded-lg font-medium hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg"
            >
              {translations.getStarted}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <p className={`${currentTheme.textMuted} text-sm`}>
              {translations.alreadyMember}{' '}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/login');
                }}
                className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                {translations.signIn}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;