import React, { useState } from 'react';
import GraphSelector from './GraphSelector';

function Selectg() {
  const [selectedGraph, setSelectedGraph] = useState(null);
  const sampleData = {
    sales: [
      { month: "Jan", region: "North ", value: 1000, growth: 3.5 },
       { month: "Feb", region: "North", value: 1350, growth: 12.5 },
      { month: "Mar", region: "North", value: 1500, growth: 11.1 },
    ],
    marketShare: [
      { region: " ", percentage: 0 },
    ],
    salesByCategory: [
      { category: " ", value: 0 },
    ],
    performanceMetrics: [
      { employee: "Alice", sales: 28500, customerSatisfaction: 9.2, returningCustomers: 78 },
      { employee: "Bob", sales: 31200, customerSatisfaction: 8.7, returningCustomers: 65 },
      { employee: "Charlie", sales: 26800, customerSatisfaction: 9.5, returningCustomers: 82 },
      { employee: "Diana", sales: 35100, customerSatisfaction: 8.9, returningCustomers: 71 },
      { employee: "Evan", sales: 29700, customerSatisfaction: 9.0, returningCustomers: 75 }
    ]
  };
  
  // You can choose which part of the dataset to analyze
  const dataToAnalyze = sampleData.sales; // or any other part of the dataset
  
  const handleSelectGraph = (graphType) => {
    setSelectedGraph(graphType);
    console.log(`Selected graph type: ${graphType}`);
    // Here you would render the actual graph based on the selection
  };

  return (
    <div className="App p-6">
      <h1 className="text-2xl font-bold mb-4">Graph Selection Demo</h1>
      <GraphSelector 
        data={dataToAnalyze} 
        onSelectGraph={handleSelectGraph} 
      />
      
      {selectedGraph && (
        <div className="mt-6 p-4 border rounded">
          <h2 className="text-lg font-bold">Selected Graph: {selectedGraph}</h2>
          <p>Here you would render the actual {selectedGraph} graph.</p>
        </div>
      )}
    </div>
  );
}

export default Selectg;