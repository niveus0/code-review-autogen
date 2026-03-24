import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.tsx';
import SubmissionDetail from './pages/SubmissionDetail.tsx';
import History from './pages/History.tsx';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/submission/:id" element={<SubmissionDetail />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
  );
};

export default App;