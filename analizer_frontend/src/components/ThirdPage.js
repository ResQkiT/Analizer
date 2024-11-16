import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ThirdPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const analysisResult = location.state?.analysisResult;

    const handleReturnBack = () => {
        navigate('/second');
    };

    if (!analysisResult || typeof analysisResult !== 'object') {
        return <p>Ошибка: данные для анализа недоступны.</p>;
    }

    const labels = Object.keys(analysisResult);
    const dataValues = Object.values(analysisResult);

    if (labels.length === 0 || dataValues.length === 0) {
        return <p>Данные для графика отсутствуют</p>;
    }

    const data = {
        labels,
        datasets: [
            {
                label: 'Результат анализа',
                data: dataValues,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
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
                text: 'Analysis Result',
            },
        },
    };

    return (
        <div className="container">
            <header className="header">
                <h1>Третья страница</h1>
            </header>
            <div className="info-box">
                <h2>Результат анализа:</h2>
                <Bar data={data} options={options} />
            </div>
            <button className="button" onClick={handleReturnBack}>Вернуться назад</button>
            <footer className="footer">
                <p>&copy; 2023 Анализатор данных</p>
            </footer>
        </div>
    );
};

export default ThirdPage;
