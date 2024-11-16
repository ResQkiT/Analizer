import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const SecondPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const columns = location.state?.columns || [];  // Получаем данные из состояния
    const path = location.state?.path;

    useEffect(() => {
        console.log('Path received:', path);
    }, [path]);

    const handleCheckboxChange = (event) => {
        console.log(event.target );
        console.log(event.target.checked);
        const { name, checked } = event.target;
        setSelectedColumns(prevState => ({
            ...prevState,
            [name]: checked,
        }));
    };

    const [selectedColumns, setSelectedColumns] = useState(
        columns.reduce((acc, column) => {
            acc[column] = false; // Изначально все чекбоксы не выбраны
            return acc;
        }, {})
    );

    const handlReadCheckboxesAndStartAnalize = async () => {
        const selected = Object.keys(selectedColumns).filter(col => selectedColumns[col]);
    
        if (selected.length === 0) {
            alert('Пожалуйста, выберите хотя бы одну колонку.');
            return;
        }
    
        try {
            // Отправляем выбранные колонки на сервер
            const response = await fetch('http://localhost:5000/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body:   JSON.stringify({ columns: selected, file_path: path }),
            });
    
            if (response.ok) {
                const result = await response.json();
                // Перенаправляем на третью страницу с результатами
                navigate('/third', { state: { analysisResult: result.analysis } });
            } else {
                const result = await response.json();
                alert(`Ошибка при анализе: ${result.error}`);
            }
        } catch (error) {
            console.error('Ошибка при отправке данных на сервер:', error);
            alert('Произошла ошибка при отправке данных');
        }
    };

    const handleReturnBack = async () => {
        navigate('/');
    };

    return (
        <div className="container">
            <header className="header">
                <h1>Вторая страница</h1>
            </header>
            <div className="info-box">
                <p>Файл был успешно загружен и обработан! Выберите колонки для анализа:</p>
            </div>
            <div className="checkbox-container">
                {columns.length > 0 ? (
                    columns.map((col, index) => (
                        <div key={index} className="checkbox-item">
                            <input
                                type="checkbox"
                                id={col}
                                name={col}
                                checked={selectedColumns[col] || false}
                                onChange={handleCheckboxChange}
                            />
                            <label htmlFor={col}>{col}</label>
                        </div>
                    ))
                ) : (
                    <p>Нет данных для отображения</p>
                )}
            </div>
            <button className="button" onClick={handlReadCheckboxesAndStartAnalize}>Запустить анализ по выбранным колонкам</button>
            <button className="button" onClick={handleReturnBack}>Вернуться назад</button>
            <footer className="footer">
                <p>&copy; 2023 Анализатор данных</p>
            </footer>
        </div>
    );
}

export default SecondPage;
