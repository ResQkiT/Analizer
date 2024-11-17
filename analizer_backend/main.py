from flask import Flask, request, jsonify, session

from flask_cors import CORS  # Импортируем CORS
from werkzeug.utils import secure_filename
import os
import pandas as pd
import time
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
    file_path = data.get('path')
    column = data.get('column')

    if not file_path:
        return jsonify({"error": "No file path provided"}), 400
    if not column:
        return jsonify({"error": "No column selected for analysis"}), 400

    try:
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file_path.endswith('.xls') or file_path.endswith('.xlsx'):
            df = pd.read_excel(file_path)
        else:
            return jsonify({"error": "Unsupported file format"}), 400

        if column not in df.columns:
            return jsonify({"error": f"Column '{column}' not found in the file"}), 400

        column_data = df[column]
        value_counts = column_data.value_counts().to_dict()

        return jsonify({"analysis": value_counts}), 200
    except Exception as e:
        return jsonify({"error": f"Error analyzing data: {str(e)}"}), 500

@app.route('/ai', methods=['POST'])
def ai():
    data = request.get_json()
    file_path = data.get('path')
    column = data.get('column')

    if not file_path:
        return jsonify({"error": "No file path provided"}), 400
    if not column:
        return jsonify({"error": "No column selected for analysis"}), 400

    try:
        ##AI code here

        return jsonify({"analysis": 1}), 200
    except Exception as e:
        return jsonify({"error": f"Error analyzing data: {str(e)}"}), 500
    

@app.route('/columns', methods=['GET'])
def get_columns():
    file_path = request.args.get('path')

    if not file_path:
        return jsonify({"error": "No file path provided"}), 400

    try:
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file_path.endswith('.xls') or file_path.endswith('.xlsx'):
            df = pd.read_excel(file_path)
        else:
            return jsonify({"error": "Unsupported file format"}), 400

        columns = df.columns.tolist()
        return jsonify({"columns": columns}), 200
    except Exception as e:
        return jsonify({"error": f"Error reading file: {str(e)}"}), 500
    
@app.route("/await", methods=['GET'])
def wait():
    try:
        _time = int(request.args.get('time', 0))
        time.sleep(_time)
        return jsonify({"message": f"I was waiting for {_time} seconds"}), 200
    except ValueError:
        return jsonify({"error": "Invalid time value"}), 400

if __name__ == '__main__':
    app.run(debug=True)
