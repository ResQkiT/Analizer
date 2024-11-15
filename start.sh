#!/bin/bash

# Запуск React-приложения и Flask-сервера одновременно

# Запускаем React
echo "Запуск React-приложения..."
cd analizer_frontend || exit
npm start &

# Запускаем Flask-сервер
echo "Запуск Flask-сервера..."
cd analizer_backend || exit
flask run --host=0.0.0.0 --port=5000 &

# Ожидаем завершения обоих процессов
wait
