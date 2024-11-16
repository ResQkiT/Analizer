import React, { useState, useEffect } from 'react';
import { redirect, useLocation, useNavigate } from 'react-router-dom';

const AiAnalize = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const path = location.state?.path;
    const columns = location.state?.columns;

    useEffect(() => {
        console.log('Path received:', path);
        console.log('Columns received:', columns);
    }, [path, columns]);

    const handleReturnBack = async () => {
        navigate('/statistic', { state: { path: path } });
    };

    return (
        <div className="container">
            <header className="header">
                <h1>Инструмент для сегментации людей методами машинного обучения</h1>
            </header>
            <div className="info-box">
                <p>Выберите метод машинного обучения для анализа данных</p>
            </div>
            <div className="upload-box">
                <select className="select">
                    <option value="kmeans">KMeans</option>
                    <option value="dbscan">DBSCAN</option>
                    <option value="birch">Birch</option>
                </select>
            </div>
            <button className="button" onClick={handleReturnBack}>Вернуться назад</button>
            <footer className="footer">
                <p>&copy; 2023 Анализатор данных</p>
            </footer>
        </div>
    );

};

export default AiAnalize;