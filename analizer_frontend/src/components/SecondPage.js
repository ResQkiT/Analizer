import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SecondPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const columns = location.state?.columns || [];  // Получаем данные из состояния

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
        const selectedColumnsKeys = Object.keys(selectedColumns).filter(key => selectedColumns[key]);
        if (selectedColumnsKeys.length === 0) {
            alert('Пожалуйста, выберите хотя бы одну колонку для анализа');
            return;
        }

        // Перенаправляем на третью страницу с передачей данных о выбранных колонках
        navigate('/third', { state: { selectedColumns: selectedColumnsKeys } });
    };
    
    const handleReturnBack = async () => {
        navigate('/');
    };

    return (
        <div className="container">
            <h1>Вторая страница</h1>
            <p>Файл был успешно загружен и обработан!</p>

            <h2>Выберите колонки для анализа:</h2>
            <div>
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
        </div>
    );
}

export default SecondPage;
