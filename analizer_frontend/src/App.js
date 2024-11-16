import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import SecondPage from './components/SecondPage';
import ThirdPage from './components/ThirdPage';
import './App.css';  // Импортируем стили

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/second" element={<SecondPage />} />
                <Route path="/third" element={<ThirdPage/>} />
            </Routes>
        </Router>
    );
}

export default App;
