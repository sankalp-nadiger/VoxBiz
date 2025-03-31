import React, { useState, useEffect } from "react";
import axios from "axios";

const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"; // ⚠ Replace with your API key

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
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          prompt: `Given this dataset: ${JSON.stringify(
            data
          )}, recommend the best types of graphs (bar, line, pie, scatter, area, heatmap). Provide a primary recommendation and also suggest alternative graph options.`,
        }
      );

      const aiResponse = response.data.candidates[0].output.trim().split("\n");

      setRecommendedGraph(aiResponse[0]); // First recommendation
      setGraphOptions(aiResponse.slice(1)); // Alternative graph options
    } catch (error) {
      console.error("Error fetching graph recommendation:", error);
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

