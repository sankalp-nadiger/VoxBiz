import React, { useState, useEffect, useRef, use } from 'react';
import { Settings, Moon, Sun, Globe, LogOut, User, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [theme, setTheme] = useState('light');
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Replace with your auth logic
  const menuRef = useRef(null);
  const [translations, setTranslations] = useState({
    theme: "Theme",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    language: "Language",
    logout: "Logout",
    login: "Login",
    signup: "Sign Up"
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/auth/me', {
          method: 'GET',
          credentials: 'include', // 👈 VERY IMPORTANT to send the cookie
        });

        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(true);
          console.log("Authenticated user:", data.user);
          console.log("set show menu", showMenu);
          console.log("isAuthenticated:", isAuthenticated);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [isAuthenticated]);

  // Load theme from localStorage on component mount
  useEffect(() => {
    const storedTheme = localStorage.getItem('mode');
    if (storedTheme) {
      setTheme(storedTheme);
      document.body.classList.toggle('dark-mode', storedTheme === 'dark');
    }

    // Load language and translate if needed
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage && storedLanguage !== 'english') {
      translateContent(storedLanguage);
    }

    // Add click event listener to close menu when clicking outside
    document.addEventListener('mousedown', handleClickOutside);

    const handlePageLoaded = (event) => {
      if (event.detail && event.detail.needsTranslation) {
        translateContent(event.detail.language || localStorage.getItem('language'));
      }
    };

    window.addEventListener('pageLoaded', handlePageLoaded);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('pageLoaded', handlePageLoaded);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setShowMenu(false);
    }
  };

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('mode', newTheme);
    document.body.classList.toggle('dark-mode', newTheme === 'dark');

    window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: newTheme } }));
    setShowMenu(false);
  };

  const translateContent = async (targetLanguage) => {
    try {
      const apiKey = import.meta.env.VITE_API_GOOGLE;
      if (!apiKey) {
        console.error('Google Translate API key not found');
        return;
      }

      const currentPageTranslationKeys = window.currentPageTranslationKeys || [];
      const navbarKeys = ["theme", "lightMode", "darkMode", "language", "logout", "login", "signup"];
      const allKeys = [...navbarKeys, ...currentPageTranslationKeys];

      const sourceTexts = allKeys.map(key => {
        if (navbarKeys.includes(key)) {
          const navbarDefaultTexts = {
            theme: "Theme",
            lightMode: "Light Mode",
            darkMode: "Dark Mode",
            language: "Language",
            logout: "Logout",
            login: "Login",
            signup: "Sign Up"
          };
          return navbarDefaultTexts[key];
        }
        else if (window.currentPageDefaultTexts && window.currentPageDefaultTexts[key]) {
          return window.currentPageDefaultTexts[key];
        }
        return key;
      });

      const languageMap = {
        english: 'en',
        hindi: 'hi',
        kannada: 'kn'
      };

      const targetLang = languageMap[targetLanguage];

      const url = 'https://translation.googleapis.com/language/translate/v2';
      const response = await fetch(`${url}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: sourceTexts,
          source: 'en',
          target: targetLang,
          format: 'text'
        })
      });

      const data = await response.json();

      if (data.data && data.data.translations) {
        const translatedTexts = data.data.translations.map(t => t.translatedText);

        const navbarTranslations = {};
        navbarKeys.forEach((key, index) => {
          navbarTranslations[key] = translatedTexts[index];
        });

        setTranslations(navbarTranslations);

        if (currentPageTranslationKeys.length > 0) {
          const pageTranslations = {};
          currentPageTranslationKeys.forEach((key, index) => {
            const translationIndex = navbarKeys.length + index;
            if (translationIndex < translatedTexts.length) {
              pageTranslations[key] = translatedTexts[translationIndex];
            }
          });

          window.dispatchEvent(new CustomEvent('languageChange', {
            detail: {
              language: targetLanguage,
              translations: pageTranslations
            }
          }));
        }
      }
    } catch (error) {
      console.error('Translation error:', error);
      alert(`Translation failed. Defaulting to English. Error: ${error.message}`);
    }
  };

  const changeLanguage = (language) => {
    localStorage.setItem('language', language);

    if (language !== 'english') {
      translateContent(language);
    } else {
      setTranslations({
        theme: "Theme",
        lightMode: "Light Mode",
        darkMode: "Dark Mode",
        language: "Language",
        logout: "Logout",
        login: "Login",
        signup: "Sign Up"
      });

      if (window.currentPageDefaultTexts) {
        const defaultTranslations = { ...window.currentPageDefaultTexts };

        window.dispatchEvent(new CustomEvent('languageChange', {
          detail: {
            language: 'english',
            translations: defaultTranslations
          }
        }));
      }
    }

    setShowMenu(false);
  };

  const handleLogout = async () => {
    // Add your logout logic here
    await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  
    setIsA
    setIsAuthenticated(false);
    setShowMenu(false);
  };

  return (
  <nav className={`relative z-10 flex w-full items-center justify-between  ${theme === 'dark'
      ? 'bg-black/20 backdrop-blur-lg border-white/10 text-white'
      : 'bg-gray-400/15 backdrop-blur-lg border-gray-300/20 text-gray-800'
      } border-b shadow-sm/50 px-16 py-3 mx-8 rounded-b-xl`}>

      {/* Logo Section */}
      <div className="flex items-center gap-3">
        <div className="relative group">
          <img
            src="/Navlogo.png"
            alt="Logo"
            className={`size-10 rounded-full object-cover transition-all duration-300 group-hover:scale-110 ${theme === 'dark'
              ? 'drop-shadow-[0_0_15px_rgba(139,69,199,0.8)] group-hover:drop-shadow-[0_0_25px_rgba(139,69,199,1)]'
              : 'drop-shadow-[0_0_10px_rgba(139,69,199,0.6)] group-hover:drop-shadow-[0_0_20px_rgba(139,69,199,0.9)]'
              }`}
          />
          <div className={`absolute inset-0 rounded-full transition-all duration-300 ${theme === 'dark'
            ? 'bg-violet-500/20 group-hover:bg-violet-500/30'
            : 'bg-violet-500/10 group-hover:bg-violet-500/20'
            } blur-sm group-hover:blur-md`}></div>
        </div>

        <h1 className="text-2xl font-bold flex items-center whitespace-nowrap cursor-pointer hover:scale-105 transition-transform duration-200"
          style={{ fontSize: '1.8rem', lineHeight: '1.5rem' }}>
          Vox<span className="bg-gradient-to-br from-violet-500 to-pink-500 text-transparent bg-clip-text">Biz</span>
        </h1>
      </div>

      {/* Innovative Action Button & Settings Section */}
      <div className="flex items-center gap-4">

        {/* Single Cosmic Launch Button for Navbar - Only show when NOT authenticated */}
        {!isAuthenticated && (
          <div className="relative group">
            <button
              onClick={() => navigate('/login')}
              className={`relative px-5 py-2.5 font-semibold rounded-full transition-all duration-500 transform ${theme === 'dark'
                ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white'
                : 'bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-white'
                } hover:scale-110 active:scale-90 hover:rotate-1 group-hover:shadow-[0_0_40px_rgba(147,51,234,0.7)] overflow-hidden`}
              style={{
                backgroundSize: '200% 200%',
                animation: 'gradient-flow 3s ease infinite'
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="group-hover:animate-spin transition-transform duration-300">🚀</span>
                Launch
                <span className="group-hover:animate-pulse">⚡</span>
              </span>

              {/* Orbiting Particles */}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full group-hover:animate-spin opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-pink-400 rounded-full group-hover:animate-bounce opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Cosmic Trail Effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 opacity-0 group-hover:opacity-30 group-hover:scale-150 transition-all duration-500 blur-sm"></div>

              {/* Ripple on Click */}
              <div className="absolute inset-0 rounded-full bg-white opacity-0 group-active:opacity-20 group-active:animate-ping transition-opacity duration-150"></div>
            </button>

            {/* CSS for gradient animation */}
            <style jsx>{`
    @keyframes gradient-flow {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
  `}</style>
          </div>
        )}

        {/* Settings Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`p-2.5 rounded-xl transition-all duration-200 ${theme === 'dark'
              ? 'bg-gray-800/50 hover:bg-gray-700/60 text-gray-300 hover:text-white border border-gray-600/40 hover:border-gray-500/60 backdrop-blur-sm'
              : 'bg-gray-200/40 hover:bg-gray-300/50 text-gray-600 hover:text-gray-800 border border-gray-300/30 hover:border-gray-400/50 backdrop-blur-sm'
              } hover:scale-105 active:scale-95`}
          >
            <Settings size={18} className="transition-transform duration-200 hover:rotate-90" />
          </button>

          {showMenu && (
            <div className={`absolute right-0 mt-3 w-56 rounded-xl shadow-2xl py-2 ${theme === 'dark'
              ? 'bg-gray-900/80 backdrop-blur-xl text-white border border-gray-700/50'
              : 'bg-white/80 backdrop-blur-xl text-gray-900 border border-gray-200/50'
              } ring-1 ring-black/5 z-[9999]`}>

              {/* Theme Section */}
              <div className={`px-4 py-2 text-xs font-semibold border-b ${theme === 'dark' ? 'border-gray-700/50 text-gray-400' : 'border-gray-200/50 text-gray-500'
                } flex items-center gap-2`}>
                {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                {translations.theme}
              </div>

              <button
                onClick={() => toggleTheme('light')}
                className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${theme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-800/60 hover:text-white'
                  : 'text-gray-700 hover:bg-gray-50/60 hover:text-gray-900'
                  } ${theme === 'light' ? 'bg-violet-50/60 text-violet-700' : ''}`}
              >
                <Sun size={16} />
                {translations.lightMode}
              </button>

              <button
                onClick={() => toggleTheme('dark')}
                className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${theme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-800/60 hover:text-white'
                  : 'text-gray-700 hover:bg-gray-50/60 hover:text-gray-900'
                  } ${theme === 'dark' ? 'bg-gray-800/60 text-white' : ''}`}
              >
                <Moon size={16} />
                {translations.darkMode}
              </button>

              {/* Language Section */}
              <div className={`px-4 py-2 text-xs font-semibold border-b border-t ${theme === 'dark'
                ? 'border-gray-700/50 text-gray-400'
                : 'border-gray-200/50 text-gray-500'
                } mt-1 flex items-center gap-2`}>
                <Globe size={14} />
                {translations.language}
              </div>

              <button
                onClick={() => changeLanguage('english')}
                className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${theme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-800/60 hover:text-white'
                  : 'text-gray-700 hover:bg-gray-50/60 hover:text-gray-900'
                  }`}
              >
                🇺🇸 English
              </button>

              <button
                onClick={() => changeLanguage('hindi')}
                className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${theme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-800/60 hover:text-white'
                  : 'text-gray-700 hover:bg-gray-50/60 hover:text-gray-900'
                  }`}
              >
                🇮🇳 हिंदी
              </button>

              <button
                onClick={() => changeLanguage('kannada')}
                className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${theme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-800/60 hover:text-white'
                  : 'text-gray-700 hover:bg-gray-50/60 hover:text-gray-900'
                  }`}
              >
                🇮🇳 ಕನ್ನಡ
              </button>


            </div>
          )}
        </div>
        {/* Logout Section (only if authenticated) */}
        {isAuthenticated && (
          <>
            <div className={`border-t ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'} mt-1`}></div>

            <button
              onClick={handleLogout}
              className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${theme === 'dark'
                  ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300'
                  : 'text-red-600 hover:bg-red-50/60 hover:text-red-700'
                }`}
            >
              <LogOut size={16} />
              {translations.logout}
            </button>
          </>
        )}

      </div>
    </nav>
  );
};

export default Navbar;