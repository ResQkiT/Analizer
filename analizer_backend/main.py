from flask import Flask, request, jsonify
from flask_cors import CORS  # Импортируем CORS
import os
import pandas as pd

app = Flask(__name__)
CORS(app)  # Разрешаем CORS для всего приложения

# Разрешенные расширения файлов
ALLOWED_EXTENSIONS = {'csv', 'xls', 'xlsx'}

# Путь к директории для сохранения файлов
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Создаем директорию, если её нет

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "Файл не найден"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Файл не выбран"}), 400

    if allowed_file(file.filename):
        # Сохраняем файл в папку uploads
        save_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(save_path)
        try:
            # Чтение содержимого файла с использованием pandas
            if file.filename.endswith('.csv'):
                df = pd.read_csv(save_path)
            else:
                df = pd.read_excel(save_path)

            # Получаем список названий колонок
            columns = df.columns.tolist()

            return jsonify({"message": "Файл успешно загружен", "columns": columns}), 200
        except Exception as e:
            return jsonify({"error": f"Ошибка при обработке файла: {str(e)}"}), 400
        
    else:
        return jsonify({"error": "Недопустимый формат файла. Разрешены только CSV и Excel"}), 400

if __name__ == '__main__':
    app.run(debug=True)
