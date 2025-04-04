import React, { useState, useEffect } from "react";
import axios from "axios";

const GEMINI_API_KEY = "AIzaSyDNjg_c9FSrG4VG4JTEjIIcTiCtxAHxdEo"; // ⚠ Replace with your API key

const GraphSelector = ({ data, onSelectGraph }) => {
  const [recommendedGraph, setRecommendedGraph] = useState(null);
  const [graphOptions, setGraphOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGraphRecommendation();
  }, []);

  const fetchGraphRecommendation = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: `Given this dataset: ${JSON.stringify(data)}, recommend the best types of graphs (bar, line, pie, scatter, area, heatmap,radar). Provide a primary recommendation and also suggest alternative graph options. Give only the names of the recommended and alternative options of the graph.`
            }]
          }]
        }
      );
      
      // Handle response properly based on Gemini API structure
      if (response.data.candidates && response.data.candidates.length > 0) {
        const content = response.data.candidates[0].content;
        if (content && content.parts && content.parts.length > 0) {
          const aiResponse = content.parts[0].text.trim().split("\n");
          setRecommendedGraph(aiResponse[0]); // First recommendation
          setGraphOptions(aiResponse.slice(1)); // Alternative graph options
        }
      }
    } catch (error) {
      console.error("Error fetching graph recommendation:", error);
      // For debugging - log the full error details
      if (error.response) {
        console.error("Response data:", error.response.data);
      }
    }
    setLoading(false);
  };

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-lg font-bold mb-2">AI-Recommended Graph</h2>

      {loading ? (
        <p>Loading AI recommendations...</p>
      ) : (
        <div>
          <p>
            <strong>Recommended Graph:</strong> {recommendedGraph}
          </p>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-2"
            onClick={() => onSelectGraph(recommendedGraph)}
          >
            Use This Graph
          </button>

          {graphOptions.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold">Other Options:</h3>
              {graphOptions.map((graph, index) => (
                <button
                  key={index}
                  className="bg-gray-300 text-black px-3 py-1 rounded m-1"
                  onClick={() => onSelectGraph(graph)}
                >
                  {graph}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GraphSelector;

