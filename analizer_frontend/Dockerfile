# Указываем базовый образ
FROM node:18

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь проект
COPY . .

# Собираем приложение
RUN npm run build

# Используем nginx для хостинга статических файлов
FROM nginx:1.23.3
COPY --from=0 /app/build /usr/share/nginx/html

# Указываем порт
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g"]
