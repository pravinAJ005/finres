import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import PortfolioForm from './components/PortfolioForm';
import PortfolioView from './components/PortfolioView';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<PortfolioForm />} />
          <Route path="/portfolio/:id" element={<PortfolioView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
