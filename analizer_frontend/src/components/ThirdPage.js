import React, { useState, useEffect } from 'react';
import { redirect, useLocation, useNavigate } from 'react-router-dom';

const ThirdPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const path = location.state?.path;
    const use_tonal = location.state?.use_tonal;
    useEffect(() => {
        console.log('Path received:', path);
    }, [path]);

    const [columns, setColumns] = useState([]);
    const [allSelected, setAllSelected] = useState(false); // Флаг для отслеживания состояния кнопки

    const fetchColumns = async () => {
        try {
            const response = await fetch(`http://localhost:5000/columns?path=${encodeURIComponent(path)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const result = await response.json();
                setColumns(result.columns);
            } else {
                alert(`Ошибка при получении колонок`);
            }
        } catch (error) {
            console.error('Ошибка при получении колонок:', error);
            alert('Произошла ошибка при получении колонок');
        }
    };

    useEffect(() => {
        fetchColumns();
    }, [path]);

    const [selectedColumns, setSelectedColumns] = useState({});

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setSelectedColumns(prevState => ({
            ...prevState,
            [name]: checked,
        }));
    };

    const handleSelectAll = () => {
        const newState = !allSelected; // Переключаем состояние
        const updatedColumns = columns.reduce((acc, col) => {
            acc[col] = newState;
            return acc;
        }, {});
        setSelectedColumns(updatedColumns);
        setAllSelected(newState); // Обновляем состояние флага
    };

    const handleAnalyze = async () => {
        const selected = Object.keys(selectedColumns).filter(col => selectedColumns[col]);

        if (selected.length === 0) {
            alert('Пожалуйста, выберите хотя бы одну колонку.');
            return;
        }
        console.log(selected)
        navigate('/ai', { state: { path: path, columns: selected, use_tonal:use_tonal } });
    };

    const handleReturnBack = async () => {
        navigate('/statistic', { state: { path: path , use_tonal :use_tonal} });
    };

    return (
        <div className="container">
            <header className="header">
                <h1>Начинаем кластеризовать данные</h1>
            </header>
            <div className="content">
                <div className="checkbox-container">
                    <h2>Выберите колонки для анализа:</h2>
                    {columns.length > 0 ? (
                        <>
                            <button className="button select-all-button" onClick={handleSelectAll}>
                                {allSelected ? 'Снять все' : 'Выбрать все'}
                            </button>
                            {columns.map((col, index) => (
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
                            ))}
                        </>
                    ) : (
                        <p>Нет данных для отображения</p>
                    )}
                </div>
            </div>
            <button className="button" onClick={handleAnalyze}>Запустить анализ</button>
            <button className="button" onClick={handleReturnBack}>Вернуться назад</button>
            <footer className="footer">
                <p>&copy; 2024 Анализатор данных</p>
            </footer>
        </div>
    );
}

export default ThirdPage;
