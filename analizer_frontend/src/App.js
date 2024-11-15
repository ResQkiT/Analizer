import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
//РПивет
function Home() {
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
                navigate('/second');
            } else {
                const result = await response.json();
                alert(`Ошибка: ${result.error}`);
            }
        } catch (error) {
            console.error('Ошибка при загрузке файла:', error);
            alert('Ошибка при загрузке файла');
            
        }
    };

    return (
        <div className="container">
            <h1 className="header">ЗАГОЛОВОК</h1>
            <div className="upload-box">
                <input 
                    type="file" 
                    onChange={handleFileUpload} 
                    className="file-input"
                />
            </div>
            <button className="analyze-button" onClick={handleAnalyze}>АНАЛИЗИРОВАТЬ</button>
        </div>
    );
}

function SecondPage() {
    return (
        <div className="container">
            <h1>Вторая страница</h1>
            <p>Файл был успешно загружен и обработан!</p>
        </div>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/second" element={<SecondPage />} />
            </Routes>
        </Router>
    );
}

export default App;
