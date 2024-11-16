import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import SecondPage from './components/SecondPage';
import ThirdPage from './components/ThirdPage';
import AiAnalize from './components/AIAnalize';

import './App.css';  // Импортируем стили

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/statistic" element={<SecondPage />} />
                <Route path="/choose_fields" element={<ThirdPage/>} />
                <Route path="/ai" element={<AiAnalize/>} />
            </Routes>
        </Router>
    );
}

export default App;
