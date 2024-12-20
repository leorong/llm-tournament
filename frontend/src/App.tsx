import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import QuestionList from './components/QuestionList';
import QuestionDetails from './components/QuestionDetails';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <h1>LLM Prompts Tournament</h1>
        <Routes>
          <Route path="/" element={<QuestionList />} />
          <Route path="/questions/:questionId" element={<QuestionDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
