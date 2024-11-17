import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Bar,
    Line,
    Pie,
    Doughnut,
    Radar,
    PolarArea,
} from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    RadialLinearScale,
} from 'chart.js';

// Регистрация компонентов для графиков
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    RadialLinearScale
);

const SecondPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const path = location.state?.path;
    const use_tonal = location.state?.use_tonal;
    const [columns, setColumns] = useState([]);

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

    useEffect(() => {
        console.log('Path received:', path);
    }, [path]);

    const [selectedColumn, setSelectedColumn] = useState('');
    const [chartData, setChartData] = useState(null);
    const [chartType, setChartType] = useState('Bar');

    const handleRadioChange = async (event) => {
        const column = event.target.value;
        setSelectedColumn(column);

        try {
            const response = await fetch('http://localhost:5000/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ column: column,  path: path}),
            });

            if (response.ok) {
                const result = await response.json();
                setChartData(result.analysis);
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
    
    const handleNextPage = async () => {
        navigate('/choose_fields', { state: { path: path, use_tonal : use_tonal } });
    };

    const renderChart = () => {
        if (!chartData) {
            return <p>Здесь будет отображаться график после анализа</p>;
        }
    
        const labels = Object.keys(chartData);
        const dataValues = Object.values(chartData);
    
        // Генерация цветов
        const generateColors = (numColors) => {
            const colors = [];
            for (let i = 0; i < numColors; i++) {
                const r = Math.floor(Math.random() * 256);
                const g = Math.floor(Math.random() * 256);
                const b = Math.floor(Math.random() * 256);
                colors.push(`rgba(${r}, ${g}, ${b}, 0.6)`); // Прозрачность 0.6
            }
            return colors;
        };
    
        const backgroundColors = generateColors(dataValues.length);
        const borderColors = backgroundColors.map((color) => color.replace('0.6', '1')); // Устанавливаем прозрачность 1 для границ
    
        const data = {
            labels,
            datasets: [
                {
                    label: 'Результат анализа',
                    data: dataValues,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1,
                },
            ],
        };
    
        const options = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Результат анализа',
                },
            },
        };
    
        switch (chartType) {
            case 'Bar':
                return <Bar data={data} options={options} />;
            case 'Line':
                return <Line data={data} options={options} />;
            case 'Pie':
                return <Pie data={data} options={options} />;
            case 'Doughnut':
                return <Doughnut data={data} options={options} />;
            case 'Radar':
                return <Radar data={data} options={options} />;
            case 'PolarArea':
                return <PolarArea data={data} options={options} />;
            default:
                return <Bar data={data} options={options} />;
        }
    };

    return (
        <div className="container">
            <header className="header">
                <h1>Статистическая информация по файлу</h1>
            </header>
            <div className="content">
                <div className="radio-container">
                    <h2>Выберите колонку для анализа:</h2>
                    {columns.length > 0 ? (
                        columns.map((col, index) => (
                            <div key={index} className="radio-item">
                                <input
                                    type="radio"
                                    id={col}
                                    name="column"
                                    value={col}
                                    checked={selectedColumn === col}
                                    onChange={handleRadioChange}
                                />
                                <label htmlFor={col}>{col}</label>
                            </div>
                        ))
                    ) : (
                        <p>Нет данных для отображения</p>
                    )}
                    <div className="chart-controls">
                        <label htmlFor="chartType">Выберите тип графика: </label>
                        <select
                            id="chartType"
                            value={chartType}
                            onChange={(e) => setChartType(e.target.value)}
                        >
                            <option value="Bar">Bar</option>
                            <option value="Line">Line</option>
                            <option value="Pie">Pie</option>
                            <option value="Doughnut">Doughnut</option>
                            <option value="Radar">Radar</option>
                            <option value="PolarArea">PolarArea</option>
                        </select>
                    </div>
                </div>
                <div className="chart-container">
                    
                    {renderChart()}
                </div>
            </div>
            <button className="button" onClick={handleNextPage}>Перейти к анализу методами машинного обучения</button>
            <button className="button" onClick={handleReturnBack}>Вернуться назад</button>
            <footer className="footer">
                <p>&copy; 2023 Анализатор данных</p>
            </footer>
        </div>
    );
}

export default SecondPage;