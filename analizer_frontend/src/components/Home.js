import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [selectedFile, setSelectedFile] = useState(null);
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

        try {
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                const file_path = result.path;
                //alert(result.message);
                console.log(result);
                // Перенаправляем на вторую страницу с передачей данных о колонках
                navigate('/second', { state: { columns: result.columns, path:  file_path } });

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
            <h1 className="header">Инструмент для сегментации людей методами машинного обучения</h1>
            <div className="upload-box">
                <input 
                    type="file" 
                    onChange={handleFileUpload} 
                    className="file-input"
                />
            </div>
            <button className="button" onClick={handleAnalyze}>Приступить к анализу {'->'}</button>
        </div>
    );
}

export default Home;
