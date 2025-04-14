export const DbPreviewOption = ({ dbId, dbName, darkMode }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchPreviewData = async () => {
    if (previewData) return; // Already fetched
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Replace with your actual API endpoint
      const response = await fetch(`/api/databases/${dbId}/preview`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch preview data');
      }
      
      const data = await response.json();
      setPreviewData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMouseEnter = () => {
    setIsHovering(true);
    fetchPreviewData();
  };
  
  return (
    <div className="relative">
      <span 
        className={`text-blue-400 cursor-pointer hover:underline`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovering(false)}
      >
        {translations.previewData}
      </span>
      
      {isHovering && (
        <div 
          className={`absolute z-50 rounded-md shadow-lg p-3 transition-opacity duration-150 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}
          style={{ 
            top: '120%',
            left: '0',
            width: '300px',
            maxHeight: '250px',
            overflow: 'auto'
          }}
        >
          {isLoading ? (
            <div className="flex justify-center items-center h-20">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-xs">
              {error}
            </div>
          ) : previewData ? (
            <div>
              <h3 className="text-xs font-semibold mb-2">{dbName} - Preview</h3>
              <div className={`text-xs ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} p-2 rounded overflow-x-auto`}>
                <pre className="whitespace-pre-wrap break-words">
                  {typeof previewData === 'object' 
                    ? JSON.stringify(previewData, null, 2)
                    : previewData}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-xs">Loading preview...</div>
          )}
          
          {/* Triangle pointer */}
          <div 
            className={`absolute -top-2 left-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent ${
              darkMode ? 'border-b-gray-800' : 'border-b-white'
            }`}
          ></div>
        </div>
      )}
    </div>
  );
};