import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import loadingGif from '../assets/loading.gif';

const AiAnalize = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const path = location.state?.path;
    const [isLoading, setIsLoading] = useState(false); // Состояние загрузки
    const [responseMessage, setResponseMessage] = useState(null); // Ответ с сервера
    const [waitTime, setWaitTime] = useState(1); // Время ожидания

    const handleRequest = async () => {
        setIsLoading(true); // Устанавливаем состояние загрузки
        setResponseMessage(null); // Очищаем предыдущий ответ

        try {
            const response = await fetch(`http://localhost:5000/await?time=${waitTime}`);
            if (response.ok) {
                const result = await response.json();
                setResponseMessage(result.message); // Устанавливаем сообщение с сервера
            } else {
                setResponseMessage("Ошибка на сервере!");
            }
        } catch (error) {
            console.error('Ошибка запроса:', error);
            setResponseMessage("Произошла ошибка при запросе.");
        } finally {
            setIsLoading(false); // Отключаем состояние загрузки
        }
    };

    const handleReturnBack = () => {
        navigate('/choose_fields', { state: { path: path } });
    };

    return (
        <div className="container">
            <header className="header">
                <h1>Инструмент для сегментации людей методами машинного обучения</h1>
            </header>
            <div className="info-box">
                <p>Укажите время ожидания (в секундах) для запроса:</p>
                <input
                    type="number"
                    min="1"
                    value={waitTime}
                    onChange={(e) => setWaitTime(e.target.value)}
                    className="input"
                />
                <button className="button" onClick={handleRequest}>
                    Отправить запрос
                </button>
            </div>

            <div className="response-box">
                {isLoading ? (
                    <div className="loading-container">
                        <img style={{ width: '100px' }}
                            src={loadingGif}
                            alt="Загрузка..." 
                            className="loading-gif" 
                        />
                        <p>Пожалуйста, подождите, запрос выполняется...</p>
                    </div>
                ) : (
                    responseMessage && <p>{responseMessage}</p>
                )}
            </div>

            <button className="button" onClick={handleReturnBack}>
                Вернуться назад
            </button>
            <footer className="footer">
                <p>&copy; 2023 Анализатор данных</p>
            </footer>
        </div>
    );
};

export default AiAnalize;
