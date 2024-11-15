from flask import Flask, request, jsonify
from flask_cors import CORS  # Импортируем CORS

app = Flask(__name__)
CORS(app)  # Разрешаем CORS для всего приложения

@app.route('/')
def hello_world():
    return 'Hello, World!'

    

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Сохранение файла на сервере
    file.save(f"./uploads/{file.filename}")
    return jsonify({'message': 'File uploaded successfully'}), 200

if __name__ == '__main__':
    app.run(debug=True)
