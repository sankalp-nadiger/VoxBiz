import React, { useState, useEffect } from "react";
import axios from "axios";
import * as d3 from "d3"; // Assuming D3.js is used for rendering

const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";

const GraphRender = ({ data, graphType }) => {
  const [explanation, setExplanation] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAIInsights();
  }, [graphType]);

  const fetchAIInsights = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          prompt: `Given this dataset: ${JSON.stringify(
            data
          )}, and the selected graph type: ${graphType}, provide:
            - A detailed explanation of the trends shown in the graph.
            - Business insights and recommendations based on the data.`,
        }
      );

      const aiResponse = response.data.candidates[0].output.split("\n\n");
      setExplanation(aiResponse[0]); // First paragraph = Explanation
      setSuggestions(aiResponse[1]); // Second paragraph = Insights
    } catch (error) {
      console.error("Error fetching AI insights:", error);
    }
    setLoading(false);
  };

  const renderGraph = () => {
    // Example D3.js graph rendering
    const svg = d3.select("#graph-container").append("svg").attr("width", 500).attr("height", 300);

    if (graphType === "bar") {
      svg
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * 50)
        .attr("y", (d) => 300 - d.value)
        .attr("width", 40)
        .attr("height", (d) => d.value)
        .attr("fill", "blue");
    }

    // Other graph types (line, pie, etc.) can be handled here
  };

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-lg font-bold mb-2">Graph Visualization</h2>

      <div id="graph-container">{renderGraph()}</div>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-2"
        onClick={fetchAIInsights}
        disabled={loading}
      >
        {loading ? "Generating Insights..." : "Get AI Explanation & Suggestions"}
      </button>

      {explanation && (
        <div className="mt-4 p-3 bg-gray-100">
          <h3 className="font-bold">Graph Explanation:</h3>
          <p>{explanation}</p>
        </div>
      )}

      {suggestions && (
        <div className="mt-4 p-3 bg-green-100">
          <h3 className="font-bold">Business Insights:</h3>
          <p>{suggestions}</p>
        </div>
      )}
    </div>
  );
};

export default GraphRender;

