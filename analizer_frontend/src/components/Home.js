import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Home = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [useTonal, setUseTonal] = useState(false); // состояние для чекбокса
    const navigate = useNavigate();

    const handleFileUpload = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleAnalyze = async () => {
        if (!selectedFile) {
            alert('Пожалуйста, выберите файл перед анализом');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('use_tonal', useTonal); // добавляем параметр use_tonal

        try {
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                const path = result.path;
                const userFolder = result.user_folder;
                console.log(result);
                navigate('/statistic', { state: { path: path, userFolder: userFolder, use_tonal: useTonal } });
            } else {
                const result = await response.json();
                alert(`Требуется файл соответствующий требованиям: ${result.error}`);
            }
        } catch (error) {
            console.error('Ошибка при загрузке файла:' + error.message);
            alert('Ошибка при загрузке файла');
        }
    };

    return (
        <div className="container">
            <header className="header">
                <h1>Инструмент для сегментации людей методами машинного обучения</h1>
            </header>
            <div className="info-box">
                <p>Загрузите файл для начала статического анализа. Поддерживаются форматы CSV и Excel.</p>
            </div>
            <div className="upload-box">
                <input 
                    type="file" 
                    onChange={handleFileUpload} 
                    className="file-input"
                />
            </div>

            {/* Чекбокс для использования тональной аналитики */}
            <div className="checkbox-box">
                <label>
                    <input 
                        type="checkbox" 
                        checked={useTonal} 
                        onChange={(e) => setUseTonal(e.target.checked)} 
                    />
                    Использовать тональную аналитику
                </label>
            </div>

            <button className="button" onClick={handleAnalyze}>Приступить к анализу {'->'}</button>

            <footer className="footer">
                <p>&copy; 2023 Анализатор данных</p>
            </footer>
        </div>
    );
}

export default Home;
