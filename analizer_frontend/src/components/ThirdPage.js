import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ThirdPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const analysisResult = location.state?.analysisResult || "Нет результатов для отображения.";

    const handleReturnBack = () => {
        navigate('/second');
    };

    return (
        <div className="container">
            <h1>Третья страница</h1>
            <h2>Результат анализа:</h2>
            <p>{analysisResult}</p>
            <button className="button" onClick={handleReturnBack}>Вернуться назад</button>
        </div>
    );
};
export default ThirdPage;