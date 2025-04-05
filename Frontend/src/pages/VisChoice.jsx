import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { LinkPreview } from '../components/ui/link-preview';
import { useNavigate } from "react-router-dom";

const VisualizationChoicePage = () => {
  const [darkMode, setDarkMode] = useState(true);
  const navigate=useNavigate();
  const [translations, setTranslations] = useState({
    pageTitle: 'Choose Visualization Type',
    tableCard: 'Table View',
    graphCard: 'Graph View',
    tableDescription: 'Structured rows and columns for detailed data analysis',
    graphDescription: 'Visual representation of data relationships and trends with comparative inights',
    chooseButton: 'Select',
    tablePreview: 'Table Preview',
    graphPreview: 'Graph Preview'
  });

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
  
  // Register this page's translation keys
  useEffect(() => {
    // Register this page's translation keys
    window.currentPageTranslationKeys = [
      'pageTitle', 'tableCard', 'graphCard', 'tableDescription', 'graphDescription',
      'chooseButton', 'tablePreview', 'graphPreview'
    ];
    
    // Set default English texts
    window.currentPageDefaultTexts = {
      pageTitle: 'Choose Visualization Type',
      tableCard: 'Table View',
      graphCard: 'Graph View',
      tableDescription: 'Structured rows and columns for detailed data analysis',
      graphDescription: 'Visual representation of data relationships and trends',
      chooseButton: 'Select',
      tablePreview: 'Table Preview',
      graphPreview: 'Graph Preview'
    };
    
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
    };
  }, []);

  return (
    <div className={`min-h-screen w-screen                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                flex flex-col ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}
         style={{
           backgroundImage: `url('/choice-bg.png')`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundRepeat: 'no-repeat'
         }}>
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-12 backdrop-blur-sm py-2 rounded">
          {translations.pageTitle}
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Table Visualization Card */}
          <div className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg p-6 flex flex-col hover:shadow-xl transition-all">
            <h2 className="text-2xl font-bold mb-3">{translations.tableCard}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{translations.tableDescription}</p>
            
            <div className="flex-grow flex items-center justify-center mb-6">
              <LinkPreview 
                url="/table"
                isStatic={true}
                imageSrc="/table-preview.jpg" 
                width={280}
                height={180}
                className="text-center text-blue-600 dark:text-blue-400"
              >
                <div className="text-blue-600 dark:text-blue-400 flex flex-col items-center">
                  
                  <span className="mt-2">{translations.tablePreview}</span>
                </div>
              </LinkPreview>
            </div>
            
            <button 
      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
      onClick={() => navigate("/table-visualization")}
    >
      {translations.chooseButton}
    </button>
          </div>
          
          {/* Graph Visualization Card */}
          <div className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg p-6 flex flex-col hover:shadow-xl transition-all">
            <h2 className="text-2xl font-bold mb-3">{translations.graphCard}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{translations.graphDescription}</p>
            
            <div className="flex-grow flex items-center justify-center mb-6">
              <LinkPreview 
                url="/graph-visualization"
                isStatic={true}
                imageSrc="/graph-preview.jpg" // Placeholder - replace with actual preview image
                width={280}
                height={180}
                className="text-center text-blue-600 dark:text-blue-400"
              >
                <div className="text-blue-600 dark:text-blue-400 flex flex-col items-center">
                  
                  <span className="mt-2">{translations.graphPreview}</span>
                </div>
              </LinkPreview>
            </div>
            
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
              {translations.chooseButton}
            </button>
          </div>
        </div>
      </main>
      
      <footer className="mt-auto py-4 text-center backdrop-blur-sm bg-white/30 dark:bg-black/30">
        <p className="text-sm">© 2025 Data Visualization Platform</p>
      </footer>
    </div>
  );
};

export default VisualizationChoicePage;