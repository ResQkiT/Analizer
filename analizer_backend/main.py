from flask import Flask, request, jsonify, session

from flask_cors import CORS  # Импортируем CORS
import os
import pandas as pd
from werkzeug.utils import secure_filename

app = Flask(__name__)

app.secret_key = os.urandom(24)

CORS(app)  # Разрешаем CORS для всего приложения

# Разрешенные расширения файлов
ALLOWED_EXTENSIONS = {'csv', 'xls', 'xlsx'}

# Путь к директории для сохранения файлов
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

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
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(save_path)

        session['file_path'] = save_path
        try:
            # Чтение содержимого файла с использованием pandas
            if file.filename.endswith('.csv'):
                df = pd.read_csv(save_path)
            else:
                df = pd.read_excel(save_path)
            columns = df.columns.tolist()
        except Exception as e:
            return jsonify({"error": f"Ошибка при чтении файла: {str(e)}"}), 500
        
        return jsonify({"message": "Файл успешно загружен", "path": save_path, "columns": columns}), 200
    else:
        return jsonify({"error": "Недопустимый формат файла. Разрешены только CSV и Excel"}), 400

@app.route('/analyze', methods=['POST'])
def analyze_columns():
    data = request.get_json()
    file_path = data.get('file_path')
    columns = data.get('columns', [])

    if not file_path:
        return jsonify({"error": "No file path provided"}), 400
    if not columns:
        return jsonify({"error": "No columns selected for analysis"}), 400

    # Load the file using pandas
    try:
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file_path.endswith('.xls') or file_path.endswith('.xlsx'):
            df = pd.read_excel(file_path)
        else:
            return jsonify({"error": "Unsupported file format"}), 400

        result = df[columns].count()
        # Send the analysis result
        return jsonify({"analysis": result.to_json()}), 200
    except Exception as e:
        return jsonify({"error": f"Error analyzing data: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
