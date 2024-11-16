import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ThirdPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const selectedColumns = location.state?.selectedColumns || [];  // Получаем данные из состояния

    const handleReturnBack = async () => {
        navigate('/');
    };

    return (
        <div className="container">
            <h1>Третья страница</h1>
            <p>Выбранные колонки для анализа:</p>
            <ul>
                {selectedColumns.map((col, index) => (
                    <li key={index}>{col}</li>
                ))}
            </ul>
            <button className="button" onClick={handleReturnBack}>{'<-'} Назад</button>
        </div>
    );
}
export default ThirdPage;