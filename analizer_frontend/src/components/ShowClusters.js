import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ShowClusters = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [images, setImages] = useState([]);
    
    const folderPath = location.state?.path; // Получаем путь к папке из состояния

    useEffect(() => {
        const fetchImages = async () => {
            if (!folderPath) {
                console.error("Путь к папке не указан");
                return;
            }

            try {
                const response = await fetch(`http://localhost:5000/images?path=${encodeURIComponent(folderPath)}`);
                const data = await response.json();
                if (response.ok && data.images) {
                    setImages(data.images);
                } else {
                    console.error(data.error || 'Ошибка загрузки изображений');
                }
            } catch (error) {
                console.error('Ошибка при запросе изображений:', error);
            }
        };

        fetchImages();
    }, [folderPath]);

    const handleReturnBack = () => {
        navigate('/ai', { state: { path: folderPath } });
    };

    if (!folderPath) {
        return <p>Путь к папке не указан.</p>;
    }

    return (
        <div className="container">
            <header className="header">
                <h1>Инструмент для сегментации людей методами машинного обучения</h1>
            </header>

            <div className="response-box">
                <div className="image-grid">
                {images.length > 0 ? (
                    images.map((image, index) => (
                        <img key={index} src={`http://localhost:5000${image}`} alt={`Image ${index}`} />
                    ))
                ) : (
                    <p>Изображения не найдены или произошла ошибка загрузки.</p>
                )}
            </div>                
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

export default ShowClusters;
