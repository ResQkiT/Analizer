import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import loadingGif from '../assets/loading.gif';

const AiAnalize = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const path = location.state?.path; // Путь к файлу
    const selectedColumns = location.state?.columns; // Выбранные колонки
    const use_tonal = location.state?.use_tonal;

    const [isLoading, setIsLoading] = useState(true); // Состояние загрузки
    const [responseMessage, setResponseMessage] = useState(null); // Ответ с сервера

    useEffect(() => {
        const sendRequest = async () => {
            const payload = {
                path: path || "/path/to/your/file.csv", // Путь к файлу
                columns: selectedColumns, // Используем выбранные колонки
                use_tonal: use_tonal, // Пример флага для анализа
            };

            try {
                const response = await fetch("http://localhost:5000/ai", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                if (response.ok) {
                    const result = await response.json();
                    setResponseMessage(result.analysis); // Устанавливаем результат анализа
                } else {
                    const error = await response.json();
                    setResponseMessage(error.error || "Ошибка на сервере!");
                }
            } catch (error) {
                console.error("Ошибка запроса:", error);
                setResponseMessage("Произошла ошибка при запросе.");
            } finally {
                setIsLoading(false); // Отключаем состояние загрузки
            }
        };

        sendRequest(); // Отправляем запрос при загрузке страницы
    }, [path, selectedColumns]);

    const handleReturnBack = () => {
        navigate('/choose_fields', { state: { path: path } });
    };
    const showClustesImages = () => {
        navigate('/show_clusters', { state: { path: path } });
    }

    const formatResponse = (response) => {
        // Предположим, что response - это строка с анализом, и разделим её на строки
        return response.split('\n').map((line, index) => <p key={index}>{line}</p>);
    };

    return (
        <div className="container">
            <header className="header">
                <h1>Инструмент для сегментации людей методами машинного обучения</h1>
            </header>

            <div className="response-box">
                {isLoading ? (
                    <div className="loading-container">
                        <img
                            style={{ width: '100px' }}
                            src={loadingGif}
                            alt="Загрузка..."
                            className="loading-gif"
                        />
                        <p>Пожалуйста, подождите, запрос выполняется...</p>
                    </div>
                ) : (
                    responseMessage && (
                        <div className=".json-container">
                            <h2>Результат анализа:</h2>
                            {formatResponse(responseMessage)}
                        </div>
                    )
                )}
            </div>
            <button className='button' onClick={showClustesImages}>
                Показать кластеры
            </button>
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
