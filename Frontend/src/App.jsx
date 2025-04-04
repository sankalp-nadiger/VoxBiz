import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signin from "./components/Signin";
import Signup from "./components/Signup";
import GraphSelector from "./components/GraphSelector";
import QueryProcessor from "./components/QueryProcessor";
import GraphRender from "./components/GraphRender";
import Selectg from "./components/Selectgraph";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/query" element={<QueryProcessor/>}/>
        <Route path="/selectgraph" element={<GraphSelector/>}/>
        <Route path="/rendergraph" element={<GraphRender/>}/>
        <Route path="/selgraph" element={<Selectg/>}/>
      </Routes>
    </Router>
  );
};

export default App;