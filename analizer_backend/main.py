from flask import Flask, jsonify, request, send_from_directory, session
from flask_cors import CORS
import os
import pandas as pd
import uuid
from werkzeug.utils import secure_filename
from MixedDataClusterer import MixedDataClusterer
from Ai1 import *

app = Flask(__name__)
app.secret_key = os.urandom(24)
CORS(app)

ALLOWED_EXTENSIONS = {'csv', 'xls', 'xlsx'}
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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
        # Создаем папку для пользователя
        user_id = str(uuid.uuid4())
        user_folder = os.path.join(app.config['UPLOAD_FOLDER'], user_id)
        os.makedirs(user_folder, exist_ok=True)
        
        # Сохраняем файл в папку пользователя
        filename = secure_filename(file.filename)
        save_path = os.path.join(user_folder, filename)
        file.save(save_path)
        session['user_folder'] = user_folder
        session['file_path'] = save_path
        
        try:
            if file.filename.endswith('.csv'):
                df = pd.read_csv(save_path)
            else:
                df = pd.read_excel(save_path)
            columns = df.columns.tolist()
        except Exception as e:
            return jsonify({"error": f"Ошибка при чтении файла: {str(e)}"}), 500
        
        return jsonify({
            "message": "Файл успешно загружен",
            "path": save_path,
            "user_folder": user_folder,
            "columns": columns
        }), 200
    
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
        # Construct absolute path
        abs_file_path = file_path
        
        # Check if file exists
        if not os.path.exists(abs_file_path):
            return jsonify({"error": "File not found"}), 404

        # Read file based on extension
        if abs_file_path.endswith('.csv'):
            df = pd.read_csv(abs_file_path)
        elif abs_file_path.endswith('.xls') or abs_file_path.endswith('.xlsx'):
            df = pd.read_excel(abs_file_path)
        else:
            return jsonify({"error": "Unsupported file format"}), 400

        if column not in df.columns:
            return jsonify({"error": f"Column '{column}' not found in the file"}), 400

        column_data = df[column]
        value_counts = column_data.value_counts().to_dict()

        return jsonify({"analysis": value_counts}), 200
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

@app.route('/ai', methods=['POST'])
def ai():
    data = request.get_json()
    use_tonal = data.get('use_tonal', False)
    file_path = data.get('path')
    user_folder = os.path.dirname(file_path)  # Получаем папку пользователя из пути к файлу
    columns = data.get('columns')

    if not file_path:
        return jsonify({"error": "No file path provided"}), 400
    if not columns:
        return jsonify({"error": "No column selected for analysis"}), 400

    try:

        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file_path.endswith('.xls') or file_path.endswith('.xlsx'):
            df = pd.read_excel(file_path)
        else:
            return jsonify({"error": "Unsupported file format"}), 400
        
        cust = df[columns]
        
        if use_tonal:
            cust=deep_learn_analizer(cust)
        
        clusterer = MixedDataClusterer(vector_size=200, min_cluster_size=min_cluster_size(cust.shape[0],"linear"))

        labels, descriptions = clusterer.fit_predict(cust)

        analysis_output = get_cluster_analysis_output(df, labels, descriptions)

        cust['cluster'] = labels
        print(descriptions) #словарь
        
        word_cloud(cust, user_folder + "/images") #

        return jsonify({"analysis": analysis_output}), 200
    except Exception as e:
        return jsonify({"error": f"Error analyzing data: {str(e)}"}), 500
    
@app.route("/await", methods=['GET'])
def wait():
    try:
        _time = int(request.args.get('time', 0))
        time.sleep(_time)
        return jsonify({"message": f"I was waiting for {_time} seconds"}), 200
    except ValueError:
        return jsonify({"error": "Invalid time value"}), 400


@app.route('/images', methods=['GET'])
def get_images():
    # Получаем путь из параметров запроса
    path = request.args.get('path')  
    
    if not path:
        return jsonify({"error": "No path provided"}), 400

    # Извлечение user_code из пути
    try:
        user_code = path.split(os.sep)[-2]  # Предполагаем, что код пользователя - третья папка от конца
    except IndexError:
        return jsonify({"error": "Invalid path format"}), 400

    # Проверяем директорию изображений
    user_folder = os.path.join('uploads', user_code, 'images')

    if not os.path.exists(user_folder):
        return jsonify({"error": "Directory does not exist"}), 404

    # Получаем список файлов изображений
    images = [
        f'/uploads/{user_code}/images/{filename}' for filename in os.listdir(user_folder)
        if os.path.isfile(os.path.join(user_folder, filename))
    ]

    return jsonify({"images": images}), 200


@app.route('/uploads/<path:filename>', methods=['GET'])
def serve_image(filename):
    return send_from_directory('uploads', filename)


if __name__ == '__main__':
    app.run(debug=True)
