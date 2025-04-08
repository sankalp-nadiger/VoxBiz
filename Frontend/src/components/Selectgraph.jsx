import React, { useState, useEffect } from 'react';
import GraphSelector from './GraphSelector';
import Navbar from './Navbar';
import { useLocation } from 'react-router-dom';

function Selectg({ dbid = 'default_collection' }) {  // Destructure and provide default value
  const [darkMode, setDarkMode] = useState(false);
  const [selectedGraph, setSelectedGraph] = useState(null);
  const [dataToAnalyze, setDataToAnalyze] = useState([]);
  const location = useLocation();
  
  useEffect(() => {
    // Theme from localStorage
    const storedMode = localStorage.getItem('mode');
    if (storedMode) {
      setDarkMode(storedMode === 'dark');
    }
    const handleThemeChange = (event) => {
      const newTheme = event.detail.theme;
      setDarkMode(newTheme === 'dark');
    };
    window.addEventListener('themeChange', handleThemeChange);
    
    // Fetch data from backend with dbid parameter
    const data = location.state?.visualizationData || [];
    
    // Take only the first 3 items from the data array
    const limitedData = data.slice(0, 3);
    setDataToAnalyze(limitedData);
  }, [location]);
  
  // Rest of your component code remains the same
  const handleSelectGraph = (graphType) => {
    setSelectedGraph(graphType);
    console.log(`Selected graph type: ${graphType}`);
  };
  
  return (
    <div className={`App p-6 min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <Navbar darkMode={darkMode} />
      <h1 className="text-2xl font-bold mb-4 text-center">Graph Selection Demo</h1>
      <GraphSelector data={dataToAnalyze} onSelectGraph={handleSelectGraph} />
      {selectedGraph && (
        <div className="mt-6 p-4 border rounded border-gray-400 text-center">
          <h2 className="text-lg font-bold">Selected Graph: {selectedGraph}</h2>
          <p>Here you would render the actual <strong>{selectedGraph}</strong> graph.</p>
        </div>
      )}
    </div>
  );
}

export default Selectg;