import React, { useState, useEffect } from 'react';
import Loader from '../components/ui/Loader';
// Import icons
import { Mic, Edit, Save, Database, Key, Lock, Cog } from 'lucide-react';
import Navbar from '../components/Navbar';
import VoiceSearchModal from '../components/VoiceSearchModal';

const DatabaseDetailsPage = ({ dbInfo })=> {
  // Static database data for testing
  const [database, setDatabase] = useState({
    id: '',
    name: '',
    type: '',
    status: '',
    lastAccessed: '',
  });
  const [credentials, setCredentials] = useState({
    connectionString: '',
    permissions: 'readWrite'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [processingVoice, setProcessingVoice] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [darkMode, setDarkMode] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [translations, setTranslations] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {
    if (dbInfo) {
      setDatabase({
        id: dbInfo.id || '123',
        name: dbInfo.name || 'Production MySQL',
        type: dbInfo.type || 'MySQL',
        status: dbInfo.status || 'Connected',
        lastAccessed: dbInfo.lastAccessed || '2025-04-01'
      });
      
      setCredentials({
        connectionString: dbInfo.connectionString || 'mysql://user:pass@localhost:3306/mydb',
        permissions: dbInfo.permissions || 'readOnly'
      });
    }
  }, [dbInfo]);

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = (event) => {
      const newTheme = event.detail.theme;
      setDarkMode(newTheme === 'dark');
    };
    
    window.addEventListener('themeChange', handleThemeChange);
    
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (event) => {
      if (event.detail && event.detail.translations) {
        console.log("Language change detected:", event.detail);
        setTranslations(current => ({...current, ...event.detail.translations}));
      }
    };
    
    window.addEventListener('languageChange', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange);
    };
  }, []);
  
  useEffect(() => {
    // Register this page's translation keys
    window.currentPageTranslationKeys = [
      'title', 'createButton', 'connectButton', 'noData', 'dbName',
      'dbType', 'accessLevel', 'lastAccessed', 'readOnly', 'readWrite', 'actions', 
      'queryDatabase', 'voiceSearch', 'dbCredentials',
      'connectionString', 'permissions', 'save', 'cancel', 'editCredentials',
      'queryPrompt', 'interactions', 'totalQueries', 'successRate', 'avgResponseTime',
      'ruleManager', 'manageRules', 'processing'
    ];
    
    // Set default English texts
    const defaultTexts = {
      title: 'Database Details',
      createButton: 'Create Database',
      connectButton: 'Connect Database',
      noData: 'No database found',
      dbName: 'Database Name',
      dbType: 'Type',
      accessLevel: 'Access Level',
      lastAccessed: 'Last Accessed',
      readOnly: 'Read Only',
      readWrite: 'Read & Write',
      voiceSearch: "Search by voice",
      processing: "Processing...",
      actions: "Actions",
      queryDatabase: "Query database with your voice",
      dbCredentials: "Database Credentials",
      connectionString: "Connection String",
      permissions: "Permissions",
      save: "Save",
      cancel: "Cancel",
      editCredentials: "Edit Credentials",
      queryPrompt: "Click the mic to ask a question in any language",
      interactions: "Interactions",
      totalQueries: "Total Queries",
      successRate: "Success Rate",
      avgResponseTime: "Avg Response Time",
      ruleManager: "Rule Manager",
      manageRules: "Manage Database Rules"
    };
    
    setTranslations(defaultTexts);
    window.currentPageDefaultTexts = defaultTexts;
    
    // Handle translations loading
    const handleTranslationsLoaded = (event) => {
      if (event.detail && event.detail.translations) {
        setTranslations(prev => ({...prev, ...event.detail.translations}));
      }
    };
    
    window.addEventListener('translationsLoaded', handleTranslationsLoaded);
    
    // If there's a stored language, trigger a translation
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage && storedLanguage !== 'english') {
      // Inform navbar that we need translations by triggering a custom event
      window.dispatchEvent(new CustomEvent('pageLoaded', { 
        detail: { needsTranslation: true, language: storedLanguage } 
      }));
    }
    
    // Clean up when component unmounts
    return () => {
      delete window.currentPageTranslationKeys;
      delete window.currentPageDefaultTexts;
      window.removeEventListener('translationsLoaded', handleTranslationsLoaded);
    };
  }, []);

  const handleCredentialChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleVoiceInput = () => {
    setShowVoiceModal(true);
  };

  const handleNavigateToRuleManager = () => {
    // Navigate to rule manager page
    window.location.href = `/rulemanage`;
  };

 const handleDatabaseQuery = (query) => {
    setProcessingVoice(true);
    
    // Make an API call to the backend database service
    fetch('http://localhost:8000/api/database/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Database query failed');
        }
        return response.json();
      })
      .then(data => {
        console.log("Database query successful:", data);
        setProcessingVoice(false);
        // On success, navigate to the choice page
        window.location.href = '/visChoice';
      })
      .catch(error => {
        console.error("Error processing database query:", error);
        setProcessingVoice(false);
        
        // Show failure message
        setErrorMessage('Database query failed. Please try again.');
        
        // Clear error message after 5 seconds
        setTimeout(() => {
          setErrorMessage('');
        }, 5000);
      });
  };
  const saveCredentials = async () => {
    try {
      // Simulate API request with timeout
      setTimeout(() => {
        // Update database state with new credentials
        setDatabase(prev => ({
          ...prev,
          ...credentials
        }));
        setIsEditing(false);
        console.log("Credentials updated:", credentials);
      }, 500);
    } catch (err) {
      console.error('Error updating credentials:', err);
      // Show error notification if needed
    }
  };

  // Get translated text with fallback to default
  const getText = (key) => {
    if (!key) return ""; // Return empty string if key is undefined/null
    return translations[key] || window.currentPageDefaultTexts?.[key] || key;
  };
  

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="flex justify-center items-center h-screen">
          <Loader />
        </div>
      </div>
    );
  }

  if (error || !database) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">{error || getText('noData')}</h2>
            <p>{getText('noData')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-screen ${darkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:px-6 lg:flex">
        {/* Left Sidebar - 40% width with background image */}
        <div className="lg:w-2/5 mb-6 lg:mb-0 lg:pr-6 relative">
          <div className="rounded-xl overflow-hidden h-full flex items-center justify-center">
            <img 
              src="/detail-bg.png" 
              alt="Database visualization" 
              className="w-full h-full object-contain p-4" 
            />
            <div className={`absolute inset-0 flex flex-col items-center justify-center text-center p-6 ${darkMode ? 'bg-slate-900/60' : 'bg-white/40'}`}>
              <h2 className="text-2xl font-bold mb-2">{database.name}</h2>
              <p className="text-lg mb-4">{database.type} Database</p>
              <div className={`px-4 py-2 rounded-full ${darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-800'}`}>
                {database.status || 'Connected'}
              </div>
              
              {/* Rule Manager Button - Only show if user has read-write permissions */}
              {credentials.permissions === 'readWrite' && (
                <button
                  onClick={handleNavigateToRuleManager}
                  className="mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center"
                >
                  <Cog className="h-5 w-5 mr-2" />
                  {translations.manageRules}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content - Right side */}
        <div className="lg:w-3/5">
          {/* Database Name Header */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{database.name}</h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {database.type} • {database.lastAccessed}
              </p>
            </div>
            
            {/* Rule Manager Button - Alternative position, only show if user has read-write permissions */}
            {credentials.permissions === 'readWrite' && (
              <button
                onClick={handleNavigateToRuleManager}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center"
              >
                <Cog className="h-5 w-5 mr-2" />
                {translations.ruleManager}
              </button>
            )}
          </div>

          {/* Voice Query Section */}
          <div className={`mb-8 p-6 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-white shadow'}`}>
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-semibold mr-2">{translations.queryDatabase}</h2>
              <Mic className="h-5 w-5 text-indigo-500" />
            </div>
            <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {translations.queryPrompt}
            </p>
            
            {/* Display error message if present */}
            {errorMessage && (
              <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {errorMessage}
              </div>
            )}
            
            <button
              onClick={handleVoiceInput}
              disabled={processingVoice}
              className={`w-full text-white py-4 rounded-lg flex items-center justify-center ${
                processingVoice 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
              }`}
            >
              <Mic className="h-6 w-6 mr-2" />
              {processingVoice ? translations.processing : translations.voiceSearch}
            </button>
          </div>

          {/* Performance Analytics Card */}
          <div className="group relative flex w-full mb-8 flex-col rounded-xl bg-slate-950 p-4 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-500/20">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-30" />
            <div className="absolute inset-px rounded-[11px] bg-slate-950" />
            <div className="relative">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-white">{translations.interactions}</h3>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Live
                </span>
              </div>
              <div className="mb-4 grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-slate-900/50 p-3">
                  <p className="text-xs font-medium text-slate-400">{translations.totalQueries}</p>
                  <p className="text-lg font-semibold text-white">3.4K</p>
                  <span className="text-xs font-medium text-emerald-500">+15.6%</span>
                </div>
                <div className="rounded-lg bg-slate-900/50 p-3">
                  <p className="text-xs font-medium text-slate-400">{translations.successRate}</p>
                  <p className="text-lg font-semibold text-white">92.3%</p>
                  <span className="text-xs font-medium text-emerald-500">+3.2%</span>
                </div>
                <div className="rounded-lg bg-slate-900/50 p-3">
                  <p className="text-xs font-medium text-slate-400">{translations.avgResponseTime}</p>
                  <p className="text-lg font-semibold text-white">1.2s</p>
                  <span className="text-xs font-medium text-emerald-500">-0.3s</span>
                </div>
              </div>
              <div className="mb-4 h-24 w-full overflow-hidden rounded-lg bg-slate-900/50 p-3">
                <div className="flex h-full w-full items-end justify-between gap-1">
                  <div className="h-2/5 w-3 rounded-sm bg-indigo-500/30">
                    <div className="h-3/5 w-full rounded-sm bg-indigo-500 transition-all duration-300" />
                  </div>
                  <div className="h-3/5 w-3 rounded-sm bg-indigo-500/30">
                    <div className="h-2/5 w-full rounded-sm bg-indigo-500 transition-all duration-300" />
                  </div>
                  <div className="h-3/4 w-3 rounded-sm bg-indigo-500/30">
                    <div className="h-4/5 w-full rounded-sm bg-indigo-500 transition-all duration-300" />
                  </div>
                  <div className="h-2/5 w-3 rounded-sm bg-indigo-500/30">
                    <div className="h-1/2 w-full rounded-sm bg-indigo-500 transition-all duration-300" />
                  </div>
                  <div className="h-4/5 w-3 rounded-sm bg-indigo-500/30">
                    <div className="h-full w-full rounded-sm bg-indigo-500 transition-all duration-300" />
                  </div>
                  <div className="h-3/5 w-3 rounded-sm bg-indigo-500/30">
                    <div className="h-4/5 w-full rounded-sm bg-indigo-500 transition-all duration-300" />
                  </div>
                  <div className="h-4/5 w-3 rounded-sm bg-indigo-500/30">
                    <div className="h-4/5 w-full rounded-sm bg-indigo-500 transition-all duration-300" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-400">Last 7 days</span>
                  <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <button className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 text-xs font-medium text-white transition-all duration-300 hover:from-indigo-600 hover:to-purple-600">
                  View Details
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {processingVoice && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <Loader />
            </div>
          )}

          {/* Database Credentials Section */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white shadow'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{translations.dbCredentials}</h2>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className={`flex items-center gap-1 px-3 py-1 rounded ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <Edit className="h-4 w-4" />
                  <span>{translations.editCredentials}</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditing(false)} 
                    className={`px-3 py-1 rounded ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    {translations.cancel}
                  </button>
                  <button 
                    onClick={saveCredentials} 
                    className="flex items-center gap-1 px-3 py-1 rounded bg-indigo-500 hover:bg-indigo-600 text-white"
                  >
                    <Save className="h-4 w-4" />
                    <span>{translations.save}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {translations.connectionString}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="connectionString"
                    value={credentials.connectionString}
                    onChange={handleCredentialChange}
                    className={`w-full p-2 rounded border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                ) : (
                  <div className="flex items-center">
                    <Database className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm font-mono">{credentials.connectionString}</span>
                  </div>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {translations.permissions}
                </label>
                {isEditing ? (
                  <select
                    name="permissions"
                    value={credentials.permissions}
                    onChange={handleCredentialChange}
                    className={`w-full p-2 rounded border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="readOnly">{translations.readOnly}</option>
                    <option value="readWrite">{translations.readWrite}</option>
                  </select>
                ) : (
                  <div className={`inline-flex items-center px-2 py-1 rounded ${
                    credentials.permissions === 'readWrite' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {translations[credentials.permissions === 'readWrite' ? 'readWrite' : 'readOnly']}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showVoiceModal && (
        <VoiceSearchModal 
          darkMode={darkMode}
          onClose={() => setShowVoiceModal(false)}
          onQuery={handleDatabaseQuery}
        />
      )}
      <footer className="mt-auto py-4 text-center backdrop-blur-sm bg-white/30 dark:bg-black/30">
        <p className="text-sm">© 2025 Data Visualization Platform</p>
      </footer>
    </div>
  );
};

export default DatabaseDetailsPage;