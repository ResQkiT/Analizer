import React from 'react';
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
            <header className="header">
                <h1>Третья страница</h1>
            </header>
            <div className="info-box">
                <h2>Результат анализа:</h2>
                <p>{analysisResult}</p>
            </div>
            <button className="button" onClick={handleReturnBack}>Вернуться назад</button>
            <footer className="footer">
                <p>&copy; 2023 Анализатор данных</p>
            </footer>
        </div>
    );
};
export default ThirdPage;