# Указываем базовый образ
FROM python:3.9-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем зависимости и устанавливаем их
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем приложение
COPY . .

# Указываем порт, который будет использовать Flask
EXPOSE 5000

# Указываем команду для запуска приложения
CMD ["python", "main.py"]