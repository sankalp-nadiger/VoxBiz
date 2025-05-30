import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const Signin = () => {
  // Mock navigate function for demo
 const navigate = useNavigate();
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('english');
  const [showMenu, setShowMenu] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [translations, setTranslations] = useState({
    googleSignIn: 'Sign in with Google',
    or: 'or',
    email: 'Email',
    password: 'Password',
    loginAccount: 'Login to your account',
    donotHaveAccount: 'Do not have an account?',
    signupHere: 'Signup Here',
    forgotPassword: 'Forgot Password?',
    oneClick: 'One click to go',
    allDigital: 'all accessing.'
  });

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    setShowMenu(false);
  };

  const changeLanguage = async (newLanguage) => {
    setLanguage(newLanguage);
    
    if (newLanguage !== 'english') {
      // Translation logic would go here
    } else {
      setTranslations({
        googleSignIn: 'Sign in with Google',
        or: 'or',
        email: 'Email',
        password: 'Password',
        loginAccount: 'Login to your account',
        donotHaveAccount: 'Do not have an account?',
        signupHere: 'Signup Here',
        forgotPassword: 'Forgot Password?',
        oneClick: 'One click to go',
        allDigital: 'all accessing.'
      });
    }
    
    setShowMenu(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ 
      ...prevState,
      [name]: value
    }));
  };

  const handleGoogleSignIn = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/auth/google-url');
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Google Sign-in Error:", err);
      alert("Google Sign-in failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const { email, password } = formData;
  
    if (!email || !password) {
      console.log("Please fill in all required fields");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong!");
      }
  
      console.log("Login successful!");
  
      setFormData({ email: "", password: "" });
      navigate("/dblist");
  
    } catch (error) {
      console.error("Error:", error.message);
      console.log(error.message || "Login failed");
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
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
                <button
                  onClick={() => toggleTheme('light')}
                  className={`w-full text-left block px-3 py-2 text-sm ${currentTheme.textSecondary} ${currentTheme.buttonHover}`}
                >
                  Light Mode
                </button>
                <button
                  onClick={() => toggleTheme('dark')}
                  className={`w-full text-left block px-3 py-2 text-sm ${currentTheme.textSecondary} ${currentTheme.buttonHover}`}
                >
                  Dark Mode
                </button>
                
                <div className={`px-3 py-2 text-xs font-medium border-b border-t ${currentTheme.border} text-cyan-400 mt-2`}>Language</div>
                <button
                  onClick={() => changeLanguage('english')}
                  className={`w-full text-left block px-3 py-2 text-sm ${currentTheme.textSecondary} ${currentTheme.buttonHover}`}
                >
                  English
                </button>
                <button     
                  onClick={() => changeLanguage('hindi')}
                  className={`w-full text-left block px-3 py-2 text-sm ${currentTheme.textSecondary} ${currentTheme.buttonHover}`}
                >
                  Hindi
                </button>
                <button
                  onClick={() => changeLanguage('kannada')}
                  className={`w-full text-left block px-3 py-2 text-sm ${currentTheme.textSecondary} ${currentTheme.buttonHover}`}
                >
                  Kannada
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Welcome Badge */}
        <div className="flex justify-center mb-4">
          <div className={`inline-flex items-center gap-2 ${currentTheme.cardBg} ${currentTheme.border} backdrop-blur-sm px-4 py-2 rounded-full border`}>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-cyan-400 font-medium text-sm">
              {"Welcome Back".split("").map((char, index) => (
                <span
                  key={index}
                  className="inline-block animate-bounce"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animationDuration: '0.6s',
                    animationIterationCount: 'infinite'
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </span>
          </div>
        </div>
        
        {/* Title */}
        <div className={`text-center ${currentTheme.text} mb-8`}>
          <h1 className="text-2xl md:text-3xl font-bold flex flex-wrap justify-center items-center gap-2">
            <span>
              {translations.oneClick.split("").map((char, index) => (
                <span
                  key={index}
                  className="inline-block animate-pulse"
                  style={{
                    animationDelay: `${index * 0.15}s`,
                    animationDuration: '1s',
                    animationIterationCount: 'infinite'
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              {translations.allDigital.split("").map((char, index) => (
                <span
                  key={index}
                  className="inline-block animate-bounce"
                  style={{
                    animationDelay: `${(index + translations.oneClick.length) * 0.12}s`,
                    animationDuration: '0.8s',
                    animationIterationCount: 'infinite'
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </span>
          </h1>
        </div>

        {/* Login Form */}
        <div className={`${currentTheme.cardBg} ${currentTheme.border} backdrop-blur-xl p-6 rounded-2xl border shadow-xl`}>
          <h2 className={`text-xl font-bold ${currentTheme.text} text-center mb-6`}>{translations.loginAccount}</h2>
          
          <button
            onClick={handleGoogleSignIn}
            className={`flex items-center justify-center w-full ${currentTheme.buttonBg} ${currentTheme.buttonHover} ${currentTheme.border} ${currentTheme.text} backdrop-blur-sm border rounded-xl py-2.5 px-4 mb-4 transition-all duration-300`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24">
              <path
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                fill="#4285F4"
              />
            </svg>
            {translations.googleSignIn}
          </button>
          
          <div className="flex items-center justify-center my-4">
            <div className={`border-t ${currentTheme.border} flex-grow`}></div>
            <span className={`px-3 ${currentTheme.textMuted} text-sm`}>{translations.or}</span>
            <div className={`border-t ${currentTheme.border} flex-grow`}></div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${currentTheme.textSecondary} mb-1`}>
                {translations.email}<span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                className={`w-full p-2.5 ${currentTheme.inputBg} ${currentTheme.inputBorder} ${currentTheme.text} backdrop-blur-sm border rounded-lg placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${currentTheme.textSecondary} mb-1`}>
                {translations.password}<span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                name="password"
                className={`w-full p-2.5 ${currentTheme.inputBg} ${currentTheme.inputBorder} ${currentTheme.text} backdrop-blur-sm border rounded-lg placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            
            <button 
              type="submit"
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2.5 rounded-lg font-medium hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg"
            >
              {translations.loginAccount}
            </button>
          </div>

          <div className="mt-3 text-center">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/forgot-password');
              }}
              className="text-cyan-400 hover:text-cyan-300 font-medium text-sm"
            >
              {translations.forgotPassword}
            </a>
          </div>
          
          <div className="mt-4 text-center">
            <p className={`${currentTheme.textMuted} text-sm`}>
              {translations.donotHaveAccount}{' '}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/signup');
                }}
                className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                {translations.signupHere}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;