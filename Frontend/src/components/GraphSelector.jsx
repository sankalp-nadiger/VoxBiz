import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRedirect } from './redirect';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const GraphSelector = ({ data, onSelectGraph }) => {
   const [darkMode, setDarkMode] = useState(false);
  const [recommendedGraph, setRecommendedGraph] = useState(null);
  const [graphOptions, setGraphOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const redirect = useRedirect();
  const handleSelect = (event) => {
    onSelectGraph(event.target.value);
  };
  useEffect(() => {
    if (data && Array.isArray(data) && data.length > 0) {
      fetchGraphRecommendation();
    } else {
      setError("No data available for analysis. Please provide valid data.");
    }
  }, [data]);

  const fetchGraphRecommendation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const dataDescription = JSON.stringify(data, null, 2);

      const prompt = `
Data sample:
${dataDescription}

Based on this dataset, recommend the best graph type for visualization.
First, provide your primary recommendation as "Primary: [graph type]".
Then, list 2-3 alternative graph options as "Alternative: [graph type]".
Only include the graph type names from these options: bar, line, pie, area.
`;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }]
        }
      );

      if (response.data.candidates?.length > 0) {
        const aiText = response.data.candidates[0].content.parts[0].text.trim();

        const primaryMatch = aiText.match(/Primary: ([\w\s]+)/i);
        const alternativeMatches = aiText.match(/Alternative: ([\w\s]+)/gi);

        if (primaryMatch) {
          setRecommendedGraph(primaryMatch[1].trim());
        }

        if (alternativeMatches) {
          const alternatives = alternativeMatches.map(match =>
            match.replace(/Alternative: /i, "").trim()
          );
          setGraphOptions(alternatives);
        }
      } else {
        setError("No recommendations received from AI. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to get graph recommendations. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background Image with lower opacity */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 z-0"
        style={{
          backgroundImage: "url('/history-bg.png')"
        }}
      />
  
      {/* Foreground UI box */}
      <div className="relative z-10 bg-white bg-opacity-90 backdrop-blur-md p-8 rounded-lg shadow-2xl max-w-lg w-full  mx-auto w-fit">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 AI-Recommended Graph</h2>
  
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-3 text-gray-700 font-medium">Loading recommendations...</span>
          </div>
        ) : error ? (
          <div className="text-red-600">
            <p>{error}</p>
            <button
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={fetchGraphRecommendation}
            >
              Retry
            </button>
          </div>
        ) : recommendedGraph ? (
          <div>
            <p className="mb-3 text-lg">
              <span className="font-semibold text-green-700">Recommended Graph:</span> {recommendedGraph}
            </p>
            <button
              className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
              onClick={() => redirect("/rendergraph")}
            >
              Use This Graph
            </button>
  
            {graphOptions.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-800 mb-2">Alternative Options:</h3>
                <div className="flex flex-wrap gap-2">
                  {graphOptions.map((graph, index) => (
                    <button
                      key={index}
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                      onClick={() => onSelectGraph(graph)}
                    >
                      {graph}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="text-gray-700 mb-3">Click the button below to get graph suggestions from AI.</p>
            <button
              className="bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600"
              onClick={fetchGraphRecommendation}
            >
              Analyze Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
}  

export default GraphSelector;
